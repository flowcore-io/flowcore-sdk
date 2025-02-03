import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ApiKey } from "../../contracts/api-key.ts"

/**
 * The input for the API key list command
 */
export interface ApiKeyListInput {
  /** The tenant id */
  tenantId: string
}

const graphQlQueryById = `
  query FLOWCORE_SDK_API_KEY_LIST($tenantId: ID!) {
    organization(search: {id: $tenantId}) {
      apiKeys {
        id
        name
        createdAt
      }
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    organization: Type.Object({
      apiKeys: Type.Array(Type.Object({
        id: Type.String(),
        name: Type.String(),
        createdAt: Type.String(),
      })),
    }),
  }),
})

/**
 * List api keys
 */
export class ApiKeyListCommand extends GraphQlCommand<ApiKeyListInput, ApiKey[]> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ApiKey[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response.data.organization.apiKeys
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
