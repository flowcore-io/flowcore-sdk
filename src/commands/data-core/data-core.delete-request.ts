import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { DataCoreExistsCommand } from "./data-core.exists.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"

/**
 * The input for the data core delete request command
 */
export interface DataCoreDeleteRequestInput {
  /** The id of the data core */
  dataCoreId: string
  /** Wait for the data core to be deleted (default: true) */
  waitForDelete?: boolean
}

const graphQlQuery = `
  mutation FLOWCORE_SDK_DATA_CORE_DELETE_REQUEST($dataCoreId: ID!) {
    datacore(id: $dataCoreId) {
      requestDelete {
        deleting
      }
    }
  }
`

const responseSchema = Type.Object({
  errors: Type.Optional(Type.Array(Type.Object({
    message: Type.String(),
  }))),
  data: Type.Object({
    datacore: Type.Object({
      requestDelete: Type.Union([
        Type.Object({
          deleting: Type.Boolean(),
        }),
        Type.Null(),
      ]),
    }),
  }),
})

/**
 * Request to delete a data core
 */
export class DataCoreDeleteRequestCommand extends GraphQlCommand<DataCoreDeleteRequestInput, boolean> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Create a new data core delete request command
   */
  constructor(input: DataCoreDeleteRequestInput) {
    super({
      ...input,
      waitForDelete: input.waitForDelete ?? true,
    })
  }

  /**
   * Parse the response
   */
  protected override parseResponse(response: unknown): boolean {
    const parsedResponse = parseResponseHelper(responseSchema, response)
    if (parsedResponse.errors) {
      throw new CommandError(this.constructor.name, parsedResponse.errors[0].message)
    }
    if (!parsedResponse.data.datacore?.requestDelete) {
      throw new NotFoundException("DataCore", { id: this.input.dataCoreId })
    }
    return parsedResponse.data.datacore.requestDelete.deleting
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      query: graphQlQuery,
      variables: this.input,
    }
  }

  /**
   * Wait for the response (timeout: 25 seconds)
   */
  protected override async processResponse(client: FlowcoreClient, response: boolean): Promise<boolean> {
    if (!this.input.waitForDelete) {
      return response
    }
    const start = Date.now()
    while (Date.now() - start < 25_000) {
      const response = await client.execute(
        new DataCoreExistsCommand({
          dataCoreId: this.input.dataCoreId,
        }),
      )
      if (!response.exists) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return response
  }
}
