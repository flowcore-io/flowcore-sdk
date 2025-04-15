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
  isFlowcoreManaged: TBoolean
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  /** Unique identifier for the data core */
  id: Type.String(),
  /** ID of the tenant that owns this data core */
  tenantId: Type.String(),
  /** Name of the tenant that owns this data core */
  tenant: Type.String(),
  /** Name of the data core */
  name: Type.String(),
  /** Description of the data core's purpose and contents */
  description: Type.String(),
  /** Access control setting - determines if the data core is public or private */
  accessControl: Type.Union([Type.Literal("public"), Type.Literal("private")]),
  /** Protection against accidental deletion */
  deleteProtection: Type.Boolean(),
  /** Indicates if the data core is currently being deleted */
  isDeleting: Type.Boolean(),
  /** Indicates if the data core is managed by Flowcore platform */
  isFlowcoreManaged: Type.Boolean(),
  /** ISO timestamp of when the data core was created */
  createdAt: Type.String(),
  /** ISO timestamp of when the data core was last updated */
  updatedAt: Type.String(),
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
  isFlowcoreManaged: TBoolean
  createdAt: TString
  updatedAt: TString
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
