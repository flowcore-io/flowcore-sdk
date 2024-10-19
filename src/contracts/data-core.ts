import { type Static, Type } from "@sinclair/typebox"
import { configurationSchema } from "./common.ts"

export const DataCoreV0Schema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  isPublic: Type.Boolean(),
  configuration: configurationSchema,
})

export const DataCoreSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  accessControl: Type.Union([Type.Literal("public"), Type.Literal("private")]),
  deleteProtected: Type.Boolean(),
})

export const dataCoreV0ToDataCore = (
  dataCoreV0: Static<typeof DataCoreV0Schema>,
  organizationId: string,
): Static<typeof DataCoreSchema> => {
  return {
    id: dataCoreV0.id,
    organizationId,
    name: dataCoreV0.name,
    description: dataCoreV0.description ?? "",
    accessControl: dataCoreV0.isPublic ? "public" : "private",
    deleteProtected: dataCoreV0.configuration?.[0]?.value === "true",
  }
}
