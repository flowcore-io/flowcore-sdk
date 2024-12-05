import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { type Tenant, TenantV0Schema, tenantV0ToTenant } from "../../contracts/tenant.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

/**
 * The input for the tenant fetch by id command
 */
type TenantFetchByIdInput = {
  /** The id of the tenant */
  tenantId: string
  /** The name of the tenant */
  tenant?: never
}

/**
 * The input for the tenant fetch by name command
 */
type TenantFetchByNameInput = {
  /** The name of the tenant */
  tenant: string
  /** The id of the tenant */
  tenantId?: never
}

/**
 * The input for the tenant fetch command
 */
export type TenantFetchInput = TenantFetchByIdInput | TenantFetchByNameInput

const graphQlQueryById = `
  query FLOWCORE_SDK_TENANT_FETCH($tenantId: ID!) {
    organization(search: {id: $tenantId}) {
      id
      org
      displayName
      description
      website
    }
  }
`

const graphQlQueryByName = `
  query FLOWCORE_SDK_TENANT_FETCH($tenant: String) {
    organization(search: {org: $tenant}) {
      id
      org
      displayName
      description
      website
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    organization: Type.Union([
      TenantV0Schema,
      Type.Null(),
    ]),
  }),
})

/**
 * Fetch a tenant
 */
export class TenantFetchCommand extends GraphQlCommand<TenantFetchInput, Tenant> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Tenant {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.organization) {
      throw new NotFoundException("Tenant", this.input.tenantId ?? this.input.tenant)
    }
    return tenantV0ToTenant(response.data.organization)
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string {
    if ("tenantId" in this.input) {
      return JSON.stringify({
        query: graphQlQueryById,
        variables: this.input,
      })
    }
    return JSON.stringify({
      query: graphQlQueryByName,
      variables: this.input,
    })
  }
}
