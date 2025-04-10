import type { Command } from "../../common/command.ts"
import { Command as BaseCommandClass } from "../../common/command.ts"
import type { ConversationListResponse, ConversationMetadata } from "../../contracts/ai-agent-coordinator.ts"

const service = "ai-coordinator"
const baseUrl = `https://${service}.api.flowcore.io`

/**
 * Input for listing conversations.
 * Currently empty as no filters are supported.
 */
export type ConversationListCommandInput = Record<string, never>

/**
 * Output containing a list of conversation metadata.
 */
export type ConversationListCommandOutput = ConversationMetadata[]

/**
 * Command to list all conversations accessible by the user.
 */
export class ConversationListCommand extends BaseCommandClass<ConversationListCommandInput, ConversationListCommandOutput>
  implements Command<ConversationListCommandInput, ConversationListCommandOutput>
{
  constructor() {
    super({})
  }

  protected override getBaseUrl(): string {
    return baseUrl
  }

  protected override getMethod(): string {
    return "GET"
  }

  protected override getPath(): string {
    return `/api/v1/conversations`
  }

  protected override parseResponse(response: unknown): ConversationListCommandOutput {
    const data = response as ConversationListResponse
    if (data && Array.isArray(data.conversations)) {
      return data.conversations
    } else {
      throw new Error("Invalid response format for ConversationListCommand")
    }
  }
} 