import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { Variable } from "../../contracts/variable.ts"

/**
 * The input for the variable list command
 */
export interface VariableListInput {
  /** The tenant id */
  tenantId: string
}

const graphQlQueryById = `
  query FLOWCORE_SDK_VARIABLE_LIST($tenantId: ID!) {
    organization(search: {id: $tenantId}) {
      variables {
        key
        value
      }
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    organization: Type.Object({
      variables: Type.Array(Type.Object({
        key: Type.String(),
        value: Type.String(),
      })),
    }),
  }),
})

/**
 * List variables
 */
export class VariableListCommand extends GraphQlCommand<VariableListInput, Variable[]> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Variable[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response.data.organization.variables
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