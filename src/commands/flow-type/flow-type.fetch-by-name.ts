import { GraphQlCommand } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeV0Schema, flowTypeV0ToFlowType } from "../../contracts/flow-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

/**
 * The input for the flow type fetch by name command
 */
export type FlowTypeFetchByNameInput = {
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowType: string
}

const graphQlQuery = `
  query FLOWCORE_SDK_FLOW_TYPE_FETCH_BY_NAME($dataCoreId: ID!, $flowType: String!) {
    datacore(search: { id: $dataCoreId }) {
      organization {
        id
      }
      flowtypes(search: { aggregator: $flowType }) {
        id
        aggregator
        description
      }
    }
  }
`

const responseSchema = Type.Object({
  data: Type.Object({
    datacore: Type.Union([
      Type.Object({
        organization: Type.Object({
          id: Type.String(),
        }),
        flowtypes: Type.Array(FlowTypeV0Schema),
      }),
      Type.Null(),
    ]),
  }),
})

/**
 * Fetch a flow type by name and data core id
 */
export class FlowTypeFetchByNameCommand extends GraphQlCommand<FlowTypeFetchByNameInput, FlowType> {
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowType {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.datacore?.flowtypes?.[0]) {
      throw new NotFoundException("FlowType", this.input.flowType)
    }
    return flowTypeV0ToFlowType(
      response.data.datacore.flowtypes[0],
      response.data.datacore.organization.id,
      this.input.dataCoreId,
    )
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string {
    return JSON.stringify({
      query: graphQlQuery,
      variables: this.input,
    })
  }
}
