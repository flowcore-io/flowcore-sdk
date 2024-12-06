import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"

/**
 * The input for the variable delete command
 */
export interface VariableDeleteInput {
  /** The tenant id */
  tenantId: string
  /** The key of the variable */
  key: string
}

const graphQlQueryById = `
  mutation FLOWCORE_SDK_VARIABLE_DELETE($tenantId: ID!, $key: String!) {
    organization(id: $tenantId) {
      removeVariable(key: $key)
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
        removeVariable: Type.Union([Type.Boolean(), Type.Null()]),
      }),
    }),
    Type.Null(),
  ]),
})

/**
 * Create a variable
 */
export class VariableDeleteCommand extends GraphQlCommand<VariableDeleteInput, boolean> {
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
    if (!response.data || response.data.organization.removeVariable !== true) {
      throw new CommandError(this.constructor.name, "Failed to delete variable")
    }
    return response.data.organization.removeVariable
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
