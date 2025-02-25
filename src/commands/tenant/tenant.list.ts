import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"

interface TenantListItem {
  id: string
  name: string
  displayName: string
  description: string
  websiteUrl: string
  linkType: "OWNER" | "COLLABORATOR"
}

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
            organization: Type.Object({
              id: Type.String(),
              org: Type.String(),
              displayName: Type.String(),
              description: Type.String(),
              website: Type.String(),
            }),
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
export class TenantListCommand extends GraphQlCommand<void, TenantListItem[]> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantListItem[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (response.errors?.length) {
      throw new CommandError(this.constructor.name, response.errors.map((error) => error.message).join("; "))
    } else if (!response.data) {
      throw new CommandError(this.constructor.name, "No data returned from the command")
    }
    return response.data.me.organizations.flatMap((organization) => ({
      id: organization.organization.id,
      name: organization.organization.org,
      displayName: organization.organization.displayName,
      description: organization.organization.description,
      websiteUrl: organization.organization.website,
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
