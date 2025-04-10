import type { WebSocketCommand } from "../../common/websocket-command.ts";

/**
 * Configuration for the Conversation Stream.
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
 * Command to configure and represent a connection to the AI Agent Coordinator conversation stream.
 */
export class ConversationStreamCommand implements WebSocketCommand<ConversationStreamConfig, ConversationStreamSendPayload> {
    constructor(private readonly config: ConversationStreamConfig) {}

    getConfig(): ConversationStreamConfig {
        return this.config;
    }

    getStreamPathSegment(config: ConversationStreamConfig): string {
        return config.conversationId;
    }

    // Use default JSON serialization for sending payloads
    // serializeSendPayload(payload: ConversationStreamSendPayload): string {
    //     return JSON.stringify(payload);
    // }
} 