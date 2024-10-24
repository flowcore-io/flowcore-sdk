import { type TArray, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponse } from "../../utils/parse-response.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { type Event, EventSchema } from "../../contracts/event.ts"

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
  events: Event[]
  cursor: string | null
}

/**
 * Fetch events for event types
 */
export class EventsFetchCommand extends GraphQlCommand<EventsFetchInput, EventsFetchOutput> {
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
      datacore: TUnion<[
        TObject<{
          fetchEvents: TObject<{
            events: TArray<typeof EventSchema>
            cursor: TUnion<[TString, TNull]>
          }>
        }>,
        TNull,
      ]>
    }>
  }> = Type.Object({
    data: Type.Object({
      datacore: Type.Union([
        Type.Object({
          fetchEvents: Type.Object({
            events: Type.Array(EventSchema),
            cursor: Type.Union([Type.String(), Type.Null()]),
          }),
        }),
        Type.Null(),
      ]),
    }),
  })

  public override parseResponse(rawResponse: unknown): EventsFetchOutput {
    const response = parseResponse(this.schema, rawResponse)
    if (!response.data.datacore) {
      throw new NotFoundException("DataCore", this.input.dataCoreId)
    }
    return response.data.datacore.fetchEvents
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: this.input,
    })
  }
}
