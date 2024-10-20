import { type Static, Type } from "@sinclair/typebox"
import { configurationSchema } from "./common.ts"

const _DataCoreSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  accessControl: Type.Union([Type.Literal("public"), Type.Literal("private")]),
  deleteProtected: Type.Boolean(),
})
export const DataCoreSchema: typeof _DataCoreSchema = _DataCoreSchema
export type DataCore = Static<typeof DataCoreSchema>

const _DataCoreV0Schema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isPublic: Type.Boolean(),
  configuration: configurationSchema,
})
export const DataCoreV0Schema: typeof _DataCoreV0Schema = _DataCoreV0Schema
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
