import { Command } from "../../common/command.ts"
import { type TArray, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeV0Schema, flowTypeV0ToFlowType } from "../../contracts/flow-type.ts"
import { parseResponse } from "../../utils/parse-response.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

export type FlowTypeListInput = {
  dataCoreId: string
}

export type FlowTypeListOutput = FlowType[]

/**
 * Fetch all flow types for a data core
 */
export class FlowTypeListCommand extends Command<FlowTypeListInput, FlowTypeListOutput> {
  private readonly graphQl = `
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

  protected override parseResponse(rawResponse: unknown): FlowTypeListOutput {
    const response = parseResponse(this.schema, rawResponse)
    if (!response.data.datacore) {
      throw new NotFoundException("DataCore", this.input.dataCoreId)
    }
    const organizationId = response.data.datacore.organization.id
    const dataCoreId = this.input.dataCoreId
    return response.data.datacore.flowtypes.map((flowType) =>
      flowTypeV0ToFlowType(flowType, organizationId, dataCoreId)
    )
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
