import {
  type Static,
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
 * The type for a data core
 */
export type DataCore = Static<typeof DataCoreSchema>
