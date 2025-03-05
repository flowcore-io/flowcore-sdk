import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { FlowcoreClient } from "../../common/flowcore-client.ts"
import { EventTypeFetchCommand } from "./event-type.fetch.ts"

/**
 * The input for the event type request truncate command
 */
export interface EventTypeRequestTruncateInput {
  /** The id of the event type */
  eventTypeId: string

  /** Wait for the event type to be truncated (default: false) */
  waitForTruncate?: boolean
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

  /**
   * Wait for the response (timeout: 25 seconds)
   */
  protected override async processResponse(
    client: FlowcoreClient,
    response: EventTypeRequestTruncateOutput,
  ): Promise<EventTypeRequestTruncateOutput> {
    if (!this.input.waitForTruncate) {
      return response
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    const start = Date.now()
    while (Date.now() - start < 25_000) {
      const response = await client.execute(
        new EventTypeFetchCommand({
          eventTypeId: this.input.eventTypeId,
        }),
      )
      if (response.isTruncating) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return response
  }
}
