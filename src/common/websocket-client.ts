import { Buffer } from "node:buffer"
import { Subject } from "rxjs"
import type { StreamChunk } from "../contracts/ai-agent-coordinator-stream.ts"
import { defaultLogger, type Logger } from "../utils/logger.ts"
import type { ClientOptions } from "./flowcore-client.ts"
import type { ActiveStreamInterface, WebSocketCommand } from "./websocket-command.ts"

type BufferType = Uint8Array & { toString(): string }

/**
 * Interface for OIDC authentication client (reused from NotificationClient context)
 */
export type OidcClient = {
  getToken: () => Promise<{ accessToken: string }>
}

/**
 * Configuration options for the WebSocketClient
 */
export type WebSocketClientOptions = {
  /** Interval between reconnect attempts (ms). Defaults to 1000. */
  reconnectInterval?: number
  /** Maximum number of reconnect attempts. Defaults to undefined (infinite). */
  maxReconnects?: number
  /** Optional logger instance. */
  logger?: Logger
  /** Base URL for the WebSocket endpoint (e.g., wss://server.com). Path segment from command will be appended. */
  baseUrl?: string
  /** Optional static path prefix before the command's path segment (e.g., /api/v1/stream). */
  pathPrefix?: string
}

// Maximum reconnection interval in milliseconds
const MAX_RECONNECT_INTERVAL = 30_000
const DEFAULT_PATH_PREFIX = "/api/v1/stream" // Example default prefix

// Define the expected WebSocket interface subset used by the client
interface MinimalWebSocket {
    readyState: number;
    onopen: (() => void) | null;
    onmessage: ((event: { data: string | ArrayBuffer | Buffer; }) => void) | null;
    onclose: ((event: { code: number; reason: string; wasClean: boolean; }) => void) | null;
    onerror: ((event: Event) => void) | null;
    send(data: string): void;
    close(code?: number, reason?: string): void;
}

// WebSocket constructor type
type WebSocketFactory = (url: string) => MinimalWebSocket;

/**
 * Generic client for managing a single, persistent WebSocket connection based on a command.
 * Handles connection lifecycle, authentication, reconnection, and message sending/receiving.
 */
export class WebSocketClient {
  private baseUrl: string
  private pathPrefix: string
  private webSocket!: MinimalWebSocket
  private options: Required<Pick<WebSocketClientOptions, "reconnectInterval">> &
    Pick<WebSocketClientOptions, "maxReconnects" | "logger">
  private logger: Logger
  private reconnectInterval: number
  private reconnectAttempts = 0
  private _isOpen: boolean = false
  private _isConnecting: boolean = false
  private webSocketFactory: WebSocketFactory
  // Internal subject to push received data
  private internalSubject: Subject<StreamChunk> = new Subject<StreamChunk>()
  // Store the current command and config for reconnects and sending
  private currentCommand: WebSocketCommand<unknown, unknown> | null = null;
  private currentConfig: unknown | null = null;

  /**
   * Creates a new WebSocketClient instance.
   * @param authOptions - Authentication options (Bearer token via OIDC client or API Key).
   * @param options - Configuration options for the client.
   * @param webSocketFactory - Optional WebSocket factory for testing.
   */
  constructor(
    // Removed observer from constructor - created internally
    private readonly authOptions: ClientOptions,
    options?: WebSocketClientOptions,
    webSocketFactory?: WebSocketFactory,
  ) {
    this.options = { reconnectInterval: 1000, ...options };
    this.logger = options?.logger ?? defaultLogger;
    // Use provided baseUrl or throw error if needed, assuming AI Coordinator for default
    this.baseUrl = options?.baseUrl ?? "wss://ai-coordinator.api.flowcore.io";
    this.pathPrefix = options?.pathPrefix ?? DEFAULT_PATH_PREFIX;
    this.reconnectInterval = this.options.reconnectInterval;
    this.webSocketFactory = webSocketFactory ?? ((url) => new WebSocket(url) as unknown as MinimalWebSocket);

    if (!this.baseUrl) {
        throw new Error("WebSocketClient requires a baseUrl in options.")
    }
    if ("getBearerToken" in authOptions === false && ("apiKey" in authOptions === false)) {
      throw new Error("Invalid authOptions: Must provide either getBearerToken or apiKey/apiKeyId")
    }
  }

  /**
   * Returns true if the WebSocket connection is currently open.
   */
  public get isOpen(): boolean {
    return this._isOpen
  }

  /**
   * Returns true if the client is currently attempting to establish a WebSocket connection.
   */
  public get isConnecting(): boolean {
    return this._isConnecting
  }

  /**
   * Establishes WebSocket connection based on the provided command.
   * Disconnects any existing connection before starting the new one.
   * @param command - The command defining the stream connection details.
   * @returns An interface to interact with the active stream.
   */
  // Using generic types for the command
  async connect<Config, SendPayload>(
    command: WebSocketCommand<Config, SendPayload>
  ): Promise<ActiveStreamInterface<SendPayload>> {
    if (this._isConnecting || this._isOpen) {
      this.logger.info("Disconnecting existing stream before starting new one.")
      this.disconnect(); // Ensure clean state
      // Add a small delay to allow disconnect process to settle if needed
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.currentCommand = command as WebSocketCommand<unknown, unknown>; // Store command (cast needed)
    const config = command.getConfig();
    this.currentConfig = config; // Store config

    this._isConnecting = true
    const pathSegment = command.getStreamPathSegment(config);
    this.logger.info(`Attempting to connect stream: ${this.pathPrefix}/${pathSegment}`);

    try {
      const urlParams = new URLSearchParams()
      if ("getBearerToken" in this.authOptions && this.authOptions.getBearerToken) {
        const token = await this.authOptions.getBearerToken()
        if (!token) throw new Error("Failed to get bearer token")
        urlParams.set("token", token)
      } else if ("apiKey" in this.authOptions && this.authOptions.apiKey && this.authOptions.apiKeyId) {
        urlParams.set("api_key", this.authOptions.apiKey)
        urlParams.set("api_key_id", this.authOptions.apiKeyId)
      } else {
        throw new Error("Invalid authentication configuration.")
      }

      const streamUrl = `${this.baseUrl}${this.pathPrefix}/${pathSegment}?${urlParams.toString()}`
      this.logger.debug(`Connecting to WebSocket URL: ${streamUrl}`)
      this.webSocket = this.webSocketFactory(streamUrl)

      this.setupEventHandlers() // Sets up handlers that push to internalSubject

      // Return the active stream interface
      return {
        output$: this.internalSubject.asObservable(),
        send: (payload: SendPayload): boolean => this.sendMessage(payload),
        disconnect: (): void => this.disconnect(),
      };

    } catch (error) {
      this.logger.error(`Failed to initiate connection: ${error}`)
      this._isConnecting = false
      this.currentCommand = null; // Clear command/config on failure
      this.currentConfig = null;
      // Rethrow or handle differently? For now, rethrow.
      throw error; // Make connect promise reject on failure
    }
  }

  /**
   * Sets up the WebSocket event handlers (onopen, onmessage, onclose, onerror).
   */
  private setupEventHandlers(): void {
    this.webSocket.onopen = () => {
      this._isOpen = true
      this._isConnecting = false
      // Use currentConfig for logging
      const pathSegment = this.currentCommand?.getStreamPathSegment(this.currentConfig);
      this.logger.info(`WebSocket connection opened: ${this.pathPrefix}/${pathSegment}`);
      this.reconnectInterval = this.options.reconnectInterval
      this.reconnectAttempts = 0
    }

    this.webSocket.onmessage = (event: { data: string | ArrayBuffer | Buffer }) => {
      try {
        let parsedData: string
        // Handle various data types from WebSocket
        if (event.data instanceof ArrayBuffer) {
          parsedData = new TextDecoder().decode(event.data)
        } else if (Buffer.isBuffer(event.data)) {
          parsedData = (event.data as BufferType).toString()
        } else {
          parsedData = event.data as string
        }

        const chunk = JSON.parse(parsedData) as StreamChunk // Assume valid JSON structure

        // Basic validation - check if it has a 'type' property
        if (typeof chunk !== "object" || chunk === null || typeof chunk.type !== "string") {
          this.logger.warn(`Received invalid chunk format: ${parsedData}`)
          return // Ignore invalid chunks
        }

        this.logger.debug(`Received chunk: ${chunk.type}`) // Log chunk type
        this.internalSubject.next(chunk) // Push to internal subject
      } catch (error) {
        this.logger.error(`Error processing received message: ${error}`)
        // Optionally emit an error on the subject?
        // this.internalSubject.error(new Error(`Failed to parse message: ${error.message}`));
      }
    }

    this.webSocket.onclose = (event) => {
      const wasOpen = this._isOpen
      this._isOpen = false
      this._isConnecting = false
      const pathSegment = this.currentCommand?.getStreamPathSegment(this.currentConfig);
      this.logger.info(
        `WebSocket connection closed: ${this.pathPrefix}/${pathSegment} Code [${event.code}], Reason: ${event.reason || "No reason given"}. Was open: ${wasOpen}`,
      )
      if (wasOpen && event.code !== 1000 && this.currentCommand) { // Only reconnect if command is still set
        this.attemptReconnect()
      } else {
        this.logger.info(`Completing internal subject due to close event.`);
        this.internalSubject.complete() // Complete subject on final close
        this.currentCommand = null; // Clear state
        this.currentConfig = null;
      }
    }

    this.webSocket.onerror = () => {
      this.logger.error("WebSocket encountered an error.")
      if (
        this.webSocket.readyState !== WebSocket.CLOSED &&
        this.webSocket.readyState !== WebSocket.CLOSING
      ) {
        this.webSocket.close(1011, "WebSocket error")
      }
      // Error event usually followed by onclose, which handles completion/reconnect
      // Emit error on subject *before* close handling potentially completes it
      this.internalSubject.error(new Error("WebSocket encountered an error"));
    };
  }

  /**
   * Attempts to reconnect to the WebSocket server using exponential backoff.
   * Requires `currentConfig` to be set.
   */
  private attemptReconnect() {
    if (!this.currentCommand || !this.currentConfig) {
      this.logger.error("Cannot reconnect without current command/config.")
      if (!this.internalSubject.closed) this.internalSubject.complete()
      return
    }
    if (this._isConnecting) {
      this.logger.debug("Reconnect attempt already in progress.");
      return;
    }
    if (this.options.maxReconnects && this.reconnectAttempts >= this.options.maxReconnects) {
      const pathSegment = this.currentCommand.getStreamPathSegment(this.currentConfig);
      this.logger.error(
        `Max reconnect attempts (${this.reconnectAttempts}/${this.options.maxReconnects}) reached. Giving up: ${this.pathPrefix}/${pathSegment}`,
      );
      if (!this.internalSubject.closed) this.internalSubject.complete();
      this.currentCommand = null; 
      this.currentConfig = null;
      return;
    }

    this.reconnectAttempts++;
    this._isConnecting = true;
    const pathSegment = this.currentCommand.getStreamPathSegment(this.currentConfig);

    this.logger.info(
        `Attempting reconnection ${this.reconnectAttempts}${this.options.maxReconnects ? `/${this.options.maxReconnects}` : ""}
         for ${this.pathPrefix}/${pathSegment} in ${this.reconnectInterval} ms...`,
    );

    setTimeout(async () => { // Keep timeout async
      // Check if disconnect was called while waiting
      if (!this.currentCommand || !this.currentConfig) {
        this.logger.info("Reconnect cancelled as disconnect was called.")
        this._isConnecting = false // Ensure flag is reset
        if (!this.internalSubject.closed) this.internalSubject.complete();
        return
      }

      // Directly attempt to establish connection *without* calling this.connect()
      try {
        const urlParams = new URLSearchParams()
        // --- Reuse auth logic from connect() --- 
        if ("getBearerToken" in this.authOptions && this.authOptions.getBearerToken) {
            const token = await this.authOptions.getBearerToken();
            if (!token) throw new Error("Reconnect failed: Could not get bearer token");
            urlParams.set("token", token);
        } else if ("apiKey" in this.authOptions && this.authOptions.apiKey && this.authOptions.apiKeyId) {
            urlParams.set("api_key", this.authOptions.apiKey);
            urlParams.set("api_key_id", this.authOptions.apiKeyId);
        } else {
            throw new Error("Reconnect failed: Invalid authentication configuration.");
        }
        // --- End auth logic --- 

        const streamUrl = `${this.baseUrl}${this.pathPrefix}/${pathSegment}?${urlParams.toString()}`
        this.logger.debug(`Reconnecting to WebSocket URL: ${streamUrl}`)
        this.webSocket = this.webSocketFactory(streamUrl)
        // Connecting flag will be reset in onopen/onerror/onclose
        this.setupEventHandlers()
      } catch (error) {
        this.logger.error(`Reconnect attempt connection failed: ${error}`);
        this._isConnecting = false; // Reset connection flag on immediate error
        // Error during reconnect setup, trigger another attempt after backoff
        // We might get stuck here if auth always fails, consider adding specific error handling
        this.reconnectInterval = Math.min(MAX_RECONNECT_INTERVAL, this.reconnectInterval * 2) // Apply backoff before retrying
        this.attemptReconnect(); 
      }
    }, this.reconnectInterval)

    // Apply backoff interval for the *next* potential reconnect attempt
    this.reconnectInterval = Math.min(MAX_RECONNECT_INTERVAL, this.reconnectInterval * 2)
  }

  /**
   * Sends a message to the currently connected WebSocket.
   * @param message - The message object to send (e.g., { content: "user input" }).
   */
  private sendMessage<SendPayload>(payload: SendPayload): boolean {
    const ws = this.webSocket as any;
    const openState = ws.OPEN ?? 1;
    if (!this._isOpen || this.webSocket.readyState !== openState || !this.currentCommand) {
      this.logger.warn("Cannot send message: WebSocket is not open or command not set.")
      return false
    }
    try {
      // Use command's serializer or default to JSON.stringify
      const serializer = this.currentCommand.serializeSendPayload ?? JSON.stringify;
      const dataToSend = serializer(payload);
      this.webSocket.send(dataToSend);
      this.logger.debug(`Sent message: ${dataToSend}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message: ${error}`)
      return false
    }
  }

  /**
   * Closes the WebSocket connection gracefully.
   */
  disconnect() {
    this.logger.info("Disconnect called by user.")
    const commandToClear = this.currentCommand; // Store ref before clearing
    this.currentCommand = null // Prevent reconnects
    this.currentConfig = null;

    if (this.webSocket) {
      if (this._isOpen || this._isConnecting) {
        this.webSocket.close(1000, "Disconnected by user")
      } else {
        this.logger.debug("WebSocket already closed or closing.")
      }
    } else {
      this.logger.debug("No WebSocket instance to disconnect.")
    }
    this._isOpen = false
    this._isConnecting = false

    // Complete the subject if it hasn't been completed by onclose
    if (commandToClear && !this.internalSubject.closed) {
        this.logger.info("Completing internal subject due to disconnect call.");
        this.internalSubject.complete();
    }
  }

  /**
   * Implements the Disposable interface for clean resource management.
   */
  [Symbol.dispose](): void {
    this.disconnect()
  }
} 