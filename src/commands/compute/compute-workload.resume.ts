import { Command } from "../../common/command.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { ComputeWorkloadMutationResponseSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import {
  type ComputeOperationWaitOptions,
  type ComputeWorkloadMutationOutput,
  waitForComputeOperation,
} from "./wait-for-operation.ts"

/**
 * The input for the compute workload resume command
 */
export interface ComputeWorkloadResumeInput extends ComputeOperationWaitOptions {
  /** The workload id (full UUID) */
  workloadId: string
}

/**
 * Resume a paused workload unchanged.
 *
 * The reconciler runs the SAME tenant quota pre-flight a create runs before
 * scaling the Deployment back: pausing frees the tenant's quota mechanically,
 * so the headroom a resume needs may have been taken while it was paused. A
 * REFUSED RESUME IS NOT AN ERROR ON THIS CALL — it still answers 202, and the
 * operation then fails with the quota reason while the workload stays paused.
 * Pass `waitForOperation: true` (or poll the operation) to see that outcome.
 *
 * Answers 409 for a job-kind workload and for a workload that is not paused.
 */
export class ComputeWorkloadResumeCommand extends Command<ComputeWorkloadResumeInput, ComputeWorkloadMutationOutput> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a resume mints an operation id, and the service answers 409 to a
   * second resume — a retry of an already-recorded request would surface that
   * conflict as the caller's answer.
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
    return "https://compute.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/workloads/${this.input.workloadId}/resume`
  }

  /**
   * Get the body for the request. The route takes NO body.
   */
  protected override getBody(): undefined {
    return undefined
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkloadMutationOutput {
    return parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse)
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

  /**
   * Optionally wait for the scale-up to finish
   */
  protected override async processResponse(
    client: FlowcoreClient,
    response: ComputeWorkloadMutationOutput,
  ): Promise<ComputeWorkloadMutationOutput> {
    if (!this.input.waitForOperation) {
      return response
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input)
    return { ...response, operation }
  }
}
