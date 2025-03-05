import { Type } from "@sinclair/typebox"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { Command } from "../../common/command.ts"

/**
 * The input for the events fetch indexes command
 */
export interface EventsFetchFirstAndLastTimeBucketsInput {
  /** the tenant name */
  tenant: string
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowType: string
  /** the event type name */
  eventType: string
}

/**
 * The output for the events fetch indexes command
 */
export interface EventsFetchFirstAndLastTimeBucketsOutput {
  /** the first time bucket */
  first?: string
  /** the last time bucket */
  last?: string
}

/**
 * The response schema for the events fetch time buckets by names command
 */
const responseSchema = Type.Object({
  first: Type.Optional(Type.String()),
  last: Type.Optional(Type.String()),
})

/**
 * Fetch time buckets for an event type
 */
export class EventsFetchFirstAndLastTimeBucketsCommand extends Command<
  EventsFetchFirstAndLastTimeBucketsInput,
  EventsFetchFirstAndLastTimeBucketsOutput
> {
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
    return `/api/v1/time-buckets/first-and-last/${this.input.tenant}/${this.input.dataCoreId}/${this.input.flowType}/${this.input.eventType}`
  }
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventsFetchFirstAndLastTimeBucketsOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }
}
