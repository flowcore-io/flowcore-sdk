import { Command } from "../../common/command.ts"
import { type TArray, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"
import { type EventType, EventTypeV0Schema, eventTypeV0ToEventType } from "../../contracts/event-type.ts"
import { parseResponse } from "../../utils/parse-response.ts"

export type EventTypeListInput = {
  flowTypeId: string
}

export type EventTypeListOutput = EventType[]

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
      flowtype: TUnion<[
        TObject<{
          id: TString
          events: TArray<typeof EventTypeV0Schema>
        }>,
        TNull,
      ]>
    }>
  }> = Type.Object({
    data: Type.Object({
      flowtype: Type.Union([
        Type.Object({
          id: Type.String(),
          events: Type.Array(EventTypeV0Schema),
        }),
        Type.Null(),
      ]),
    }),
  })

  protected override parseResponse(rawResponse: unknown): EventTypeListOutput {
    const response = parseResponse(this.schema, rawResponse)
    if (!response.data.flowtype) {
      throw new Error("Flow type not found")
    }
    const flowTypeId = response.data.flowtype.id
    return response.data.flowtype.events.map((eventType) => eventTypeV0ToEventType(eventType, "", "", flowTypeId))
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
