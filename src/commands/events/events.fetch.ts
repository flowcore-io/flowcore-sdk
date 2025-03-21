import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type FlowcoreEvent, FlowcoreEventSchema } from "../../contracts/event.ts"

/**
 * The input for the events fetch indexes command
 */
export interface EventsFetchEventsInput {
  /** the tenant */
  tenant: string
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowType: string
  /** the event type names */
  eventTypes: string[]
  /** the time bucket */
  timeBucket: string
  /** the paging cursor */
  cursor?: string
  /** the page size (default is 10.000) */
  pageSize?: number
  /** start from this event id */
  fromEventId?: string
  /** after this event id */
  afterEventId?: string
  /** end at this event id */
  toEventId?: string
}

/**
 * The output for the events fetch indexes command
 */
export interface EventsFetchEventsOutput {
  /** the events */
  events: FlowcoreEvent[]
  /** the next page cursor */
  nextCursor?: string
}

/**
 * The response schema for the events fetch command
 */
const responseSchema = Type.Object({
  events: Type.Array(FlowcoreEventSchema),
  nextCursor: Type.Optional(Type.String()),
})

/**
 * Fetch time buckets for an event type
 */
export class EventsFetchCommand extends Command<EventsFetchEventsInput, EventsFetchEventsOutput> {
  protected override supportsDedicatedUrl: boolean = true
  protected override dedicatedSubdomain: string = "event-source"

  /**
   * Get the base url for the request
   */
  protected override getBaseUrl(): string {
    return "https://event-source.api.flowcore.io"
  }
  /**
   * Get the path for the request
   */
  protected override getPath(): string {
    const query: Record<string, string> = {
      ...(this.input.cursor ? { cursor: this.input.cursor.toString() } : {}),
      ...(this.input.pageSize ? { pageSize: this.input.pageSize.toString() } : {}),
      ...(this.input.fromEventId ? { fromEventId: this.input.fromEventId } : {}),
      ...(this.input.afterEventId ? { afterEventId: this.input.afterEventId } : {}),
      ...(this.input.toEventId ? { toEventId: this.input.toEventId } : {}),
    }
    return `/api/v1/events?${new URLSearchParams(query).toString()}`
  }
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventsFetchEventsOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      tenant: this.input.tenant,
      dataCoreId: this.input.dataCoreId,
      flowType: this.input.flowType,
      eventTypes: this.input.eventTypes,
      timeBucket: this.input.timeBucket,
    }
  }
}
