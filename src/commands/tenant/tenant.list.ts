import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { TenantV0Schema, tenantV0ToTenant, type TenantWithLinkType } from "../../contracts/tenant.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"

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
  data: Type.Union(
    [
      Type.Object({
        me: Type.Object({
          organizations: Type.Array(Type.Object({
            linkType: Type.Union([Type.Literal("OWNER"), Type.Literal("COLLABORATOR")]),
            organization: TenantV0Schema,
          })),
        }),
      }),
      Type.Null(),
    ],
  ),
  errors: Type.Optional(Type.Array(Type.Object({
    message: Type.String(),
    path: Type.Optional(Type.Array(Type.String())),
  }))),
})

/**
 * List tenants
 */
export class TenantListCommand extends GraphQlCommand<void, TenantWithLinkType[]> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantWithLinkType[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (response.errors?.length) {
      throw new CommandError(this.constructor.name, response.errors.map((error) => error.message).join("; "))
    } else if (!response.data) {
      throw new CommandError(this.constructor.name, "No data returned from the command")
    }
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
