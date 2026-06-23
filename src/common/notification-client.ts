import type { Subject } from "rxjs"
import { WebSocket as NodeWebSocket } from "ws"
import { defaultLogger, type Logger } from "../utils/logger.ts"
import { FlowcoreClient } from "./flowcore-client.ts"
import { Buffer } from "node:buffer"
import { DataCoreFetchCommand } from "../commands/data-core/data-core.fetch.ts"
import { FlowTypeFetchCommand } from "../commands/flow-type/flow-type.fetch.ts"
import type { FlowType } from "../contracts/flow-type.ts"
import type { EventType } from "../contracts/event-type.ts"
import { EventTypeFetchCommand } from "../commands/event-type/event-type.fetch.ts"

type BufferType = Uint8Array & { toString(): string }
const WebSocketConstructor = globalThis.WebSocket ?? NodeWebSocket

/**
 * Represents an event notification from the Flowcore system
 */
export type NotificationEvent = {
  pattern: string
  data: {
    tenant: string
    eventId: string
    dataCoreId: string
    flowType: string
    eventType: string
    validTime: string
  }
}

/**
 * Interface for OIDC authentication client
 */
export type OidcClient = {
  getToken: () => Promise<{
    accessToken: string
  }>
}

/**
 * Internal type representing the raw notification event data from the server
 */
type NotificationEventData = {
  tenantId: string
  eventId: string
  dataCore: string
  aggregator: string
  eventType: string
  validTime: string
}

/**
 * Configuration options for the NotificationClient
 */
export type NotificationClientOptions = {
  reconnectInterval: number
  maxReconnects?: number
  maxEvents?: number
  logger?: Logger
}

// Maximum reconnection interval in milliseconds
const MAX_RECONNECT_INTERVAL = 30_000

interface NotificationClientAuthOptionsBearer {
  oidcClient: OidcClient
}

interface NotificationClientAuthOptionsApiKey {
  apiKey: string
  apiKeyId?: string
}

type NotificationClientAuthOptions =
  | NotificationClientAuthOptionsBearer
  | NotificationClientAuthOptionsApiKey

/**
 * Client for handling WebSocket connections to the Flowcore notification system.
 * Manages connection lifecycle, authentication, and event handling.
 */
export class NotificationClient {
  private url = "wss://tenant.api.flowcore.io/notifications"
  private webSocket!: WebSocket
  private options: NotificationClientOptions
  private logger: Logger
  private eventCount = 0
  private reconnectInterval: number
  private reconnectAttempts = 0
  private _isOpen: boolean = false
  private _isConnecting: boolean = false

  /**
   * Creates a new NotificationClient instance
   * @param observer - RxJS Subject for emitting notification events
   * @param authOptions - Auth options for the client
   * @param subscriptionSpec - Specification for what notifications to subscribe to
   * @param options - Configuration options for the client
   */
  constructor(
    private readonly observer: Subject<NotificationEvent>,
    private readonly authOptions: NotificationClientAuthOptions,
    private readonly subscriptionSpec: {
      tenant: string
      dataCore: string
      flowType?: string
      eventType?: string
    },
    options?: Partial<NotificationClientOptions>,
  ) {
    this.options = {
      reconnectInterval: 1000,
      ...options,
    }
    this.logger = options?.logger ?? defaultLogger
    this.reconnectInterval = options?.reconnectInterval ?? 1000
  }

  /**
   * Is the websocket connection open
   */
  public get isOpen(): boolean {
    return this._isOpen
  }

  /**
   * Is the websocket connection currently connecting
   */
  public get isConnecting(): boolean {
    return this._isConnecting
  }

  /**
   * Establishes WebSocket connection and sets up event handlers
   */
  async connect() {
    if (this._isConnecting || this._isOpen) {
      this.logger.debug("Is already connecting or open")
      return
    }

    this._isConnecting = true

    let flowcoreClient: FlowcoreClient | null = null
    const urlParams = new URLSearchParams()

    if ("oidcClient" in this.authOptions) {
      const oidcClient = this.authOptions.oidcClient
      flowcoreClient = new FlowcoreClient({
        getBearerToken: async () => (await oidcClient.getToken()).accessToken,
      })
      urlParams.set("token", (await oidcClient.getToken()).accessToken)
    } else {
      flowcoreClient = new FlowcoreClient({
        apiKey: this.authOptions.apiKey,
        ...(this.authOptions.apiKeyId ? { apiKeyId: this.authOptions.apiKeyId } : {}),
      })
      urlParams.set("api_key", this.authOptions.apiKey)
      if (this.authOptions.apiKeyId) {
        urlParams.set("api_key_id", this.authOptions.apiKeyId)
      }
    }

    const dataCore = await flowcoreClient.execute(
      new DataCoreFetchCommand({
        tenant: this.subscriptionSpec.tenant,
        dataCore: this.subscriptionSpec.dataCore,
      }),
    )

    let flowType: FlowType | undefined
    let eventType: EventType | undefined
    if (this.subscriptionSpec.flowType) {
      flowType = await flowcoreClient.execute(
        new FlowTypeFetchCommand({
          dataCoreId: dataCore.id,
          flowType: this.subscriptionSpec.flowType,
        }),
      )

      if (this.subscriptionSpec.eventType) {
        eventType = await flowcoreClient.execute(
          new EventTypeFetchCommand({
            flowTypeId: flowType?.id,
            eventType: this.subscriptionSpec.eventType,
          }),
        )
      }
    }

    this.webSocket = new WebSocketConstructor(`${this.url}?${urlParams.toString()}`) as unknown as WebSocket

    this.webSocket.onopen = () => {
      this._isOpen = true
      this._isConnecting = false
      this.logger.debug("WebSocket connection opened.")
      this.reconnectInterval = this.options.reconnectInterval
      this.reconnectAttempts = 0
      this.webSocket.send(
        JSON.stringify({
          tenant: this.subscriptionSpec.tenant,
          dataCoreId: dataCore.id,
          flowTypeId: flowType?.id,
          eventTypeId: eventType?.id,
        }),
      )
    }

    this.webSocket.onmessage = (event) => {
      let parsedData: string
      if (event.data instanceof ArrayBuffer) {
        parsedData = new TextDecoder().decode(event.data)
      } else if (Buffer.isBuffer(event.data)) {
        parsedData = (event.data as BufferType).toString()
      } else if (Array.isArray(event.data)) {
        // Handle Buffer arrays by concatenating them
        parsedData = Buffer.concat(event.data as Uint8Array[]).toString()
      } else {
        parsedData = event.data as string
      }

      this.handleMessage(parsedData)
    }

    this.webSocket.onclose = (event) => {
      this._isOpen = false
      this.logger.debug(`Connection closed: Code [${event.code}], Reason: ${event.reason}`)
      if (![1000].includes(event.code)) {
        this.attemptReconnect()
        return
      }
      this._isConnecting = false
      this.observer.complete()
    }

    this.webSocket.onerror = (error) => {
      this.logger.error(`WebSocket encountered error: ${error}`)
      this.observer.error(error)
      this.webSocket.close()
    }
  }

  /**
   * Parses and dispatches a single raw notification frame.
   *
   * Runs inside the WebSocket `onmessage` callback, where any thrown error is
   * uncaught and crashes the host process. Notification frames can occasionally
   * be malformed (non-JSON, empty/absent `message`, truncated payloads, or
   * non-event control frames), so every parse is guarded — a bad frame is logged
   * and skipped instead of taking down the whole connection/process.
   */
  private handleMessage(rawData: string): void {
    let data: {
      type?: string
      message?: string
      summary?: string
      found?: unknown
      errors?: unknown
    }
    try {
      data = JSON.parse(rawData)
    } catch (error) {
      this.logger.warn(
        `Discarding notification frame: outer payload is not valid JSON (${
          error instanceof Error ? error.message : String(error)
        })`,
      )
      return
    }

    if (data.type === "validation") {
      this.logger.error(`Bad request: ${data.summary} - ${data.message} - ${data.found} - ${data.errors}`)
      return
    }

    let parsed: { pattern: string; data: NotificationEventData }
    try {
      parsed = JSON.parse(data.message as string) as {
        pattern: string
        data: NotificationEventData
      }
    } catch (error) {
      this.logger.warn(
        `Discarding notification frame: 'message' is not valid JSON (type ${typeof data.message}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
      return
    }

    if (!parsed || typeof parsed !== "object" || !parsed.data) {
      this.logger.warn("Discarding notification frame: parsed payload is missing a 'data' field")
      return
    }

    this.logger.debug(`Received event: ${parsed.pattern}`)

    this.observer.next({
      pattern: parsed.pattern,
      data: {
        tenant: parsed.data.tenantId,
        eventId: parsed.data.eventId,
        dataCoreId: parsed.data.dataCore,
        flowType: parsed.data.aggregator,
        eventType: parsed.data.eventType,
        validTime: parsed.data.validTime,
      },
    })

    this.eventCount++

    if (this.options.maxEvents && this.options.maxEvents <= this.eventCount) {
      this.observer.complete()
      this.eventCount = 0
      this.webSocket.close(1000, "Max events received")
    }
  }

  /**
   * Attempts to reconnect to the WebSocket server using exponential backoff
   */
  private attemptReconnect() {
    if (this.options.maxReconnects && this.reconnectAttempts >= this.options.maxReconnects) {
      this.logger.error(
        `Max reconnect attempts ${this.reconnectAttempts}/${this.options.maxReconnects} reached. Giving up.`,
      )
      return
    }
    this.reconnectAttempts++
    this._isConnecting = true
    this.logger.info(
      `Attempting reconnection ${this.reconnectAttempts}${
        this.options.maxReconnects ? `/${this.options.maxReconnects}` : ""
      } in ${this.reconnectInterval} ms...`,
    )
    setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)

    this.reconnectInterval = Math.min(MAX_RECONNECT_INTERVAL, this.reconnectInterval * 2)
  }

  /**
   * Closes the WebSocket connection
   */
  disconnect() {
    if (this.webSocket) {
      this.webSocket.close(1000, "Disconnected by user")
    }
  }

  /**
   * Overrides the base WebSocket URL for testing or different environments
   * @param url - The new base URL to use
   */
  public overrideBaseUrl(url: string) {
    this.url = url
  }
}
