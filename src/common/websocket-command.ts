import type { Observable } from "rxjs";
import type { StreamChunk } from "../contracts/ai-agent-coordinator-stream.ts"; // Placeholder, make this generic later if needed

/**
 * Interface for a command that configures a WebSocket stream connection.
 * @template Config - The type of the configuration data needed to initiate the stream.
 * @template SendPayload - The type of data that can be sent *to* the stream after connection.
 */
export interface WebSocketCommand<Config, SendPayload> {
  /**
   * Gets the configuration data needed to establish the connection.
   */
  getConfig(): Config;

  /**
   * Gets the specific path segment for the WebSocket URL based on the config.
   * Example: For ws://server/stream/{id}, this would return the {id}.
   * @param config - The configuration object.
   * @returns The path segment string.
   */
  getStreamPathSegment(config: Config): string;

  /**
   * Serializes the payload to be sent over the WebSocket.
   * Default implementation might be JSON.stringify.
   * @param payload - The payload object to send.
   * @returns The serialized string representation.
   */
  serializeSendPayload?(payload: SendPayload): string;
}

/**
 * Interface representing an active WebSocket stream connection.
 * @template SendPayload - The type of data that can be sent to the stream.
 */
export interface ActiveStreamInterface<SendPayload> {
  /**
   * An Observable emitting the raw data chunks received from the WebSocket.
   * Consumers should filter/map this observable based on the specific stream protocol.
   */
  output$: Observable<StreamChunk>; // Initially tied to AiStream chunks, can be made generic

  /**
   * Sends a payload to the WebSocket stream.
   * @param payload - The data to send, conforming to the SendPayload type.
   * @returns True if the message was queued to be sent, false otherwise (e.g., socket not open).
   */
  send(payload: SendPayload): boolean;

  /**
   * Disconnects the WebSocket stream gracefully.
   */
  disconnect(): void;
} 