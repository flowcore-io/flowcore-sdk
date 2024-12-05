import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

/**
 * The schema for a variable
 */
export const VariableSchema: TObject<{
  key: TString
  value: TString
}> = Type.Object({
  key: Type.String(),
  value: Type.String(),
})
/**
 * The type for a variable
 */
export type Variable = Static<typeof VariableSchema>
