import { type Static, type TArray, type TObject, type TOptional, type TString, Type } from "@sinclair/typebox"

/**
 * the schema for a container
 */
export const ContainerRegistrySchema: TObject<{
  organizationId: TString
  name: TString
  description: TOptional<TString>
  username: TOptional<TString>
  id: TString
}> = Type.Object({
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  username: Type.Optional(Type.String()),
  id: Type.String(),
})

export const ContainerRegistryCreateSchema: TObject<{
  id: TString
}> = Type.Object({
  id: Type.String(),
})

export const ContainerRegistryListSchema: TArray = Type.Array(ContainerRegistrySchema)

export type ContainerRegistry = Static<typeof ContainerRegistrySchema>
export type ContainerRegistryList = Static<typeof ContainerRegistryListSchema>
export type ContainerRegistryCreate = Static<typeof ContainerRegistryCreateSchema>
