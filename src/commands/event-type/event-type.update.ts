import { Command } from "../../common/command.ts"
import { type EventType, EventTypeSchema } from "../../contracts/event-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the event type update command
 */
export type EventTypeUpdateInput = {
  /** The id of the event type */
  eventTypeId: string
  /** The description of the event type */
  description?: string
}

/**
 * Update an event type
 */
export class EventTypeUpdateCommand extends Command<EventTypeUpdateInput, EventType> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
    return `/api/v1/event-types/${this.input.eventTypeId}`
  }

  /**
   * Get the body for the request
   */
  protected override getBody() {
    const { eventTypeId: _, ...payload } = this.input
    return payload
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventType {
    return parseResponseHelper(EventTypeSchema, rawResponse)
  }
}
