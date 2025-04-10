import { Command as BaseCommandClass } from "../../common/command.ts"
import type { ContextUpdateResponse } from "../../contracts/ai-agent-coordinator.ts"

const service = "ai-coordinator"
const baseUrl = `https://${service}.api.flowcore.io`

/**
 * Input for removing an item from a conversation's context.
 */
export type ContextRemoveItemCommandInput = {
  /** The ID of the conversation to modify. */
  conversationId: string
  /** The unique ID of the context item instance to remove. */
  itemId: string
}

/**
 * Output containing the updated context array after removing the item.
 */
export type ContextRemoveItemCommandOutput = ContextUpdateResponse

/**
 * Command to remove a specific item from the context of a conversation.
 */
export class ContextRemoveItemCommand
  extends BaseCommandClass<ContextRemoveItemCommandInput, ContextRemoveItemCommandOutput> {
  constructor(input: ContextRemoveItemCommandInput) {
    super(input)
  }

  protected override getBaseUrl(): string {
    return baseUrl
  }

  protected override getMethod(): string {
    return "POST"
  }

  protected override getPath(): string {
    return `/api/v1/conversations/${this.input.conversationId}/context/remove`
  }

  protected override getBody(): Record<string, unknown> {
    return { itemId: this.input.itemId } as Record<string, unknown>
  }

  protected override parseResponse(response: unknown): ContextRemoveItemCommandOutput {
    const data = response as ContextUpdateResponse
    if (data && Array.isArray(data.context)) {
      return data
    } else {
      throw new Error("Invalid response format for ContextRemoveItemCommand")
    }
  }
}
