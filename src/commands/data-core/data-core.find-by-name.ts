import { Command } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"

export interface DataCoreFindByNameInput {
  organization: string
  dataCore: string
}

export type DataCoreFindByNameOutput = {
  id: string
}[]

/**
 * Fetch a data core
 */
export class DataCoreFindByNameCommand extends Command<DataCoreFindByNameInput, DataCoreFindByNameOutput> {
  private readonly graphQl = `
    query FLOWCORE_SDK_DATA_CORE_FIND_BY_NAME($organization: String!, $dataCore: String!) {
      organization(search: {org: $organization}) {
        datacores(search: { name: $dataCore }) {
          id
        }
      }
    }
  `

  private schema = Type.Object({
    data: Type.Object({
      organization: Type.Object({
        datacores: Type.Array(Type.Object({ id: Type.String() })),
      }),
    }),
  })

  public override parseResponse(response: unknown): DataCoreFindByNameOutput {
    if (!Value.Check(this.schema, response)) {
      const errors = Value.Errors(this.schema, response)
      for (const error of errors) {
        console.error(error.path, error.message)
      }
      throw new Error("Invalid response")
    }
    return response.data.organization.datacores
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
