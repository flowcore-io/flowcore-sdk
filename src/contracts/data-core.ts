import {
  type Static,
  type TArray,
  type TBoolean,
  type TLiteral,
  type TNull,
  type TObject,
  type TOptional,
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
  name: TString
  description: TString
  accessControl: TUnion<[TLiteral<"public">, TLiteral<"private">]>
  deleteProtected: TBoolean
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  accessControl: Type.Union([Type.Literal("public"), Type.Literal("private")]),
  deleteProtected: Type.Boolean(),
})
/**
 * The type for a data core
 */
export type DataCore = Static<typeof DataCoreSchema>

/**
 * The schema for a data core v0
 */
export const DataCoreV0Schema: TObject<{
  id: TString
  name: TString
  description: TUnion<[TString, TNull]>
  isPublic: TBoolean
  configuration: TOptional<
    TArray<
      TObject<{
        key: TLiteral<"DELETE_PROTECTION_ENABLED">
        value: TUnion<[TLiteral<"true">, TLiteral<"false">]>
      }>
    >
  >
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isPublic: Type.Boolean(),
  configuration: Type.Optional(
    Type.Array(
      Type.Object({
        key: Type.Literal("DELETE_PROTECTION_ENABLED"),
        value: Type.Union([Type.Literal("true"), Type.Literal("false")]),
      }),
      { minItems: 0, maxItems: 1 },
    ),
  ),
})
/**
 * The type for a data core v0
 */
export type DataCoreV0 = Static<typeof DataCoreV0Schema>

/**
 * Convert a data core v0 to a data core
 */
export const dataCoreV0ToDataCore = (
  dataCoreV0: DataCoreV0,
  organizationId: string,
): DataCore => {
  return {
    id: dataCoreV0.id,
    tenantId: organizationId,
    name: dataCoreV0.name,
    description: dataCoreV0.description ?? "",
    accessControl: dataCoreV0.isPublic ? "public" : "private",
    deleteProtected: dataCoreV0.configuration?.[0]?.value === "true",
  }
}
