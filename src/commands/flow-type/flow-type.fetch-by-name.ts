import { Command } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeSchema } from "../../contracts/flow-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

/**
 * The input for the flow type fetch by name command
 */
export type FlowTypeFetchByNameInput = {
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowType: string
}

/**
 * Fetch a flow type by name and data core id
 */
export class FlowTypeFetchByNameCommand extends Command<FlowTypeFetchByNameInput, FlowType> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://flow-type-2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    queryParams.set("dataCoreId", this.input.dataCoreId)
    queryParams.set("name", this.input.flowType)
    return `/api/v1/flow-types?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowType {
    const response = parseResponseHelper(Type.Array(FlowTypeSchema), rawResponse)
    if (response.length === 0) {
      throw new NotFoundException("FlowType", this.input.flowType)
    }
    return response[0]
  }
}
