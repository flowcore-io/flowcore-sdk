import type {
    WebSocketCommand,
} from "../../common/websocket-command.ts";

/**
 * Configuration for the Conversation Stream.
 * Only requires the conversationId.
 */
export interface ConversationStreamConfig {
    conversationId: string;
}

/**
 * Payload type for messages sent *to* the Conversation Stream.
 */
export interface ConversationStreamSendPayload {
    content: string;
}

/**
 * Command to stream conversation events for a specific agent.
 */
export class ConversationStreamCommand implements WebSocketCommand<ConversationStreamConfig, ConversationStreamSendPayload> {
  private config: ConversationStreamConfig

  constructor(config: ConversationStreamConfig) {
    if (!config.conversationId) {
        throw new Error("conversationId is required in the config for ConversationStreamCommand");
    }
    this.config = config
  }

  /** Get the configuration object for the command. */
  getConfig(): ConversationStreamConfig {
    return this.config
  }

  /** Get the base WebSocket URL. */
  getWebSocketBaseUrl(): string {
    // Specific base URL for AI Coordinator streams
    return "wss://ai-coordinator.api.flowcore.io"
  }

  /** Get the WebSocket path segment. */
  getWebSocketPathSegment(config: ConversationStreamConfig): string {
    // Updated path segment based on likely API structure
    return `/api/v1/stream/conversations/${config.conversationId}`
  }

  /** Serializer function for outgoing payloads. */
  serializeSendPayload(payload: ConversationStreamSendPayload): string {
    // Default JSON serialization
    return JSON.stringify(payload)
  }
} 