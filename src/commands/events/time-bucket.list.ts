import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the events fetch indexes command
 */
export interface TimeBucketListInput {
  /** the event type ids */
  eventTypeId: [string, ...string[]] | string
  /** the start time */
  fromTimeBucket?: string
  /** the end time */
  toTimeBucket?: string
  /** the page size */
  pageSize?: number
  /** the cursor */
  cursor?: number
  /** the order */
  order?: "asc" | "desc"
}

/**
 * The output for the events fetch indexes command
 */
export interface TimeBucketListOutput {
  /** the time buckets */
  timeBuckets: string[]
  /** the next cursor */
  nextCursor?: number
}

/**
 * The response schema for the events fetch time buckets by names command
 */
const responseSchema = Type.Object({
  timeBuckets: Type.Array(Type.String()),
  nextCursor: Type.Optional(Type.Number()),
})

/**
 * Fetch time buckets for an event type
 */
export class TimeBucketListCommand extends Command<
  TimeBucketListInput,
  TimeBucketListOutput
> {
  protected override supportsDedicatedUrl: boolean = true
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
    const queryParams = new URLSearchParams()
    const eventTypeIds = Array.isArray(this.input.eventTypeId) ? this.input.eventTypeId : [this.input.eventTypeId]
    for (const eventTypeId of eventTypeIds) {
      queryParams.append("eventTypeId", eventTypeId)
    }
    this.input.fromTimeBucket && queryParams.set("fromTimeBucket", this.input.fromTimeBucket)
    this.input.toTimeBucket && queryParams.set("toTimeBucket", this.input.toTimeBucket)
    this.input.order && queryParams.set("order", this.input.order)
    this.input.pageSize && queryParams.set("pageSize", this.input.pageSize.toString())
    this.input.cursor && queryParams.set("cursor", this.input.cursor.toString())

    return `/api/v1/time-buckets?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TimeBucketListOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }
}
