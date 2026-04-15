import {
  type Static,
  type TBoolean,
  type TNull,
  type TObject,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * The schema for a service account
 */
export const ServiceAccountSchema: TObject<{
  id: TString
  tenantId: TString
  name: TString
  description: TString
  linkedUserId: TString
  clientId: TString
  isAdmin: TBoolean
  enabled: TBoolean
  createdAt: TString
  updatedAt: TUnion<[TString, TNull]>
  lastRotatedAt: TUnion<[TString, TNull]>
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  linkedUserId: Type.String(),
  clientId: Type.String(),
  isAdmin: Type.Boolean(),
  enabled: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()]),
  lastRotatedAt: Type.Union([Type.String(), Type.Null()]),
})

/**
 * The type for a service account
 */
export type ServiceAccount = Static<typeof ServiceAccountSchema>

/**
 * The schema for a service account response with client secret
 */
export const ServiceAccountWithSecretSchema: TObject<{
  id: TString
  tenantId: TString
  name: TString
  description: TString
  linkedUserId: TString
  clientId: TString
  isAdmin: TBoolean
  enabled: TBoolean
  createdAt: TString
  updatedAt: TUnion<[TString, TNull]>
  lastRotatedAt: TUnion<[TString, TNull]>
  clientSecret: TString
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  linkedUserId: Type.String(),
  clientId: Type.String(),
  isAdmin: Type.Boolean(),
  enabled: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()]),
  lastRotatedAt: Type.Union([Type.String(), Type.Null()]),
  clientSecret: Type.String(),
})

/**
 * The type for a service account response with client secret
 */
export type ServiceAccountWithSecret = Static<typeof ServiceAccountWithSecretSchema>

/**
 * The schema for a rotated service account secret response
 */
export const ServiceAccountSecretRotationSchema: TObject<{
  id: TString
  clientId: TString
  clientSecret: TString
}> = Type.Object({
  id: Type.String(),
  clientId: Type.String(),
  clientSecret: Type.String(),
})

/**
 * The type for a rotated service account secret response
 */
export type ServiceAccountSecretRotation = Static<typeof ServiceAccountSecretRotationSchema>
