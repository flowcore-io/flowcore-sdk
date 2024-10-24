import { GraphQlCommand } from "../../common/command.ts"
import { type TArray, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeV0Schema, flowTypeV0ToFlowType } from "../../contracts/flow-type.ts"
import { parseResponse } from "../../utils/parse-response.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

export type FlowTypeFetchByNameInput = {
  dataCoreId: string
  flowType: string
}

/**
 * Fetch a flow type by name and data core id
 */
export class FlowTypeFetchByNameCommand extends GraphQlCommand<FlowTypeFetchByNameInput, FlowType> {
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
      datacore: TUnion<[
        TObject<{
          organization: TObject<{
            id: TString
          }>
          flowtypes: TArray<typeof FlowTypeV0Schema>
        }>,
        TNull,
      ]>
    }>
  }> = Type.Object({
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

  protected override parseResponse(rawResponse: unknown): FlowType {
    const response = parseResponse(this.schema, rawResponse)
    if (!response.data.datacore?.flowtypes?.[0]) {
      throw new NotFoundException("FlowType", this.input.flowType)
    }
    return flowTypeV0ToFlowType(
      response.data.datacore.flowtypes[0],
      response.data.datacore.organization.id,
      this.input.dataCoreId,
    )
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: this.input,
    })
  }
}
