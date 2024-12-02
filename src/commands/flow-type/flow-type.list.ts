import { Command } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { type FlowType, FlowTypeSchema } from "../../contracts/flow-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the flow type list command
 */
export type FlowTypeListInput = {
  /** the data core id */
  dataCoreId: string
}

/**
 * Fetch all flow types for a data core
 */
export class FlowTypeListCommand extends Command<FlowTypeListInput, FlowType[]> {
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
    return `/api/v1/flow-types?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowType[] {
    const response = parseResponseHelper(Type.Array(FlowTypeSchema), rawResponse)
    return response
  }
}
