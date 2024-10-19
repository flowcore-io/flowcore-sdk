import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { Value } from "@sinclair/typebox/value"

export interface DataCoreFetchIndexesInput {
  dataCoreId: string
  aggregator: string
  eventType: string
  cursor?: string
  fromTimeBucket?: string
  toTimeBucket?: string
  pageSize?: number
}

export interface DataCoreFetchIndexesOutput {
  timeBuckets: string[]
  cursor: string | null
}

/**
 * Fetch indexes from a data core
 */
export class DataCoreFetchIndexesCommand extends Command<DataCoreFetchIndexesInput, DataCoreFetchIndexesOutput> {
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

  private schema = Type.Object({
    datacore: Type.Object({
      fetchIndexes: Type.Object({
        timeBuckets: Type.Array(Type.String()),
        cursor: Type.Union([Type.String(), Type.Null()]),
      }),
    }),
  })

  public override parseResponse(response: unknown): DataCoreFetchIndexesOutput {
    if (!Value.Check(this.schema, response)) {
      const errors = Value.Errors(this.schema, response)
      for (const error of errors) {
        console.error(error.path, error.message)
      }
      console.log("Got", response)
      throw new Error("Invalid response")
    }
    return response.datacore.fetchIndexes
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
