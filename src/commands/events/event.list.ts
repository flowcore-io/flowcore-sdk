import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type FlowcoreEvent, FlowcoreEventSchema } from "../../contracts/event.ts"

/**
 * The input for the events fetch indexes command
 */
export interface EventListInput {
  /** The tenant */
  tenant: string
  /** the event type id or ids */
  eventTypeId: [string, ...string[]] | string
  /** the time bucket */
  timeBucket: string
  /** the paging cursor */
  cursor?: string
  /** the page size (default is 10.000) */
  pageSize?: number
  /** start from this event id */
  fromEventId?: string
  /**
   * after this event id
   *
   * ⚠️ Not applicable if `fromEventId` is also defined
   */
  afterEventId?: string
  /** end at this event id */
  toEventId?: string
  /**
   * the order (default is asc)
   *
   * ⚠️ When using `desc` order, pagination and filters are not possible.
   */
  order?: "asc" | "desc"
  /** include sensitive data */
  includeSensitiveData?: boolean
}

/**
 * The output for the events fetch indexes command
 */
export interface EventListOutput {
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
export class EventListCommand extends Command<EventListInput, EventListOutput> {
  /**
   * The dedicated subdomain for the command
   */
  protected override dedicatedSubdomain: string = "event-source"

  /**
   * Get the method for the request
   */
  protected override getMethod(): string {
    return "GET"
  }

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
    const query = new URLSearchParams()
    const eventTypeIds = Array.isArray(this.input.eventTypeId) ? this.input.eventTypeId : [this.input.eventTypeId]
    for (const eventTypeId of eventTypeIds) {
      query.append("eventTypeId", eventTypeId)
    }
    query.set("timeBucket", this.input.timeBucket)
    this.input.cursor && query.set("cursor", this.input.cursor.toString())
    this.input.pageSize && query.set("pageSize", this.input.pageSize.toString())
    this.input.fromEventId && query.set("fromEventId", this.input.fromEventId)
    this.input.afterEventId && query.set("afterEventId", this.input.afterEventId)
    this.input.toEventId && query.set("toEventId", this.input.toEventId)
    this.input.order && query.set("order", this.input.order)
    this.input.includeSensitiveData && query.set("includeSensitiveData", this.input.includeSensitiveData.toString())
    return `/api/v1/events?${query.toString()}`
  }
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventListOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }
}
