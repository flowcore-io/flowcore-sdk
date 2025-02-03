import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type EventType, EventTypeSchema } from "../../contracts/event-type.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

interface EventTypeFetchByIdInput {
  /** The id of the event type */
  eventTypeId: string
  /** The id of the flow type */
  flowTypeId?: never
  /** The name of the event type */
  eventType?: never
}

interface EventTypeFetchByNameInput {
  /** The id of the flow type */
  flowTypeId: string
  /** The name of the event type */
  eventType: string
  /** The id of the event type */
  eventTypeId?: never
}

/**
 * The input for the event type fetch command
 */
export type EventTypeFetchInput = EventTypeFetchByIdInput | EventTypeFetchByNameInput

/**
 * Fetch an event type
 */
export class EventTypeFetchCommand extends Command<EventTypeFetchInput, EventType> {
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
    if ("eventTypeId" in this.input) {
      return `/api/v1/event-types/${this.input.eventTypeId}`
    }
    const queryParams = new URLSearchParams()
    queryParams.set("flowTypeId", this.input.flowTypeId)
    queryParams.set("name", this.input.eventType)
    return `/api/v1/event-types?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventType {
    if ("eventTypeId" in this.input) {
      const response = parseResponseHelper(EventTypeSchema, rawResponse)
      return response
    }
    const response = parseResponseHelper(Type.Array(EventTypeSchema), rawResponse)
    if (response.length === 0) {
      throw new NotFoundException("EventType", { name: this.input.eventType })
    }
    return response[0]
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("EventType", {
        [this.input.eventTypeId ? "id" : "name"]: this.input.eventTypeId ?? this.input.eventType,
      })
    }
    throw error
  }
}
