import { Command } from "../../common/command.ts"
import { type FlowType, FlowTypeSchema } from "../../contracts/flow-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the data core create command
 */
export interface FlowTypeCreateInput {
  /** The id of the data core */
  dataCoreId: string
  /** The name of the flow type */
  name: string
  /** The description of the flow type */
  description: string
}

/**
 * Create a flow type
 */
export class FlowTypeCreateCommand extends Command<FlowTypeCreateInput, FlowType> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "POST"
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
    return `/api/v1/flow-types`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowType {
    return parseResponseHelper(FlowTypeSchema, rawResponse)
  }
}
