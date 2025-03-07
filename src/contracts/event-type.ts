import { type Static, type TBoolean, type TObject, type TString, Type } from "@sinclair/typebox"

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
  isTruncating: TBoolean
  isDeleting: TBoolean
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  flowTypeId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  isTruncating: Type.Boolean(),
  isDeleting: Type.Boolean(),
})

/**
 * The type for an event type
 */
export type EventType = Static<typeof EventTypeSchema>
