import { Command } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the events fetch indexes command
 */
export interface EventsFetchTimeBucketsByNamesInput {
  /** the tenant name */
  tenant: string
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowType: string
  /** the event type names */
  eventTypes: string[]
  /** the paging cursor */
  cursor?: number
  /** the page size (default is 10.000) */
  pageSize?: number
  /** start from this time bucket */
  fromTimeBucket?: string
  /** end at this time bucket */
  toTimeBucket?: string
}

/**
 * The output for the events fetch indexes command
 */
export interface EventsFetchTimeBucketsByNamesOutput {
  /** the time buckets */
  timeBuckets: string[]
  /** the next page cursor */
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
export class EventsFetchTimeBucketsByNamesCommand extends Command<
  EventsFetchTimeBucketsByNamesInput,
  EventsFetchTimeBucketsByNamesOutput
> {
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
    return "/api/v1/time-buckets/by-names"
  }
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventsFetchTimeBucketsByNamesOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string {
    return JSON.stringify(this.input)
  }
}
