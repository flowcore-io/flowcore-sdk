import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the event type exists command
 */
export interface EventTypeExistsInput {
  /** The id of the event type */
  eventTypeId: string
}

/**
 * The output for the event type exists command
 */
export interface EventTypeExistsOutput {
  /** Whether the event type exists */
  exists: boolean
}

/**
 * Check if an event type exists
 */
export class EventTypeExistsCommand extends Command<EventTypeExistsInput, EventTypeExistsOutput> {
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
    return `/api/v1/event-types/${this.input.eventTypeId}/exists`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventTypeExistsOutput {
    const response = parseResponseHelper(Type.Object({ exists: Type.Boolean() }), rawResponse)
    return response
  }
}
