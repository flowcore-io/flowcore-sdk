import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { TenantV0Schema, tenantV0ToTenant, type TenantWithLinkType } from "../../contracts/tenant.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

const graphQlQueryById = `
  query FLOWCORE_SDK_TENANT_LIST {
    me {
      organizations {
        linkType
        organization {
          id
          org
          displayName
          description
          website
        }
      }
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    me: Type.Object({
      organizations: Type.Array(Type.Object({
        linkType: Type.Union([Type.Literal("OWNER"), Type.Literal("COLLABORATOR")]),
        organization: TenantV0Schema,
      })),
    }),
  }),
})

/**
 * List tenants
 */
export class TenantListCommand extends GraphQlCommand<Record<string, never>, TenantWithLinkType[]> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantWithLinkType[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response.data.me.organizations.flatMap((organization) => ({
      ...tenantV0ToTenant(organization.organization),
      linkType: organization.linkType,
    }))
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      query: graphQlQueryById,
    }
  }
}
