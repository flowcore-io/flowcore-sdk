import {
  type Static,
  type TArray,
  type TNumber,
  type TObject,
  type TOptional,
  type TString,
  Type,
} from "@sinclair/typebox"

/**
 * the schema for a container
 */
export const ContainerRegistrySchema: TObject<{
  tenantId: TString
  name: TString
  description: TOptional<TString>
  username: TOptional<TString>
  id: TString
}> = Type.Object({
  tenantId: Type.String(),
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

export const ContainerRegistryDeleteSchema: TObject<{
  status: TNumber
}> = Type.Object({
  status: Type.Number(),
})

export const ContainerRegistryListSchema: TArray = Type.Array(ContainerRegistrySchema)

export type ContainerRegistry = Static<typeof ContainerRegistrySchema>
export type ContainerRegistryList = Static<typeof ContainerRegistryListSchema>
export type ContainerRegistryCreate = Static<typeof ContainerRegistryCreateSchema>
export type ContainerRegistryDelete = Static<typeof ContainerRegistryDeleteSchema>
