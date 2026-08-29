import { Command } from "../../common/command.ts"
import { type ComputeWorkload, ComputeWorkloadResponseSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload fetch command
 */
export interface ComputeWorkloadFetchInput {
  /** The workload id (full UUID) */
  workloadId: string
}

/**
 * Fetch a single workload.
 *
 * A DELETED workload is deliberately still served, reporting `archived`, so
 * that a client holding the 202 of a delete can keep resolving it while the
 * teardown runs.
 *
 * Response envelope: `{ success: true, workload: {...} }`, unwrapped here.
 */
export class ComputeWorkloadFetchCommand extends Command<ComputeWorkloadFetchInput, ComputeWorkload> {
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
    return `/api/v1/workloads/${this.input.workloadId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkload {
    return parseResponseHelper(ComputeWorkloadResponseSchema, rawResponse).workload
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId,
      })
    }
    throw error
  }
}
