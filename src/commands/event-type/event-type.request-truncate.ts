import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

/**
 * The input for the event type request truncate command
 */
export interface EventTypeRequestTruncateInput {
  /** The id of the event type */
  eventTypeId: string
}

/**
 * The output for the event type request truncate command
 */
export interface EventTypeRequestTruncateOutput {
  success: boolean
}

/**
 * Request to truncate an event type
 */
export class EventTypeRequestTruncateCommand
  extends Command<EventTypeRequestTruncateInput, EventTypeRequestTruncateOutput> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "DELETE"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://delete-manager.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/event-types/${this.input.eventTypeId}/request-truncate`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventTypeRequestTruncateOutput {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean(),
      }),
      rawResponse,
    )
    return response
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("EventType", {
        [this.input.eventTypeId ? "id" : "name"]: this.input.eventTypeId ?? this.input.eventTypeId,
      })
    }
    throw error
  }
}
