import {
  type TArray,
  type TNull,
  type TObject,
  type TRecord,
  type TString,
  type TUnion,
  type TUnknown,
  Type,
} from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponse } from "../../utils/parse-response.ts"

export interface EventsFetchInput {
  dataCoreId: string
  aggregator: string
  eventTypes: string[]
  cursor?: string
  afterEventId?: string
  beforeEventId?: string
  timeBucket?: string
  pageSize?: number
}

export interface EventsFetchOutput {
  events: {
    eventId: string
    timeBucket: string
    eventType: string
    aggregator: string
    dataCore: string
    metadata: Record<string, unknown>
    payload: Record<string, unknown>
    validTime: string
  }[]
  cursor: string | null
}

/**
 * Fetch events from a data core
 */
export class EventsFetchCommand extends Command<EventsFetchInput, EventsFetchOutput> {
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

  protected override schema: TObject<{
    data: TObject<{
      datacore: TObject<{
        fetchEvents: TObject<{
          events: TArray<
            TObject<{
              eventId: TString
              timeBucket: TString
              eventType: TString
              aggregator: TString
              dataCore: TString
              metadata: TRecord<TString, TUnknown>
              payload: TRecord<TString, TUnknown>
              validTime: TString
            }>
          >
          cursor: TUnion<[TString, TNull]>
        }>
      }>
    }>
  }> = Type.Object({
    data: Type.Object({
      datacore: Type.Object({
        fetchEvents: Type.Object({
          events: Type.Array(Type.Object({
            eventId: Type.String(),
            timeBucket: Type.String(),
            eventType: Type.String(),
            aggregator: Type.String(),
            dataCore: Type.String(),
            metadata: Type.Record(Type.String(), Type.Unknown()),
            payload: Type.Record(Type.String(), Type.Unknown()),
            validTime: Type.String(),
          })),
          cursor: Type.Union([Type.String(), Type.Null()]),
        }),
      }),
    }),
  })

  public override parseResponse(rawResponse: unknown): EventsFetchOutput {
    const response = parseResponse(this.schema, rawResponse)
    return response.data.datacore.fetchEvents
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: {
        dataCoreId: this.input.dataCoreId,
        aggregator: this.input.aggregator,
        eventTypes: this.input.eventTypes,
        cursor: this.input.cursor,
        afterEventId: this.input.afterEventId,
        beforeEventId: this.input.beforeEventId,
        timeBucket: this.input.timeBucket,
        pageSize: this.input.pageSize,
      },
    })
  }
}
