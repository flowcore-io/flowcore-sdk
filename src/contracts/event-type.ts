import { type Static, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"

/**
 * The schema for an event type
 */
export const EventTypeSchema: TObject<{
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

/**
 * The type for an event type
 */
export type EventType = Static<typeof EventTypeSchema>

/**
 * The schema for an event type v0
 */
export const EventTypeV0Schema: TObject<{
  id: TString
  name: TString
  description: TUnion<[TString, TNull]>
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
})

/**
 * The type for an event type v0
 */
export type EventTypeV0 = Static<typeof EventTypeV0Schema>

/**
 * Convert an event type v0 to an event type
 */
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
