import { Command } from "../../common/command.ts"
import { type TArray, type TObject, type TString, Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeV0Schema, flowTypeV0ToFlowType } from "../../contracts/flow-type.ts"

export type FlowTypeListInput = {
  dataCoreId: string
}

export type FlowTypeListOutput = FlowType[] | null

/**
 * Fetch all flow types for a data core
 */
export class FlowTypeListCommand extends Command<FlowTypeListInput, FlowTypeListOutput> {
  private readonly graphQl = `
    query FLOWCORE_SDK_FLOW_TYPE_LIST($dataCoreId: ID!) {
      datacore(id: $dataCoreId) {
        organization {
          id
        }
        flowtypes {
          id
          name
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

  protected override parseResponse(rawResponse: unknown): FlowTypeListOutput {
    const response = super.parseResponse<typeof this.schema>(rawResponse)
    if (response.data.datacore.flowtypes[0]) {
      return response.data.datacore.flowtypes.map((flowType) =>
        flowTypeV0ToFlowType(flowType, response.data.datacore.organization.id, this.input.dataCoreId)
      )
    }
    return null
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: {
        dataCoreId: this.input.dataCoreId,
      },
    })
  }
}
