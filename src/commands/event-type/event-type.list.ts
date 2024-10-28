import { GraphQlCommand } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { type EventType, EventTypeV0Schema, eventTypeV0ToEventType } from "../../contracts/event-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

/**
 * The input for the event type list command
 */
export type EventTypeListInput = {
  /**
   * The flow type id
   */
  flowTypeId: string
}

const graphQlQuery = `
  query FLOWCORE_SDK_EVENT_TYPE_LIST($flowTypeId: ID!) {
    flowtype(id: $flowTypeId) {
      events {
        id
        name
        description
      }
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    flowtype: Type.Union([
      Type.Object({
        events: Type.Array(EventTypeV0Schema),
      }),
      Type.Null(),
    ]),
  }),
})

/**
 * Fetch all event types for a flow type
 */
export class EventTypeListCommand extends GraphQlCommand<EventTypeListInput, EventType[]> {
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventType[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.flowtype) {
      throw new NotFoundException("FlowType", this.input.flowTypeId)
    }
    const flowTypeId = this.input.flowTypeId
    return response.data.flowtype.events.map((eventType) => eventTypeV0ToEventType(eventType, "", "", flowTypeId))
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
