import { Observable, Subject } from "rxjs"
import { CustomCommand } from "../../common/command-custom.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { type ComputeLogStreamEvent, ComputeLogStreamEventSchema } from "../../contracts/compute.ts"
import { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload log stream command
 */
export interface ComputeWorkloadLogStreamInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** Restrict to one container by name; defaults server-side to the pod's first container */
  container?: string
  /** How much history to replay before following, 0..1000 (defaults to 100 server-side) */
  tailLines?: number
}

/**
 * An active live log stream.
 *
 * Mirrors `ActiveStreamInterface` from `websocket-command.ts` — the SDK's
 * existing streaming shape — minus `send`, because SSE is one-directional.
 */
export interface ComputeWorkloadLogStream {
  /**
   * An Observable emitting one value per `event: log` frame, in wire order.
   *
   * Reading only STARTS on the first subscription, so no frame is dropped
   * between the connection opening and the caller subscribing. From then on it
   * is hot and shared: a second, later subscriber joins mid-stream and sees
   * only what arrives after it.
   *
   * Completes when the server closes the stream or `disconnect()` is called,
   * and errors if the stream breaks mid-flight. `event: heartbeat` frames keep
   * the connection alive and are deliberately NOT emitted here.
   */
  output$: Observable<ComputeLogStreamEvent>

  /**
   * Closes the stream. Aborts the underlying fetch — the server sees the
   * disconnect and tears down its upstream Kubernetes followers — and
   * completes `output$`. Idempotent.
   */
  disconnect(): void
}

/** Fields of one parsed SSE frame. */
interface SseFrame {
  event: string
  data: string
}

/**
 * Incremental Server-Sent Events parser.
 *
 * Per the SSE wire format: frames are separated by a BLANK line, a line
 * beginning with `:` is a comment and is ignored, a field is `name:value`
 * with ONE optional leading space stripped from the value, and repeated
 * `data:` fields are joined with `\n`. A frame with no `event:` field
 * defaults to `message`.
 */
function createSseParser(onFrame: (frame: SseFrame) => void): (chunk: string) => void {
  let buffer = ""
  let eventName = ""
  let dataLines: string[] = []
  let sawField = false

  const dispatch = () => {
    if (!sawField) {
      // A blank line with nothing before it — keep-alive padding, not a frame.
      return
    }
    const frame: SseFrame = { event: eventName || "message", data: dataLines.join("\n") }
    eventName = ""
    dataLines = []
    sawField = false
    onFrame(frame)
  }

  return (chunk: string) => {
    // Normalise CR and CRLF line endings to LF before splitting.
    buffer += chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
    const lines = buffer.split("\n")
    // The trailing element is an incomplete line — hold it until more arrives.
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      if (line === "") {
        dispatch()
        continue
      }
      if (line.startsWith(":")) {
        continue
      }
      const separator = line.indexOf(":")
      const field = separator === -1 ? line : line.slice(0, separator)
      let value = separator === -1 ? "" : line.slice(separator + 1)
      if (value.startsWith(" ")) {
        value = value.slice(1)
      }
      if (field === "event") {
        eventName = value
        sawField = true
      } else if (field === "data") {
        dataLines.push(value)
        sawField = true
      }
      // `id` and `retry` are valid SSE fields this stream never uses.
    }
  }
}

/**
 * Stream live container logs for a workload over Server-Sent Events.
 *
 * `GET /api/v1/workloads/{workloadId}/logs/stream` answers
 * `text/event-stream` and emits `event: log` frames whose `data` is a
 * `ComputeLogStreamEvent`, interleaved with `event: heartbeat` frames on an
 * idle stream. The heartbeats are consumed here and never surfaced.
 *
 * This is a `CustomCommand` because it owns its own transport: the normal
 * command path calls `response.json()` unconditionally, which would consume
 * the stream before the first frame could be read. It authenticates with
 * `client.getAuthHeader()` — the very same header every other command sends.
 *
 * Errors are raised BEFORE the stream opens, so the HTTP status is still
 * meaningful: a 404 (unknown workload, or one with no running pods) throws
 * `NotFoundException`, and 502/503 throw `ClientError` — the same mapping the
 * other compute commands use. Once the stream is open, failures surface on
 * `output$`.
 *
 * ```typescript
 * const stream = await client.execute(new ComputeWorkloadLogStreamCommand({
 *   workloadId: "3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11",
 * }))
 * const subscription = stream.output$.subscribe((event) => console.log(event.line))
 * // later
 * stream.disconnect()
 * subscription.unsubscribe()
 * ```
 */
/**
 * The human-readable message inside an `event: error` frame.
 *
 * The service sends `{"message": "..."}`, but a mid-stream failure is exactly
 * the moment not to add a second failure mode: if the payload is not the JSON
 * we expect, fall back to the raw text rather than throwing inside the parser.
 */
function errorFrameMessage(data: string): string {
  try {
    const parsed: unknown = JSON.parse(data)
    if (typeof parsed === "object" && parsed !== null && "message" in parsed) {
      const { message } = parsed as { message: unknown }
      if (typeof message === "string" && message.length > 0) {
        return message
      }
    }
  } catch {
    // fall through to the raw payload
  }
  return data || "The log stream failed after it had started"
}

export class ComputeWorkloadLogStreamCommand extends CustomCommand<
  ComputeWorkloadLogStreamInput,
  ComputeWorkloadLogStream
> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://compute.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    if (this.input.container !== undefined) {
      queryParams.set("container", this.input.container)
    }
    if (this.input.tailLines !== undefined) {
      queryParams.set("tailLines", this.input.tailLines.toString())
    }
    const qs = queryParams.toString()
    const path = `/api/v1/workloads/${this.input.workloadId}/logs/stream`
    return qs ? `${path}?${qs}` : path
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId,
      })
    }
    throw error
  }

  /**
   * Custom execute method — opens the SSE connection and returns the stream
   */
  protected override async customExecute(client: FlowcoreClient): Promise<ComputeWorkloadLogStream> {
    const authHeader = await client.getAuthHeader()
    const abortController = new AbortController()

    const response = await fetch(`${this.getBaseUrl()}${this.getPath()}`, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      signal: abortController.signal,
    })

    // Pre-stream errors: the status is only meaningful up to the first chunk,
    // and the service produces 404/502/503 before it writes any, so this is
    // the one place they can be mapped.
    if (!response.ok) {
      const body = await response.json().catch(() => undefined)
      const error = new ClientError(
        `${this.constructor.name} failed with ${response.status}: ${response.statusText}`,
        response.status,
        this.constructor.name,
        body,
      )
      this.handleClientError(error)
      throw error
    }

    if (!response.body) {
      throw new ClientError("Log stream response had no body", 0, this.constructor.name, {
        workloadId: this.input.workloadId,
      })
    }

    const subject = new Subject<ComputeLogStreamEvent>()
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    const push = createSseParser((frame) => {
      // An `error` frame is how the service reports a failure that happens
      // AFTER the 200 is committed — the bridge throwing mid-stream. It must
      // reach the subscriber as an error: dropping it would end the stream
      // with a normal completion, and the caller could not tell "the logs
      // ended" from "streaming broke". Its data is `{"message": "..."}`.
      if (frame.event === "error") {
        subject.error(
          // The message goes in the BODY as well as the message slot:
          // ClientError renders `body` in preference to `message`, so text
          // passed only as the message would never reach the reader.
          new ClientError(errorFrameMessage(frame.data), 0, this.constructor.name, {
            workloadId: this.input.workloadId,
            message: errorFrameMessage(frame.data),
          }),
        )
        return
      }
      // Only `log` frames carry a ComputeLogStreamEvent. `heartbeat` (whose
      // data is a bare ISO-8601 string, not JSON, so the filter MUST precede
      // the parse) and any frame kind the service adds later are consumed
      // silently.
      if (frame.event !== "log") {
        return
      }
      subject.next(parseResponseHelper(ComputeLogStreamEventSchema, JSON.parse(frame.data)))
    })

    const pump = async () => {
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          push(decoder.decode(value, { stream: true }))
        }
      } catch (error) {
        // An abort is the normal disconnect path, not a failure.
        if (!abortController.signal.aborted) {
          subject.error(error instanceof Error ? error : new Error(String(error)))
          return
        }
      }
      subject.complete()
    }
    // The pump is started by the FIRST subscription, not here: an SSE body can
    // already be buffered by the time `execute()` resolves, and draining it
    // eagerly would push every frame into a Subject nobody is listening to yet.
    let started = false
    const output$ = new Observable<ComputeLogStreamEvent>((subscriber) => {
      const subscription = subject.subscribe(subscriber)
      if (!started) {
        started = true
        void pump()
      }
      return subscription
    })

    return {
      output$,
      disconnect: () => {
        if (abortController.signal.aborted) {
          return
        }
        abortController.abort()
        void reader.cancel().catch(() => {})
        subject.complete()
      },
    }
  }
}
