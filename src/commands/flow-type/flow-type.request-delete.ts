import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { FlowTypeExistsCommand } from "./flow-type.exists.ts"

/**
 * The input for the flow type request delete command
 */
export interface FlowTypeRequestDeleteInput {
  /** The tenant */
  tenant: string
  /** The id of the flow type */
  flowTypeId: string
  /** Wait for the flow type to be deleted (default: false) */
  waitForDelete?: boolean
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
   * The dedicated subdomain for the command
   */
  protected override dedicatedSubdomain: string = "delete-manager"

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

  /**
   * Wait for the response (timeout: 25 seconds)
   */
  protected override async processResponse(
    client: FlowcoreClient,
    response: FlowTypeRequestDeleteOutput,
  ): Promise<FlowTypeRequestDeleteOutput> {
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
