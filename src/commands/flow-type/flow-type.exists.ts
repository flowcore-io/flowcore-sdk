import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the flow type fetch by name command
 */
export interface FlowTypeExistsInput {
  /** The id of the flow type */
  flowTypeId: string
  /** Wait for the flow type to be deleted */
  waitForDelete?: boolean
}

/**
 * The output for the flow type exists command
 */
export interface FlowTypeExistsOutput {
  /** Whether the flow type exists */
  exists: boolean
}

/**
 * Fetch a flow type
 */
export class FlowTypeExistsCommand extends Command<FlowTypeExistsInput, FlowTypeExistsOutput> {
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
    return `/api/v1/flow-types/${this.input.flowTypeId}/exists`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowTypeExistsOutput {
    const response = parseResponseHelper(Type.Object({ exists: Type.Boolean() }), rawResponse)
    return response
  }
}
