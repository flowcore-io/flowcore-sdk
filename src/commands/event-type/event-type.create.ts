import { Command } from "../../common/command.ts"
import { type EventType, EventTypeSchema, type SensitiveDataDefinition } from "../../contracts/event-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the event type create command
 */
export interface EventTypeCreateInput {
  /** The id of the flow type */
  flowTypeId: string
  /** The name of the event type */
  name: string
  /** The description of the event type */
  description: string
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
 * Create an event type
 */
export class EventTypeCreateCommand extends Command<EventTypeCreateInput, EventType> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

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
    return `/api/v1/event-types`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventType {
    return parseResponseHelper(EventTypeSchema, rawResponse)
  }
}
