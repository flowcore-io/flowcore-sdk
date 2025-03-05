import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type FlowType, FlowTypeSchema } from "../../contracts/flow-type.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

/**
 * The input for the flow type request delete command
 */
export interface FlowTypeRequestDeleteInput {
  /** The id of the flow type */
  flowTypeId: string
}

/**
 * The output for the flow type request delete command
 */
export interface FlowTypeRequestDeleteOutput {
  success: boolean
}

/**
 * Request to delete a flow type
 */
export class FlowTypeRequestDeleteCommand extends Command<FlowTypeRequestDeleteInput, FlowTypeRequestDeleteOutput> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "DELETE"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://delete-manager.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/flow-types/${this.input.flowTypeId}/request-delete`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowTypeRequestDeleteOutput {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean(),
      }),
      rawResponse,
    )
    return response
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("FlowType", {
        "id": this.input.flowTypeId,
      })
    }
    throw error
  }
}
