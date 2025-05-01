import { Command } from "../../common/command.ts"
import { type EventType, EventTypeSchema, type SensitiveDataDefinition } from "../../contracts/event-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the event type update command
 */
export type EventTypeUpdateInput = {
  /** The id of the event type */
  eventTypeId: string
  /** The description of the event type */
  description?: string
  /** The sensitive data mask of the event type */
  sensitiveDataMask?: {
    /** The json path to the key where the entity id for the sensitive data mask is located */
    key: string
    /** Schema defining the fields that should be masked and how they should be masked */
    schema: Record<string, SensitiveDataDefinition>
  }
  /** Whether sensitive data masking is enabled for this event type */
  sensitiveDataEnabled?: boolean
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
  protected override getBody(): Record<string, unknown> {
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
