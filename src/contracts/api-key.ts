import {
  type Static,
  type TBoolean,
  type TNull,
  type TObject,
  type TOptional,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * The schema for an api key
 */
export const ApiKeySchema: TObject<{
  id: TString
  tenantId: TString
  name: TString
  description: TString
  maskedApiKey: TString
  createdAt: TString
  lastUsedAt: TUnion<[TString, TNull]>
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  maskedApiKey: Type.String(),
  createdAt: Type.String(),
  lastUsedAt: Type.Union([Type.String(), Type.Null()]),
})

/**
 * The type for an api key
 */
export type ApiKey = Static<typeof ApiKeySchema>

/**
 * The schema for an api key with value
 */
export const ApiKeyWithValueSchema: TObject<{
  id: TString
  tenantId: TString
  name: TString
  description: TString
  maskedApiKey: TString
  createdAt: TString
  lastUsedAt: TUnion<[TString, TNull]>
  apiKey: TString
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  maskedApiKey: Type.String(),
  createdAt: Type.String(),
  lastUsedAt: Type.Union([Type.String(), Type.Null()]),
  apiKey: Type.String(),
})

/**
 * The type for an api key with value
 */
export type ApiKeyWithValue = Static<typeof ApiKeyWithValueSchema>

/**
 * The schema for an api key validation response
 */
export const ApiKeyValidationSchema: TObject<{
  valid: TBoolean
  apiKeyId: TOptional<TString>
  tenantId: TOptional<TString>
}> = Type.Object({
  valid: Type.Boolean(),
  apiKeyId: Type.Optional(Type.String()),
  tenantId: Type.Optional(Type.String()),
})

/**
 * The type for an api key validation response
 */
export type ApiKeyValidation = Static<typeof ApiKeyValidationSchema>
