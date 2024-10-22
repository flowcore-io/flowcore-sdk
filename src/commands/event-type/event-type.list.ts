import { Command } from "../../common/command.ts"
import { type TArray, type TObject, type TString, Type } from "@sinclair/typebox"
import { type EventType, EventTypeV0Schema, eventTypeV0ToEventType } from "../../contracts/event-type.ts"

export type EventTypeListInput = {
  flowTypeId: string
}

export type EventTypeListOutput = EventType[] | null

/**
 * Fetch all event types for a flow type
 */
export class EventTypeListCommand extends Command<EventTypeListInput, EventTypeListOutput> {
  private readonly graphQl = `
    query FLOWCORE_SDK_EVENT_TYPE_LIST($flowTypeId: ID!) {
      flowtype(id: $flowtypeId) {
        events {
          id
          name
          description
        }
      }
    }
  `

  protected override schema: TObject<{
    data: TObject<{
      flowtype: TObject<{
        id: TString
        events: TArray<typeof EventTypeV0Schema>
      }>
    }>
  }> = Type.Object({
    data: Type.Object({
      flowtype: Type.Object({
        id: Type.String(),
        events: Type.Array(EventTypeV0Schema),
      }),
    }),
  })

  protected override parseResponse(rawResponse: unknown): EventTypeListOutput {
    const response = super.parseResponse<typeof this.schema>(rawResponse)
    if (response.data.flowtype) {
      return response.data.flowtype.events.map((eventType) =>
        eventTypeV0ToEventType(eventType, "", "", response.data.flowtype.id)
      )
    }
    return null
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: {
        flowTypeId: this.input.flowTypeId,
      },
    })
  }
}
