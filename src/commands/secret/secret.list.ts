import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"

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
  errors: Type.Optional(
    Type.Array(
      Type.Object({
        message: Type.String(),
      }),
    ),
  ),
  data: Type.Object({
    organization: Type.Object({
      secrets: Type.Union([
        Type.Array(Type.String()),
        Type.Null(),
      ]),
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
    if (response.errors) {
      throw new CommandError(this.constructor.name, response.errors[0].message)
    }
    if (response.data.organization.secrets === null) {
      throw new CommandError(this.constructor.name, "Failed to list secrets")
    }
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
