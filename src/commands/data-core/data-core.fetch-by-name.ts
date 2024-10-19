import { Command } from "../../common/command.ts"
import { type Static, Type } from "@sinclair/typebox"
import { type DataCoreSchema, DataCoreV0Schema, dataCoreV0ToDataCore } from "../../contracts/data-core.ts"

export type DataCoreFetchByNameInput = {
  organization: string
  dataCore: string
}

export type DataCoreFetchByNameOutput = Static<typeof DataCoreSchema> | null

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

  protected override schema = Type.Object({
    data: Type.Object({
      organization: Type.Object({
        id: Type.String(),
        datacores: Type.Array(DataCoreV0Schema),
      }),
    }),
  })

  protected override parseResponse(rawResponse: unknown): DataCoreFetchByNameOutput {
    const response = super.parseResponse<typeof this.schema>(rawResponse)
    if (response.data.organization.datacores[0]) {
      return dataCoreV0ToDataCore(response.data.organization.datacores[0], response.data.organization.id)
    }
    return null
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
