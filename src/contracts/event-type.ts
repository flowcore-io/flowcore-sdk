import { type Static, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"

const EventTypeSchema: TObject<{
  id: TString
  organizationId: TString
  dataCoreId: TString
  flowTypeId: TString
  name: TString
  description: TString
}> = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  dataCoreId: Type.String(),
  flowTypeId: Type.String(),
  name: Type.String(),
  description: Type.String(),
})
export type EventType = Static<typeof EventTypeSchema>

export const EventTypeV0Schema: TObject<{
  id: TString
  name: TString
  description: TUnion<[TString, TNull]>
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
})
export type EventTypeV0 = Static<typeof EventTypeV0Schema>

export const eventTypeV0ToEventType = (
  eventTypeV0: EventTypeV0,
  organizationId: string,
  dataCoreId: string,
  flowTypeId: string,
): EventType => {
  return {
    id: eventTypeV0.id,
    organizationId,
    dataCoreId,
    flowTypeId,
    name: eventTypeV0.name,
    description: eventTypeV0.description ?? "",
  }
}
