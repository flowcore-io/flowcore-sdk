import { Command } from "../../common/command.ts"
import { type EventTypeRemoveSensitiveData, EventTypeRemoveSensitiveDataSchema } from "../../contracts/event-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"


/**
 * The input for the event type list removed sensitive data command
 */
export interface EventTypeRemoveSensitiveDataInput {
  /** The id of the event type */
  eventTypeId: string
  /** The identifier of the application that is trying to remove sensitive data */
  applicationId: string
  /** The parent key of sensitive data point */
  parentKey: string
  /** The key of sensitive data point */
  key: string
  /** The removal type of sensitive data point */
  type: "remove" | "scramble"
}

/**
 * Fetch an event type
 */
export class EventTypeRemoveSensitiveDataCommand extends Command<EventTypeRemoveSensitiveDataInput, EventTypeRemoveSensitiveData> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "POST"
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
    return `/api/v1/event-types/sensitive-data/remove`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventTypeRemoveSensitiveData {
    return parseResponseHelper(EventTypeRemoveSensitiveDataSchema, rawResponse)
  }
}
