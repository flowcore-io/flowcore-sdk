import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"

/**
 * The input for the API key delete command
 */
export interface ApiKeyDeleteInput {
  /** The id of the tenant */
  tenantId: string
  /** The id of the API key */
  apiKeyId: string
}

const graphQlQueryById = `
  mutation FLOWCORE_SDK_API_KEY_DELETE($tenantId: ID!, $apiKeyId: ID!) {
    organization(id: $tenantId) {
      deleteApiKey(id: $apiKeyId)
    }
  }
`

const responseSchema = Type.Object({
  errors: Type.Optional(
    Type.Array(
      Type.Object({
        message: Type.String(),
      }),
    ),
  ),
  data: Type.Object({
    organization: Type.Object({
      deleteApiKey: Type.Union([Type.Boolean(), Type.Null()]),
    }),
  }),
})

/**
 * Delete an API key
 */
export class ApiKeyDeleteCommand extends GraphQlCommand<ApiKeyDeleteInput, boolean> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): boolean {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (response.errors) {
      throw new CommandError(this.constructor.name, response.errors[0].message)
    }
    if (response.data.organization.deleteApiKey !== true) {
      throw new CommandError(this.constructor.name, "Failed to delete API key")
    }
    return response.data.organization.deleteApiKey
  }

  /**
   * Get the body for the request
   */
  protected override getBody() {
    return {
      query: graphQlQueryById,
      variables: this.input,
    }
  }
}
