import { Command } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { type EventType, EventTypeSchema } from "../../contracts/event-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the event type list command
 */
export type EventTypeListInput = {
  /** The flow type id */
  flowTypeId: string
}

/**
 * Fetch all event types for a flow type
 */
export class EventTypeListCommand extends Command<EventTypeListInput, EventType[]> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://event-type-2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    queryParams.set("flowTypeId", this.input.flowTypeId)
    return `/api/v1/event-types?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventType[] {
    const response = parseResponseHelper(Type.Array(EventTypeSchema), rawResponse)
    return response
  }
}
