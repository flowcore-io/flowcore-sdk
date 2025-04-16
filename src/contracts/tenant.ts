import {
  type Static,
  type TBoolean,
  type TLiteral,
  type TNull,
  type TObject,
  TOptional,
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
  piiEnabled: TOptional<TBoolean>
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
  piiEnabled: Type.Optional(Type.Boolean()),
})

/**
 * The type for a tenant
 */
export type Tenant = Static<typeof TenantSchema>
