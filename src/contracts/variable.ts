import { type Static, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"

/**
 * The schema for a variable
 */
export const VariableSchema: TObject<{
  tenantId: TString
  key: TString
  description: TString
  value: TString
  createdAt: TString
  updatedAt: TUnion<[TString, TNull]>
}> = Type.Object({
  tenantId: Type.String(),
  key: Type.String(),
  description: Type.String(),
  value: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()]),
})

/**
 * The type for a variable
 */
export type Variable = Static<typeof VariableSchema>
