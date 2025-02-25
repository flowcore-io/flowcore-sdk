import {
  type Static,
  TBoolean,
  type TLiteral,
  type TNull,
  type TObject,
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
        TLiteral<"none">,
        TLiteral<"ready">,
        TLiteral<"degraded">,
        TLiteral<"offline">,
      ]>
      configuration: TObject<{
        webhookUrl: TString
        eventSourceUrl: TString
        deleteManagerUrl: TString
        configurationRepoUrl: TString
      }>
    }>,
  ]>
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
        Type.Literal("none"),
        Type.Literal("ready"),
        Type.Literal("degraded"),
        Type.Literal("offline"),
      ]),
      configuration: Type.Object({
        webhookUrl: Type.String(),
        eventSourceUrl: Type.String(),
        deleteManagerUrl: Type.String(),
        configurationRepoUrl: Type.String(),
      }),
    }),
  ]),
})

/**
 * The type for a tenant
 */
export type Tenant = Static<typeof TenantSchema>
