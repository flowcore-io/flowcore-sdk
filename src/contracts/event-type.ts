import {
  type Static,
  type TBoolean,
  type TNull,
  type TObject,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * The schema for an event type
 */
export const EventTypeSchema: TObject<{
  id: TString
  tenantId: TString
  dataCoreId: TString
  flowTypeId: TString
  name: TString
  description: TString
  isTruncated: TBoolean
  isDeleting: TBoolean
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  flowTypeId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  isTruncated: Type.Boolean(),
  isDeleting: Type.Boolean(),
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
  truncating: TBoolean
  deleting: TBoolean
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  truncating: Type.Boolean(),
  deleting: Type.Boolean(),
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
    tenantId: organizationId,
    dataCoreId,
    flowTypeId,
    name: eventTypeV0.name,
    description: eventTypeV0.description ?? "",
    isTruncated: eventTypeV0.truncating,
    isDeleting: eventTypeV0.deleting,
  }
}
