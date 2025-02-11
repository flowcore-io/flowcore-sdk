import type { Subject } from "npm:rxjs"
import { type Logger, defaultLogger } from "../utils/logger.ts"
import { FlowcoreClient } from "./flowcore-client.ts"
import { DataCoreFetchCommand, FlowType, EventType, FlowTypeFetchCommand, EventTypeFetchCommand } from "../mod.ts"

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

  /**
   * Creates a new NotificationClient instance
   * @param observer - RxJS Subject for emitting notification events
   * @param oidcClient - Client for handling OIDC authentication
   * @param subscriptionSpec - Specification for what notifications to subscribe to
   * @param options - Configuration options for the client
   */
  constructor(
    private readonly observer: Subject<NotificationEvent>,
    private readonly oidcClient: OidcClient,
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
   * Establishes WebSocket connection and sets up event handlers
   */
  async connect() {
    const token = await this.oidcClient.getToken()
    
    const flowcoreClient = new FlowcoreClient({
      getBearerToken: () => Promise.resolve(token.accessToken),
    })

    const dataCore = await flowcoreClient.execute(
      new DataCoreFetchCommand({
        tenantId: this.subscriptionSpec.tenant,
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

    this.webSocket = new WebSocket(`${this.url}?token=${encodeURIComponent(token.accessToken)}`)

    this.webSocket.onopen = () => {
      this.logger.info("WebSocket connection opened.")
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
      const data = JSON.parse(event.data)

      if (data.type === "validation") {
        this.logger.error(`Bad request: ${data.summary} - ${data.message} - ${data.found} - ${data.errors}`)
        return
      }

      const parsed = JSON.parse(data.message) as {
        pattern: string
        data: NotificationEventData
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

    this.webSocket.onclose = (event) => {
      this.logger.info(`Connection closed: Code [${event.code}], Reason: ${event.reason}`)
      if (event.code !== 1000) {
        this.attemptReconnect()
      }
    }

    this.webSocket.onerror = (error) => {
      this.logger.error(`WebSocket encountered error: ${error}`)
      this.observer.error(error)
      this.webSocket.close()
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

    this.logger.info(
      `Attempting reconnection ${this.reconnectAttempts}${this.options.maxReconnects ? `/${this.options.maxReconnects}` : ""} in ${this.reconnectInterval} ms...`,
    )
    setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)

    this.reconnectInterval = Math.min(MAX_RECONNECT_INTERVAL, this.reconnectInterval * 2)
  }

  /**
   * Closes the WebSocket connection
   */
  private disconnect() {
    if (this.webSocket) {
      this.webSocket.close()
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