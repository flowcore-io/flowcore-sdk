import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

/**
 * the schema for a container
 */
export const ContainerRegistrySchema: TObject<{
  id: TString
}> = Type.Object({
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  username: Type.String(),
  id: Type.String(),
})

export type ContainerRegistry = Static<typeof ContainerRegistrySchema>
