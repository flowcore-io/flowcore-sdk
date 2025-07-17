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
        configurationRepoCredentials: TString
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
        configurationRepoCredentials: Type.String(),
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
  tenant: TString
  displayName: TString
  description: TString
  websiteUrl: TString
  isDedicated: TBoolean
  permissions: TArray<TString>
}> = Type.Object({
  id: Type.String(),
  tenant: Type.String(),
  displayName: Type.String(),
  description: Type.String(),
  websiteUrl: Type.String(),
  isDedicated: Type.Boolean(),
  permissions: Type.Array(Type.String()),
})

/**
 * The type for a tenant list item
 */
export type TenantListItem = Static<typeof TenantListItemSchema>
