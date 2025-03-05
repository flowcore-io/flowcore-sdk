import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { EventTypeExistsCommand } from "./event-type.exists.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"

/**
 * The input for the event type request delete command
 */
export interface EventTypeRequestDeleteInput {
  /** The id of the event type */
  eventTypeId: string
  /** Wait for the event type to be deleted (default: false) */
  waitForDelete?: boolean
}

/**
 * The output for the event type request delete command
 */
export interface EventTypeRequestDeleteOutput {
  success: boolean
}

/**
 * Request to delete an event type
 */
export class EventTypeRequestDeleteCommand extends Command<EventTypeRequestDeleteInput, EventTypeRequestDeleteOutput> {
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
    return `/api/v1/event-types/${this.input.eventTypeId}/request-delete`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventTypeRequestDeleteOutput {
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

  /**
   * Wait for the response (timeout: 25 seconds)
   */
  protected override async processResponse(
    client: FlowcoreClient,
    response: EventTypeRequestDeleteOutput,
  ): Promise<EventTypeRequestDeleteOutput> {
    if (!this.input.waitForDelete) {
      return response
    }
    const start = Date.now()
    while (Date.now() - start < 25_000) {
      const response = await client.execute(
        new EventTypeExistsCommand({
          eventTypeId: this.input.eventTypeId,
        }),
      )
      if (!response.exists) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return response
  }
}
