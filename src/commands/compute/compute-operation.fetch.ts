import { Command } from "../../common/command.ts"
import { type ComputeOperation, ComputeOperationSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute operation fetch command
 */
export interface ComputeOperationFetchInput {
  /** The operation id (full UUID) */
  operationId: string
}

/**
 * Inspect an asynchronous workload mutation operation.
 *
 * The compute service answers 404 until the in-cluster reconciler files its
 * FIRST progress report for the operation — the API mints the id and emits
 * the event, but it holds no Kubernetes credentials and never seeds an
 * operation row. A 404 shortly after a 202 therefore means "not yet", not
 * "gone"; see `waitForComputeOperation`, which treats it that way.
 *
 * The response is a BARE operation object — this endpoint uses no
 * `{ success: true, ... }` envelope.
 */
export class ComputeOperationFetchCommand extends Command<ComputeOperationFetchInput, ComputeOperation> {
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
    return "https://compute.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/operations/${this.input.operationId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeOperation {
    return parseResponseHelper(ComputeOperationSchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Operation", {
        operationId: this.input.operationId,
      })
    }
    throw error
  }
}
