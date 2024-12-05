import { Command } from "../../common/command.ts"
import { type FlowType, FlowTypeSchema } from "../../contracts/flow-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the flow type update command
 */
export type FlowTypeUpdateInput = {
  /** The id of the data core */
  flowTypeId: string
  /** The description of the flow type */
  description: string
}

/**
 * Update a flow type
 */
export class FlowTypeUpdateCommand extends Command<FlowTypeUpdateInput, FlowType> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
    return `/api/v1/flow-types/${this.input.flowTypeId}`
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string | undefined {
    const { flowTypeId: _flowTypeId, ...payload } = this.input
    return JSON.stringify(payload)
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowType {
    return parseResponseHelper(FlowTypeSchema, rawResponse)
  }
}
