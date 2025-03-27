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

/**
 * The schema for a data core
 */
export const DataCoreSchema: TObject<{
  id: TString
  tenantId: TString
  tenant: TString
  name: TString
  description: TString
  accessControl: TUnion<[TLiteral<"public">, TLiteral<"private">]>
  deleteProtection: TBoolean
  isDeleting: TBoolean
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  tenant: Type.String(),
  name: Type.String(),
  description: Type.String(),
  accessControl: Type.Union([Type.Literal("public"), Type.Literal("private")]),
  deleteProtection: Type.Boolean(),
  isDeleting: Type.Boolean(),
})

/**
 * The schema for a data core with access
 */
export const DataCoreWithAccessSchema: TObject<{
  id: TString
  tenantId: TString
  tenant: TString
  name: TString
  description: TString
  accessControl: TUnion<[TLiteral<"public">, TLiteral<"private">]>
  deleteProtection: TBoolean
  isDeleting: TBoolean
  access: TArray<TUnion<[TLiteral<"read">, TLiteral<"write">, TLiteral<"fetch">, TLiteral<"ingest">]>>
}> = Type.Object({
  ...DataCoreSchema.properties,
  access: Type.Array(
    Type.Union([Type.Literal("read"), Type.Literal("write"), Type.Literal("fetch"), Type.Literal("ingest")]),
  ),
})

/**
 * The type for a data core
 */
export type DataCore = Static<typeof DataCoreSchema>

/**
 * The type for a data core with access
 */
export type DataCoreWithAccess = Static<typeof DataCoreWithAccessSchema>
