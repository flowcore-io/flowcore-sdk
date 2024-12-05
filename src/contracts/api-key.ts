import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

/**
 * The schema for an api key
 */
export const ApiKeySchema: TObject<{
  id: TString
  name: TString
  createdAt: TString
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  createdAt: Type.String(),
})
/**
 * The type for an api key
 */
export type ApiKey = Static<typeof ApiKeySchema>
