import { Command } from "../../common/command.ts"

export interface DataCoreFetchInput {
  organization: string
  dataCore: string
}

export type DataCoreFetchOutput = {
  id: string
  name: string
}[]

/**
 * Fetch a data core
 */
export class DataCoreFetchCommand extends Command<DataCoreFetchInput, DataCoreFetchOutput> {
  private readonly graphQl = `
    query FLOWCORE_CLI_FETCH_DATA_CORE($organization: String!, $dataCore: String!) {
      organization(search: {org: $organization}) {
        datacores(search: { name: $dataCore }) {
          id
          name
        }
      }
    }
  `

  public override parseResponse(response: unknown): DataCoreFetchOutput {
    return (response as { data: { organization: { datacores: DataCoreFetchOutput } } }).data.organization.datacores
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
