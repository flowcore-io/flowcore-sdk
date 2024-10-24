import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

export interface EventsFetchIndexesInput {
  dataCoreId: string
  aggregator: string
  eventType: string
  cursor?: string
  fromTimeBucket?: string
  toTimeBucket?: string
  pageSize?: number
}

export interface EventsFetchIndexesOutput {
  timeBuckets: string[]
  cursor: string | null
}

const graphQlQuery = `
  query FLOWCORE_SDK_FETCH_DATA_CORE_INDEXES(
    $dataCoreId: ID!,
    $aggregator: String!,
    $eventType: String!,
    $cursor: String,
    $fromTimeBucket: String,
    $toTimeBucket: String,
    $pageSize: Int
  ) {
    datacore(search: {id: $dataCoreId}) {
      fetchIndexes(input: {
        aggregator: $aggregator,
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
  protected override parseResponse(rawResponse: unknown): EventsFetchIndexesOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.datacore) {
      throw new NotFoundException("DataCore", this.input.dataCoreId)
    }
    return response.data.datacore.fetchIndexes
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: graphQlQuery,
      variables: this.input,
    })
  }
}
