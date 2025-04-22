import {
  type Static,
  type TArray,
  type TBoolean,
  type TLiteral,
  type TObject,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

export const EventTypePiiMaskTypeSchema: TObject<{
  path: TString
  type: TUnion<[TLiteral<"string">, TLiteral<"number">, TLiteral<"boolean">]>
}> = Type.Object({
  path: Type.String(),
  type: Type.Union([Type.Literal("string"), Type.Literal("number"), Type.Literal("boolean")]),
})

export const EventTypePiiMaskSchema: TObject<{
  key: TString
  paths: TArray<typeof EventTypePiiMaskTypeSchema>
}> = Type.Object({
  key: Type.String(),
  paths: Type.Array(EventTypePiiMaskTypeSchema),
})

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
  piiMask: TArray<typeof EventTypePiiMaskSchema>
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  flowTypeId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  isTruncating: Type.Boolean(),
  isDeleting: Type.Boolean(),
  piiMask: Type.Array(EventTypePiiMaskSchema),
})

/**
 * The type for an event type
 */
export type EventType = Static<typeof EventTypeSchema>
