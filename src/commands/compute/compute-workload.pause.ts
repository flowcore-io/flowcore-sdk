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
 * The input for the compute workload pause command
 */
export interface ComputeWorkloadPauseInput extends ComputeOperationWaitOptions {
  /** The workload id (full UUID) */
  workloadId: string
}

/**
 * Pause a workload, keeping its configuration.
 *
 * The reconciler patches ONLY the Deployment's `spec.replicas` to 0 — nothing
 * is deleted and no definition field changes, so the workload reports status
 * `stopped` with `paused: true` while its full configuration stays visible.
 * A pause mints no revision, so it never appears in the rollback history.
 *
 * Answers 409 for a job-kind workload (it has no Deployment) and for a
 * workload that is already paused.
 */
export class ComputeWorkloadPauseCommand extends Command<ComputeWorkloadPauseInput, ComputeWorkloadMutationOutput> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a pause mints an operation id, and the service answers 409 to a
   * second pause — a retry of an already-recorded request would surface that
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
    return `/api/v1/workloads/${this.input.workloadId}/pause`
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
   * Optionally wait for the scale-down to finish
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
