import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

/**
 * The input for the data core request delete command
 */
export interface DataCoreRequestDeleteInput {
  /** The id of the data core */
  dataCoreId: string
}

/**
 * The output for the data core request delete command
 */
export interface DataCoreRequestDeleteOutput {
  /** The success of the data core delete request */
  success: boolean
}

/**
 * Request to delete a data core
 */
export class DataCoreRequestDeleteCommand extends Command<DataCoreRequestDeleteInput, DataCoreRequestDeleteOutput> {
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
    return `/api/v1/data-cores/${this.input.dataCoreId}/request-delete`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCoreRequestDeleteOutput {
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
      throw new NotFoundException("DataCore", {
        "id": this.input.dataCoreId,
      })
    }
    throw error
  }
}
