import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"

/**
 * The input for the secret delete command
 */
export interface SecretDeleteInput {
  /** The tenant id */
  tenantId: string
  /** The key of the secret */
  key: string
}

const graphQlQueryById = `
  mutation FLOWCORE_SDK_SECRET_DELETE($tenantId: ID!, $key: String!) {
    organization(id: $tenantId) {
      removeSecret(key: $key)
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
      removeSecret: Type.Union([Type.Boolean(), Type.Null()]),
    }),
  }),
})

/**
 * List secrets
 */
export class SecretDeleteCommand extends GraphQlCommand<SecretDeleteInput, boolean> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): boolean {
    console.log("rawResponse", rawResponse)
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (response.errors) {
      throw new CommandError(this.constructor.name, response.errors[0].message)
    }
    if (response.data.organization.removeSecret !== true) {
      throw new CommandError(this.constructor.name, "Failed to delete secret")
    }
    return response.data.organization.removeSecret
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
