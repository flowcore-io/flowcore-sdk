import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { type Event, EventSchema } from "../../contracts/event.ts"

/**
 * The input for the events fetch command
 */
export interface EventsFetchInput {
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowType: string
  /** the event type names */
  eventTypes: string[]
  /** the paging cursor */
  cursor?: string
  /** fetch after this event id */
  afterEventId?: string
  /** fetch before this event id */
  beforeEventId?: string
  /** fetch from this time bucket */
  timeBucket?: string
  /** the page size */
  pageSize?: number
}

/**
 * The output for the events fetch command
 */
export interface EventsFetchOutput {
  /** the events */
  events: Event[]
  /** the paging cursor */
  cursor: string | null
}

const graphQlQuery = `
  query FLOWCORE_CLI_FETCH_EVENTS($dataCoreId: ID!, $flowType: String!, $eventTypes: [String!]!, $timeBucket: String!, $cursor: String, $afterEventId: String, $beforeEventId: String, $pageSize: Int) {
    datacore(search: {id: $dataCoreId}) {
      fetchEvents(input: {
        aggregator: $flowType,
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

const responseSchema = Type.Object({
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

/**
 * Fetch events for event types
 */
export class EventsFetchCommand extends GraphQlCommand<EventsFetchInput, EventsFetchOutput> {
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventsFetchOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.datacore) {
      throw new NotFoundException("DataCore", this.input.dataCoreId)
    }
    return response.data.datacore.fetchEvents
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
