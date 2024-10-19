import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { Value } from "@sinclair/typebox/value"

export interface DataCoreFetchEventsInput {
  dataCoreId: string
  aggregator: string
  eventType: string
  cursor?: string
  fromTimeBucket?: string
  toTimeBucket?: string
  pageSize?: number
}

export interface DataCoreFetchEventsOutput {
  events: {
    eventId: string
    timeBucket: string
    eventType: string
    aggregator: string
    dataCore: string
    metadata: string
    payload: string
    validTime: string
  }[]
  cursor: string | null
}

/**
 * Fetch events from a data core
 */
export class DataCoreFetchEventsCommand extends Command<DataCoreFetchEventsInput, DataCoreFetchEventsOutput> {
  private readonly graphQl = `
    query FLOWCORE_CLI_FETCH_EVENTS($dataCoreId: ID!, $aggregator: String!, $eventTypes: [String!]!, $timeBucket: String!, $cursor: String, $afterEventId: String, $beforeEventId: String, $pageSize: Int) {
      datacore(search: {id: $dataCoreId}) {
        fetchEvents(input: {
          aggregator: $aggregator,
          eventTypes: $eventTypes,
          timeBucket: $timeBucket
          cursor: $cursor
          afterEventId: $afterEventId
          beforeEventId: $beforeEventId
          pageSize: $pageSize
        }) {
          events {
            eventId
            timeBucket
            eventType
            aggregator
            dataCore
            metadata
            payload
            validTime
          }
          cursor
        }
      }
    }
  `

  private schema = Type.Object({
    datacore: Type.Object({
      fetchEvents: Type.Object({
        events: Type.Array(Type.Object({
          eventId: Type.String(),
          timeBucket: Type.String(),
          eventType: Type.String(),
          aggregator: Type.String(),
          dataCore: Type.String(),
          metadata: Type.String(),
          payload: Type.String(),
          validTime: Type.String(),
        })),
        cursor: Type.Union([Type.String(), Type.Null()]),
      }),
    }),
  })

  public override parseResponse(response: unknown): DataCoreFetchEventsOutput {
    if (!Value.Check(this.schema, response)) {
      throw new Error("Invalid response")
    }
    return response.datacore.fetchEvents
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
