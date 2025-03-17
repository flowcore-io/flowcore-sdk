import {
  type Static,
  type TObject,
  type TOptional,
  type TString,
  Type
} from "@sinclair/typebox"

/**
 * The schema for a PAT (Personal Access Token)
 */
export const PATSchema: TObject<{
  id: TString
  name: TString
  description: TString
  token: TOptional<TString>
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.String(),
  token: Type.Optional(Type.String()),
})
/**
 * The type for a PAT
 */
export type PAT = Static<typeof PATSchema>
