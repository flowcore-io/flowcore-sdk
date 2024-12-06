import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ApiKey } from "../../contracts/api-key.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { ApiKeyListCommand } from "./api-key.list.ts"
import { CommandError } from "../../exceptions/command-error.ts"

/**
 * The input for the API key create command
 */
export interface ApiKeyCreateInput {
  /** The tenant id */
  tenantId: string
  /** The name of the API key */
  name: string
}

const graphQlQueryById = `
  mutation FLOWCORE_SDK_API_KEY_CREATE($tenantId: ID!, $name: String!) {
    organization(id: $tenantId) {
      createApiKey(name: $name)
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
  data: Type.Union([
    Type.Object({
      organization: Type.Object({
        createApiKey: Type.Union([Type.String(), Type.Null()]),
      }),
    }),
    Type.Null(),
  ]),
})

/**
 * Create an API key
 */
export class ApiKeyCreateCommand extends GraphQlCommand<ApiKeyCreateInput, ApiKey & { value: string }> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override async parseResponse(
    rawResponse: unknown,
    flowcoreClient: FlowcoreClient,
  ): Promise<ApiKey & { value: string }> {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (response.errors) {
      throw new CommandError(this.constructor.name, response.errors[0].message)
    }
    if (!response.data || response.data?.organization.createApiKey === null) {
      throw new CommandError(this.constructor.name, "Failed to create API key")
    }

    const apiKeys = await flowcoreClient.execute(
      new ApiKeyListCommand({
        tenantId: this.input.tenantId,
      }),
    )

    const apiKey = apiKeys.find((apiKey) => apiKey.name === this.input.name)
    if (!apiKey) {
      throw new Error("API key not found")
    }

    return {
      ...apiKey,
      value: response.data.organization.createApiKey,
    }
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string {
    return JSON.stringify({
      query: graphQlQueryById,
      variables: this.input,
    })
  }
}
