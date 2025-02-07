import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { FlowTypeFetchCommand } from "./flow-type.fetch.ts"
import { CommandError } from "../../exceptions/command-error.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { FlowTypeExistsCommand } from "./flow-type.exists.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

/**
 * The input for the flow type delete request command
 */
export interface FlowTypeDeleteRequestInput {
  /** The id of the flow type */
  flowTypeId: string
  /** Whether to wait for the flow type to be deleted */
  waitForDelete?: boolean
}

const graphQlQuery = `
  mutation FLOWCORE_SDK_FLOW_TYPE_DELETE_REQUEST($flowTypeId: ID!, $dataCoreId: ID!) {
    datacore(id: $dataCoreId) {
      flowtype(id: $flowTypeId) {
        requestDelete {
          deleting
        }
      }
    }
  }
`

const responseSchema = Type.Object({
  errors: Type.Optional(Type.Array(Type.Object({
    message: Type.String(),
  }))),
  data: Type.Union([
    Type.Object({
      datacore: Type.Object({
        flowtype: Type.Object({
          requestDelete: Type.Union([
            Type.Object({
              deleting: Type.Boolean(),
            }),
            Type.Null(),
          ]),
        }),
      }),
    }),
    Type.Null(),
  ]),
})

/**
 * Request to delete a flow type
 */
export class FlowTypeDeleteRequestCommand extends GraphQlCommand<FlowTypeDeleteRequestInput, boolean> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Create a new flow type delete request command
   */
  constructor(input: FlowTypeDeleteRequestInput) {
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
    if (!parsedResponse.data?.datacore?.flowtype?.requestDelete) {
      throw new NotFoundException("FlowType", { id: this.input.flowTypeId })
    }
    return parsedResponse.data.datacore.flowtype.requestDelete.deleting
  }

  public override async getRequest(client: FlowcoreClient): Promise<
    {
      allowedModes: ("apiKey" | "bearer")[]
      body: string | undefined
      headers: Record<string, string>
      baseUrl: string
      path: string
      method: string
      parseResponse: (response: unknown) => boolean | Promise<boolean>
      processResponse: (client: FlowcoreClient, response: boolean) => Promise<boolean>
      handleClientError: (error: ClientError) => void
      retryOnFailure: boolean
    }
  > {
    const request = await super.getRequest(client)

    const response = await client.execute(
      new FlowTypeFetchCommand({
        flowTypeId: this.input.flowTypeId,
      }),
    )

    return {
      ...request,
      body: JSON.stringify({
        query: graphQlQuery,
        variables: {
          flowTypeId: this.input.flowTypeId,
          dataCoreId: response.dataCoreId,
        },
      }),
    }
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
        new FlowTypeExistsCommand({
          flowTypeId: this.input.flowTypeId,
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
