import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"

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

/**
 * Fetch indexes from a data core
 */
export class EventsFetchIndexesCommand extends Command<EventsFetchIndexesInput, EventsFetchIndexesOutput> {
  private readonly graphQl = `
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

  protected override schema = Type.Object({
    data: Type.Object({
      datacore: Type.Object({
        fetchIndexes: Type.Object({
          timeBuckets: Type.Array(Type.String()),
          cursor: Type.Union([Type.String(), Type.Null()]),
        }),
      }),
    }),
  })

  public override parseResponse(rawResponse: unknown): EventsFetchIndexesOutput {
    const response = super.parseResponse<typeof this.schema>(rawResponse)
    return response.data.datacore.fetchIndexes
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: {
        dataCoreId: this.input.dataCoreId,
        aggregator: this.input.aggregator,
        eventType: this.input.eventType,
        cursor: this.input.cursor,
        fromTimeBucket: this.input.fromTimeBucket,
        toTimeBucket: this.input.toTimeBucket,
        pageSize: this.input.pageSize,
      },
    })
  }
}
