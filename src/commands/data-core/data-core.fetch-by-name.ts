import { Command } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"

export type DataCoreFetchByNameInput = {
  organization: string
  dataCore: string
}

export type DataCoreFetchByNameOutput = {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  configuration: { key: string; value: string }[]
} | null

/**
 * Fetch a data core by name and organization
 */
export class DataCoreFetchByNameCommand extends Command<DataCoreFetchByNameInput, DataCoreFetchByNameOutput> {
  private readonly graphQl = `
    query FLOWCORE_SDK_DATA_CORE_FETCH_BY_NAME($organization: String!, $dataCore: String!) {
      organization(search: {org: $organization}) {
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

  private schema = Type.Object({
    data: Type.Object({
      organization: Type.Object({
        datacores: Type.Array(Type.Object({
          id: Type.String(),
          name: Type.String(),
          description: Type.Union([Type.String(), Type.Null()]),
          isPublic: Type.Boolean(),
          configuration: Type.Array(Type.Object({ key: Type.String(), value: Type.String() })),
        })),
      }),
    }),
  })

  public override parseResponse(response: unknown): DataCoreFetchByNameOutput {
    if (!Value.Check(this.schema, response)) {
      const errors = Value.Errors(this.schema, response)
      for (const error of errors) {
        console.error(error.path, error.message)
      }
      console.log("Got", response)
      throw new Error("Invalid response")
    }
    return response.data.organization.datacores[0] ?? null
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
