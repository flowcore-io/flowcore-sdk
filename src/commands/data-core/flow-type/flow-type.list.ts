import { GraphQlCommand, NotFoundException, parseResponseHelper } from "@flowcore/sdk-core"
import { Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeV0Schema, flowTypeV0ToFlowType } from "./flow-type.contract.ts"

/**
 * The input for the flow type list command
 */
export type FlowTypeListInput = {
  /** the data core id */
  dataCoreId: string
}

const graphQlQuery = `
  query FLOWCORE_SDK_FLOW_TYPE_LIST($dataCoreId: ID!) {
    datacore(search: {id: $dataCoreId}) {
      organization {
        id
      }
      flowtypes {
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
 * Fetch all flow types for a data core
 */
export class FlowTypeListCommand extends GraphQlCommand<FlowTypeListInput, FlowType[]> {
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowType[] {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.datacore) {
      throw new NotFoundException("DataCore", this.input.dataCoreId)
    }
    const organizationId = response.data.datacore.organization.id
    const dataCoreId = this.input.dataCoreId
    return response.data.datacore.flowtypes.map((flowType) =>
      flowTypeV0ToFlowType(flowType, organizationId, dataCoreId)
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
