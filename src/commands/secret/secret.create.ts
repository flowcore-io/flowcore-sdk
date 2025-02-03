import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"

/**
 * The input for the secret create command
 */
export interface SecretCreateInput {
  /** The tenant id */
  tenantId: string
  /** The key of the secret */
  key: string
  /** The value of the secret */
  value: string
}

const graphQlQueryById = `
  mutation FLOWCORE_SDK_SECRET_CREATE($tenantId: ID!, $key: String!, $value: String!) {
    organization(id: $tenantId) {
      createSecret(key: $key, value: $value)
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
      createSecret: Type.Union([Type.Boolean(), Type.Null()]),
    }),
  }),
})

/**
 * List secrets
 */
export class SecretCreateCommand extends GraphQlCommand<SecretCreateInput, boolean> {
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
    if (response.data.organization.createSecret === null) {
      throw new CommandError(this.constructor.name, "Failed to create secret")
    }
    return response.data.organization.createSecret
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
