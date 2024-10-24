import { GraphQlCommand } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { type DataCore, DataCoreV0Schema, dataCoreV0ToDataCore } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

/**
 * The input for the data core fetch by name command
 */
export type DataCoreFetchByNameInput = {
  /**
   * The organization slug
   */
  organization: string
  /**
   * The data core slug
   */
  dataCore: string
}

const graphQlQuery = `
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

const responseSchema = Type.Object({
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

/**
 * Fetch a data core by name and organization
 */
export class DataCoreFetchByNameCommand extends GraphQlCommand<DataCoreFetchByNameInput, DataCore> {
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCore {
    const response = parseResponseHelper(responseSchema, rawResponse)
    if (!response.data.organization) {
      throw new NotFoundException("Organization", this.input.organization)
    }
    if (!response.data.organization.datacores?.[0]) {
      throw new NotFoundException("DataCore", this.input.dataCore)
    }
    return dataCoreV0ToDataCore(response.data.organization.datacores[0], response.data.organization.id)
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string {
    return JSON.stringify({
      query: graphQlQuery,
      variables: this.input,
    })
  }
}
