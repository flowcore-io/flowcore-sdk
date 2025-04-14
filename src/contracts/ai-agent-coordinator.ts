export interface ContextItem {
  type: "tenant" | "dataCore" | "flowType" | "eventType" | string // Allow string for extensibility
  id: string
  name: string
  description: string
}

export interface Message {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  timestamp: string // ISO 8601 format
}

export interface ConversationMetadata {
  id: string
  title: string
  lastUpdated: string // ISO 8601 format
}

export interface Conversation extends ConversationMetadata {
  context: ContextItem[]
  messages: Message[]
}

export interface ConversationListResponse {
  conversations: ConversationMetadata[]
}

export interface ConversationDeleteResponse {
  message: string
}

export interface ContextUpdateResponse {
  context: ContextItem[]
}

export interface AddContextItem {
  type: string
  id: string
}

export interface AddContextItemsRequest {
  items: AddContextItem[]
}

export interface RemoveContextItemRequest {
  itemId: string
}
