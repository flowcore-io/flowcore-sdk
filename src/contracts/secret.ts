import { type Static, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"

/**
 * The schema for a secret
 */
export const SecretSchema: TObject<{
  tenantId: TString
  key: TString
  description: TString
  createdAt: TString
  updatedAt: TUnion<[TString, TNull]>
}> = Type.Object({
  tenantId: Type.String(),
  key: Type.String(),
  description: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()]),
})

/**
 * The type for a secret
 */
export type Secret = Static<typeof SecretSchema>
