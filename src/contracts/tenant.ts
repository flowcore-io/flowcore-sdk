import {
  type Static,
  type TArray,
  type TBoolean,
  type TLiteral,
  type TNull,
  type TObject,
  type TOptional,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

interface TenantById {
  tenantId: string
  tenant?: never
}

interface TenantByName {
  tenant: string
  tenantId?: never
}

export type TenantFetchInput = TenantById | TenantByName

/**
 * The schema for a tenant
 */
export const TenantSchema: TObject<{
  id: TString
  name: TString
  displayName: TString
  description: TString
  websiteUrl: TString
  isDedicated: TBoolean
  dedicated: TUnion<[
    TNull,
    TObject<{
      status: TUnion<[
        TLiteral<"ready">,
        TLiteral<"degraded">,
        TLiteral<"offline">,
      ]>
      configuration: TObject<{
        domain: TString
        configurationRepoUrl: TString
        configurationRepoCredentials: TUnion<[TString, TNull]>
      }>
    }>,
  ]>
  sensitiveDataEnabled: TOptional<TBoolean>
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  displayName: Type.String(),
  description: Type.String(),
  websiteUrl: Type.String(),
  isDedicated: Type.Boolean(),
  dedicated: Type.Union([
    Type.Null(),
    Type.Object({
      status: Type.Union([
        Type.Literal("ready"),
        Type.Literal("degraded"),
        Type.Literal("offline"),
      ]),
      configuration: Type.Object({
        domain: Type.String(),
        configurationRepoUrl: Type.String(),
        configurationRepoCredentials: Type.Union([Type.String(), Type.Null()]),
      }),
    }),
  ]),
  sensitiveDataEnabled: Type.Optional(Type.Boolean()),
})

/**
 * The type for a tenant
 */
export type Tenant = Static<typeof TenantSchema>

/**
 * The schema for a tenant list item
 */
export const TenantListItemSchema: TObject<{
  id: TString
  name: TString
  displayName: TString
  description: TString
  websiteUrl: TString
  isDedicated: TBoolean
  sensitiveDataEnabled: TBoolean
  domain: TUnion<[TString, TNull]>
  permissions: TArray<TString>
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  displayName: Type.String(),
  description: Type.String(),
  websiteUrl: Type.String(),
  isDedicated: Type.Boolean(),
  sensitiveDataEnabled: Type.Boolean(),
  domain: Type.Union([Type.String(), Type.Null()]),
  permissions: Type.Array(Type.String()),
})

/**
 * The type for a tenant list item
 */
export type TenantListItem = Static<typeof TenantListItemSchema>

/**
 * The schema for a tenant user
 */
export const TenantUserSchema: TObject<{
  id: TString
  username: TString
  email: TString
  firstName: TString
  lastName: TString
}> = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
})

/**
 * The type for a tenant user
 */
export type TenantUser = Static<typeof TenantUserSchema>

/**
 * The schema for a public tenant preview
 */
export const TenantPreviewSchema: TObject = Type.Object({
  displayName: Type.String(),
  websiteUrl: Type.String(),
  description: Type.String(),
})

/**
 * The type for a public tenant preview
 */
export type TenantPreview = Static<typeof TenantPreviewSchema>

/**
 * The schema for a tenant instance
 */
export const TenantInstanceSchema: TObject<{
  isDedicated: TBoolean
  instance: TUnion<[
    TNull,
    TObject<{
      status: TString
      domain: TString
    }>,
  ]>
}> = Type.Object({
  isDedicated: Type.Boolean(),
  instance: Type.Union([
    Type.Null(),
    Type.Object({
      status: Type.String(),
      domain: Type.String(),
    }),
  ]),
})

/**
 * The type for a tenant instance
 */
export type TenantInstance = Static<typeof TenantInstanceSchema>
