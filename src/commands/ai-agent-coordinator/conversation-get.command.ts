import { Command as BaseCommandClass } from "../../common/command.ts"
import type { Conversation } from "../../contracts/ai-agent-coordinator.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/index.ts"

const service = "ai-coordinator"
const baseUrl = `https://${service}.api.flowcore.io`

/**
 * Input for fetching a specific conversation.
 */
export type ConversationGetCommandInput = {
  /** The unique ID of the conversation to fetch. */
  conversationId: string
}

/**
 * Output containing the full details of the fetched conversation.
 */
export type ConversationGetCommandOutput = Conversation

/**
 * Command to fetch the details of a specific conversation by its ID.
 */
export class ConversationGetCommand extends BaseCommandClass<ConversationGetCommandInput, ConversationGetCommandOutput> {
  constructor(input: ConversationGetCommandInput) {
    super(input)
  }

  protected override getBaseUrl(): string {
    return baseUrl
  }

  protected override getMethod(): string {
    return "GET"
  }

  protected override getPath(): string {
    return `/api/v1/conversations/${this.input.conversationId}`
  }

  protected override parseResponse(response: unknown): ConversationGetCommandOutput {
    const data = response as Conversation
    if (data && data.id) {
      return data
    } else {
      throw new Error("Invalid response format for ConversationGetCommand")
    }
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException(
        "Conversation",
        { conversationId: this.input.conversationId },
      )
    }
    throw error
  }
}
