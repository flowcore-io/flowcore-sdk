import type { Command } from "../../common/command.ts"
import { Command as BaseCommandClass } from "../../common/command.ts"
import type { ConversationDeleteResponse } from "../../contracts/ai-agent-coordinator.ts"

const service = "ai-coordinator"
const baseUrl = `https://${service}.api.flowcore.io`

/**
 * Input for deleting a specific conversation.
 */
export type ConversationDeleteCommandInput = {
  /** The unique ID of the conversation to delete. */
  conversationId: string
}

/**
 * Output confirming the deletion of the conversation.
 */
export type ConversationDeleteCommandOutput = ConversationDeleteResponse

/**
 * Command to delete a specific conversation by its ID.
 */
export class ConversationDeleteCommand
  extends BaseCommandClass<ConversationDeleteCommandInput, ConversationDeleteCommandOutput>
  implements Command<ConversationDeleteCommandInput, ConversationDeleteCommandOutput> {
  constructor(input: ConversationDeleteCommandInput) {
    super(input)
  }

  protected override getBaseUrl(): string {
    return baseUrl
  }

  protected override getMethod(): string {
    return "DELETE"
  }

  protected override getPath(): string {
    return `/api/v1/conversations/${this.input.conversationId}`
  }

  // No need to override getBody or getHeaders for DELETE with no body

  protected override parseResponse(response: unknown): ConversationDeleteCommandOutput {
    const data = response as ConversationDeleteResponse
    if (data && data.message) {
      return data
    } else {
      throw new Error("Invalid response format for ConversationDeleteCommand")
    }
  }

  // No specific error handling needed for DELETE beyond the base implementation (re-throw)
}
