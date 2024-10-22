import { Command } from "../../common/command.ts"
import { type TArray, type TObject, type TString, Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeV0Schema, flowTypeV0ToFlowType } from "../../contracts/flow-type.ts"
import { parseResponse } from "../../utils/parse-response.ts"

export type FlowTypeFetchByNameInput = {
  dataCoreId: string
  flowType: string
}

export type FlowTypeFetchByNameOutput = FlowType | null

/**
 * Fetch a flow type by name and data core
 */
export class FlowTypeFetchByNameCommand extends Command<FlowTypeFetchByNameInput, FlowTypeFetchByNameOutput> {
  private readonly graphQl = `
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

  protected override schema: TObject<{
    data: TObject<{
      datacore: TObject<{
        organization: TObject<{
          id: TString
        }>
        flowtypes: TArray<typeof FlowTypeV0Schema>
      }>
    }>
  }> = Type.Object({
    data: Type.Object({
      datacore: Type.Object({
        organization: Type.Object({
          id: Type.String(),
        }),
        flowtypes: Type.Array(FlowTypeV0Schema),
      }),
    }),
  })

  protected override parseResponse(rawResponse: unknown): FlowTypeFetchByNameOutput {
    const response = parseResponse(this.schema, rawResponse)
    if (response.data.datacore.flowtypes[0]) {
      return flowTypeV0ToFlowType(
        response.data.datacore.flowtypes[0],
        response.data.datacore.organization.id,
        this.input.dataCoreId,
      )
    }
    return null
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: {
        dataCoreId: this.input.dataCoreId,
        flowType: this.input.flowType,
      },
    })
  }
}
