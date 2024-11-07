import { Type } from "@sinclair/typebox"
import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"

/**
 * The input for the events fetch indexes command
 */
export interface V2EventsFetchTimeBucketsInput {
  /** the tenant id */
  tenantId: string
  /** the data core id */
  dataCoreId: string
  /** the flow type id */
  flowTypeId: string
  /** the event type id */
  eventTypeId: string
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
export interface V2EventsFetchTimeBucketsOutput {
  /** the time buckets */
  timeBuckets: string[]
  /** the next page cursor */
  nextCursor?: string
}

const responseSchema = Type.Object({
  timeBuckets: Type.Array(Type.String()),
  nextCursor: Type.Optional(Type.String()),
})

/**
 * Fetch time buckets for an event type
 */
export class V2EventsFetchTimeBucketsCommand
  extends Command<V2EventsFetchTimeBucketsInput, V2EventsFetchTimeBucketsOutput> {
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
    return `/api/v1/time-buckets/byId/${this.input.tenantId}/${this.input.dataCoreId}/${this.input.flowTypeId}/${this.input.eventTypeId}`
  }
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): V2EventsFetchTimeBucketsOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string {
    return JSON.stringify({
      cursor: this.input.cursor,
      pageSize: this.input.pageSize,
      fromTimeBucket: this.input.fromTimeBucket,
      toTimeBucket: this.input.toTimeBucket,
    })
  }
}
