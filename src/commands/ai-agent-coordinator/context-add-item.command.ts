import { Command as BaseCommandClass } from "../../common/command.ts"
import type { AddContextItem, ContextUpdateResponse } from "../../contracts/ai-agent-coordinator.ts"

const service = "ai-coordinator"
const baseUrl = `https://${service}.api.flowcore.io`

/**
 * Input for adding items to a conversation's context.
 */
export type ContextAddItemCommandInput = {
  /** The ID of the conversation to modify. */
  conversationId: string
  /** An array of context items (type and ID) to add. */
  items: AddContextItem[]
}

/**
 * Output containing the updated context array after adding items.
 */
export type ContextAddItemCommandOutput = ContextUpdateResponse

/**
 * Command to add one or more items to the context of a specific conversation.
 */
export class ContextAddItemCommand extends BaseCommandClass<ContextAddItemCommandInput, ContextAddItemCommandOutput>
  {
  constructor(input: ContextAddItemCommandInput) {
    super(input)
  }

  protected override getBaseUrl(): string {
    return baseUrl
  }

  protected override getMethod(): string {
    return "POST"
  }

  protected override getPath(): string {
    return `/api/v1/conversations/${this.input.conversationId}/context/add`
  }

  protected override getBody(): Record<string, unknown> {
    return { items: this.input.items } as Record<string, unknown>
  }

  // Headers will be handled by base class based on getBody()

  protected override parseResponse(response: unknown): ContextAddItemCommandOutput {
    const data = response as ContextUpdateResponse
    // Add more robust checking if necessary
    if (data && Array.isArray(data.context)) {
      return data
    } else {
      throw new Error("Invalid response format for ContextAddItemCommand")
    }
  }
}
