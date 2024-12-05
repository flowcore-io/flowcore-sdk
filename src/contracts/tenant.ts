import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

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
  website: TString
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
  displayName: Type.String(),
  description: Type.String(),
  website: Type.String(),
})
/**
 * The type for a tenant
 */
export type Tenant = Static<typeof TenantSchema>

/**
 * The schema for a tenant v0
 */
export const TenantV0Schema: TObject<{
  id: TString
  org: TString
  displayName: TString
  description: TString
  website: TString
}> = Type.Object({
  id: Type.String(),
  org: Type.String(),
  displayName: Type.String(),
  description: Type.String(),
  website: Type.String(),
})

/**
 * The type for a tenant v0
 */
export type TenantV0 = Static<typeof TenantV0Schema>

/**
 * Convert a data core v0 to a data core
 */
export const tenantV0ToTenant = (
  tenantV0: TenantV0,
): Tenant => {
  return {
    id: tenantV0.id,
    name: tenantV0.org,
    displayName: tenantV0.displayName,
    description: tenantV0.description,
    website: tenantV0.website,
  }
}
