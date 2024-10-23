import { Command } from "../../common/command.ts"
import { type TArray, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"
import { type DataCore, DataCoreV0Schema, dataCoreV0ToDataCore } from "../../contracts/data-core.ts"
import { parseResponse } from "../../utils/parse-response.ts"

export type DataCoreFetchByNameInput = {
  organization: string
  dataCore: string
}

export type DataCoreFetchByNameOutput = DataCore

/**
 * Fetch a data core by name and organization
 */
export class DataCoreFetchByNameCommand extends Command<DataCoreFetchByNameInput, DataCoreFetchByNameOutput> {
  private readonly graphQl = `
    query FLOWCORE_SDK_DATA_CORE_FETCH_BY_NAME($organization: String!, $dataCore: String!) {
      organization(search: {org: $organization}) {
        id
        datacores(search: { name: $dataCore }) {
          id
          name
          description
          isPublic
          configuration {
            key
            value
          }
        }
      }
    }
  `

  protected override schema: TObject<{
    data: TObject<{
      organization: TUnion<[
        TObject<{
          id: TString
          datacores: TArray<typeof DataCoreV0Schema>
        }>,
        TNull,
      ]>
    }>
  }> = Type.Object({
    data: Type.Object({
      organization: Type.Union([
        Type.Object({
          id: Type.String(),
          datacores: Type.Array(DataCoreV0Schema),
        }),
        Type.Null(),
      ]),
    }),
  })

  protected override parseResponse(rawResponse: unknown): DataCoreFetchByNameOutput {
    const response = parseResponse(this.schema, rawResponse)
    if (!response.data.organization?.datacores?.[0]) {
      throw new Error("No data core found")
    }
    return dataCoreV0ToDataCore(response.data.organization.datacores[0], response.data.organization.id)
  }

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: {
        organization: this.input.organization,
        dataCore: this.input.dataCore,
      },
    })
  }
}
