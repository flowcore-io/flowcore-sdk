import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the secret list command
 */
export interface SecretListInput {
  /** The tenant id */
  tenantId: string
}

const graphQlQueryById = `
  query FLOWCORE_SDK_SECRET_LIST($tenantId: ID!) {
    organization(search: {id: $tenantId}) {
      secrets
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    organization: Type.Object({
      secrets: Type.Array(Type.String()),
    }),
  }),
})

/**
 * List secrets
 */
export class SecretListCommand extends GraphQlCommand<SecretListInput, string[]> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): string[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response.data.organization.secrets
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
