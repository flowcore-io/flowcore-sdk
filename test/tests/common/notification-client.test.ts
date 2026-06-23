import { assertEquals } from "@test/compat/assert"
import { describe, it } from "bun:test"
import { Subject } from "rxjs"
import { NotificationClient, type NotificationEvent } from "../../../src/common/notification-client.ts"
import type { Logger } from "../../../src/utils/logger.ts"

function recordingLogger(): Logger & { calls: Record<keyof Logger, string[]> } {
  const calls: Record<keyof Logger, string[]> = { debug: [], info: [], warn: [], error: [] }
  return {
    calls,
    debug: (m) => calls.debug.push(m),
    info: (m) => calls.info.push(m),
    warn: (m) => calls.warn.push(m),
    error: (m) => calls.error.push(String(m)),
  }
}

function makeClient() {
  const observer = new Subject<NotificationEvent>()
  const events: NotificationEvent[] = []
  observer.subscribe((e) => events.push(e))
  const logger = recordingLogger()
  const client = new NotificationClient(
    observer,
    { apiKey: "test-key" },
    { tenant: "t", dataCore: "dc" },
    { logger },
  )
  // handleMessage is the internal frame parser the WebSocket onmessage delegates to.
  const handle = (raw: string) => (client as unknown as { handleMessage(raw: string): void }).handleMessage(raw)
  return { handle, events, logger }
}

function validFrame(pattern = "event.stored.x"): string {
  const inner = JSON.stringify({
    pattern,
    data: {
      tenantId: "t",
      eventId: "evt-1",
      dataCore: "dc",
      aggregator: "fishfacts-ais.0",
      eventType: "ais.position.fix.observed.0",
      validTime: "2026-01-01T00:00:00Z",
    },
  })
  return JSON.stringify({ message: inner })
}

describe("NotificationClient.handleMessage", () => {
  it("emits a NotificationEvent for a well-formed frame", () => {
    const { handle, events } = makeClient()
    handle(validFrame())
    assertEquals(events.length, 1)
    assertEquals(events[0].pattern, "event.stored.x")
    assertEquals(events[0].data.eventId, "evt-1")
    assertEquals(events[0].data.flowType, "fishfacts-ais.0")
  })

  // Regression: a single malformed frame must NOT throw. In production handleMessage
  // runs inside the WebSocket onmessage callback, so an uncaught throw here crashes
  // the whole process (observed repeatedly in prod via an unguarded JSON.parse).
  it("does not throw or emit when data.message is not valid JSON", () => {
    const { handle, events, logger } = makeClient()
    handle(JSON.stringify({ message: "this-is-not-json{" }))
    assertEquals(events.length, 0)
    assertEquals(logger.calls.warn.length >= 1, true)
  })

  it("does not throw when message is empty or missing", () => {
    const { handle, events } = makeClient()
    handle(JSON.stringify({ message: "" }))
    handle(JSON.stringify({ foo: "bar" }))
    assertEquals(events.length, 0)
  })

  it("does not throw when the inner payload lacks a data field", () => {
    const { handle, events } = makeClient()
    handle(JSON.stringify({ message: JSON.stringify({ pattern: "p" }) }))
    assertEquals(events.length, 0)
  })

  it("does not throw on a non-JSON outer frame", () => {
    const { handle, events } = makeClient()
    handle("not even json")
    assertEquals(events.length, 0)
  })

  it("handles validation frames without emitting", () => {
    const { handle, events, logger } = makeClient()
    handle(JSON.stringify({ type: "validation", summary: "bad", message: "nope", found: "x", errors: [] }))
    assertEquals(events.length, 0)
    assertEquals(logger.calls.error.length >= 1, true)
  })
})
