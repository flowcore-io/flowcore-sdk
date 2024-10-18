import { Command } from "../../common/command.ts"

interface DataCoreCreateInput {
  organizationId: string
  name: string
}

interface DataCoreCreateOutput {
  id: string
  name: string
}

export class DataCoreCreateCommand extends Command<DataCoreCreateInput, DataCoreCreateOutput> {
  private readonly graphQl = `
    mutation FLOWCORE_SDK_CREATE_DATA_CORE($organizationId: ID!, $input: CreateDatacoreInput!) {
      organization(id: $organizationId) {
        createDatacore(input: $input)
      }
    }
  `

  protected override getBody(): string {
    return JSON.stringify({
      query: this.graphQl,
      variables: {
        organizationId: this.input.organizationId,
        input: {
          name: this.input.name,
        },
      },
    })
  }
}
