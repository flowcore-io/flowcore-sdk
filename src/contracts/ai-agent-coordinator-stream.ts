import type { ContextItem } from "./ai-agent-coordinator.ts"

// --- Configuration ---

/**
 * Configuration for initiating an AI Agent Coordinator stream.
 */
export interface AiStreamConfig {
  /** The ID of the conversation to stream. */
  conversationId: string
  // Add other potential config fields if needed (e.g., initial message)
}

// --- Stream Chunks (Backend -> Frontend) ---

export interface MarkdownDeltaChunk {
  type: "markdown_delta"
  /** The chunk of markdown text. */
  content: string
}

export interface ToolStartChunk {
  type: "tool_start"
  /** The name of the tool being executed. */
  tool_name: string
}

export interface ToolInputChunk {
  type: "tool_input"
  /** The input provided to the tool (can be any JSON structure). */
  content: unknown // Use unknown for arbitrary JSON
}

export interface ToolOutputChunk {
  type: "tool_output"
  /** The output received from the tool (can be any JSON structure). */
  content: unknown // Use unknown for arbitrary JSON
}

export interface ToolErrorChunk {
  type: "tool_error"
  content: {
    /** A summary error message. */
    error_message: string
    /** Optional additional details about the error. */
    details?: string | unknown
  }
}

export interface ContextAddItemChunk {
  type: "context_add_item"
  /** The full context item that was added. */
  item: ContextItem
}

export interface TitleUpdateChunk {
  type: "title_update"
  /** The new suggested title for the conversation. */
  title: string
}

export interface ArtifactStartChunk {
  type: "artifact_start"
  artifactId: string
  artifactType: string
  title: string
}

export interface ArtifactContentDeltaChunk {
  type: "artifact_content_delta"
  artifactId: string
  /** The chunk of artifact text content. */
  content: string
}

export interface ArtifactDataChunk {
  type: "artifact_data"
  artifactId: string
  /** The complete JSON data for the artifact. */
  data: unknown // Use unknown for arbitrary JSON
}

export interface ArtifactUrlChunk {
  type: "artifact_url"
  artifactId: string
  /** The URL pointing to the artifact content. */
  url: string
}

export interface ArtifactEndChunk {
  type: "artifact_end"
  artifactId: string
}

export interface ConversationCreatedChunk {
  type: "conversation_created"
  /** The ID of the newly created conversation. */
  conversationId: string
}

/**
 * A discriminated union of all possible chunk types streamed from the backend.
 */
export type StreamChunk =
  | MarkdownDeltaChunk
  | ToolStartChunk
  | ToolInputChunk
  | ToolOutputChunk
  | ToolErrorChunk
  | ContextAddItemChunk
  | TitleUpdateChunk
  | ArtifactStartChunk
  | ArtifactContentDeltaChunk
  | ArtifactDataChunk
  | ArtifactUrlChunk
  | ArtifactEndChunk
  | ConversationCreatedChunk 