import {
  type Static,
  type TBoolean,
  type TLiteral,
  type TNull,
  type TObject,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"
import { configurationSchema } from "./common.ts"

const DataCoreSchema: TObject<{
  id: TString
  organizationId: TString
  name: TString
  description: TString
  accessControl: TUnion<[TLiteral<"public">, TLiteral<"private">]>
  deleteProtected: TBoolean
}> = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  accessControl: Type.Union([Type.Literal("public"), Type.Literal("private")]),
  deleteProtected: Type.Boolean(),
})
export type DataCore = Static<typeof DataCoreSchema>

export const DataCoreV0Schema: TObject<{
  id: TString
  name: TString
  description: TUnion<[TString, TNull]>
  isPublic: TBoolean
  configuration: typeof configurationSchema
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isPublic: Type.Boolean(),
  configuration: configurationSchema,
})
export type DataCoreV0 = Static<typeof DataCoreV0Schema>

export const dataCoreV0ToDataCore = (
  dataCoreV0: DataCoreV0,
  organizationId: string,
): DataCore => {
  return {
    id: dataCoreV0.id,
    organizationId,
    name: dataCoreV0.name,
    description: dataCoreV0.description ?? "",
    accessControl: dataCoreV0.isPublic ? "public" : "private",
    deleteProtected: dataCoreV0.configuration?.[0]?.value === "true",
  }
}
