import { GraphQlCommand, NotFoundException, parseResponseHelper } from "@flowcore/sdk-core"
import { Type } from "@sinclair/typebox"

/**
 * The input for the events fetch indexes command
 */
export interface EventsFetchIndexesInput {
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowType: string
  /** the event type name */
  eventType: string
  /** the paging cursor */
  cursor?: string
  /** fetch from this time bucket */
  fromTimeBucket?: string
  /** fetch to this time bucket */
  toTimeBucket?: string
  /** the page size */
  pageSize?: number
}

/**
 * The output for the events fetch indexes command
 */
export interface EventsFetchIndexesOutput {
  /** the time buckets */
  timeBuckets: string[]
  /** the paging cursor */
  cursor: string | null
}

const graphQlQuery = `
  query FLOWCORE_SDK_FETCH_DATA_CORE_INDEXES(
    $dataCoreId: ID!,
    $flowType: String!,
    $eventType: String!,
    $cursor: String,
    $fromTimeBucket: String,
    $toTimeBucket: String,
    $pageSize: Int
  ) {
    datacore(search: {id: $dataCoreId}) {
      fetchIndexes(input: {
        aggregator: $flowType,
        eventType: $eventType,
        cursor: $cursor
        fromTimeBucket: $fromTimeBucket
        toTimeBucket: $toTimeBucket
        pageSize: $pageSize
      }) {
        timeBuckets
        cursor
      }
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    datacore: Type.Union([
      Type.Object({
        fetchIndexes: Type.Object({
          timeBuckets: Type.Array(Type.String()),
          cursor: Type.Union([Type.String(), Type.Null()]),
        }),
      }),
      Type.Null(),
    ]),
  }),
})

/**
 * Fetch time buckets for an event type
 */
export class EventsFetchIndexesCommand extends GraphQlCommand<EventsFetchIndexesInput, EventsFetchIndexesOutput> {
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventsFetchIndexesOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.datacore) {
      throw new NotFoundException("DataCore", this.input.dataCoreId)
    }
    return response.data.datacore.fetchIndexes
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string {
    return JSON.stringify({
      query: graphQlQuery,
      variables: this.input,
    })
  }
}
