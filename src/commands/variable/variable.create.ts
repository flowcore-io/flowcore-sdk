import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { Variable } from "../../contracts/variable.ts"
import { CommandError } from "../../exceptions/command-error.ts"

/**
 * The input for the variable create command
 */
export interface VariableCreateInput {
  /** The tenant id */
  tenantId: string
  /** The key of the variable */
  key: string
  /** The value of the variable */
  value: string
}

const graphQlQueryById = `
  mutation FLOWCORE_SDK_VARIABLE_CREATE($tenantId: ID!, $key: String!, $value: String!) {
    organization(id: $tenantId) {
      createVariable(key: $key, value: $value)
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
        createVariable: Type.Union([Type.Boolean(), Type.Null()]),
      }),
    }),
    Type.Null(),
  ]),
})

/**
 * Create a variable
 */
export class VariableCreateCommand extends GraphQlCommand<VariableCreateInput, Variable> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Variable {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (response.errors) {
      throw new CommandError(this.constructor.name, response.errors[0].message)
    }
    if (!response.data || response.data.organization.createVariable !== true) {
      throw new CommandError(this.constructor.name, "Failed to create variable")
    }
    return {
      key: this.input.key,
      value: this.input.value,
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
