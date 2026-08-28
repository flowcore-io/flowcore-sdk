import { Command } from "../../common/command.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { ComputeWorkloadRunResponseSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import {
  type ComputeOperationWaitOptions,
  type ComputeWorkloadRunOutput,
  waitForComputeOperation,
} from "./wait-for-operation.ts"

/**
 * The input for the compute workload run command
 */
export interface ComputeWorkloadRunInput extends ComputeOperationWaitOptions {
  /** The workload id (full UUID) — must be a workload of kind `job` */
  workloadId: string
}

/**
 * Run a batch job workload on demand.
 *
 * The API mints BOTH the run id (which names the Kubernetes Job, `run-<runId>`)
 * and the operation id, and awaits its own write, so the 202 names a run that
 * `ComputeWorkloadRunsListCommand` already lists. The reconciler then runs the
 * tenant's quota pre-flight, creates the Job and polls it to completion.
 *
 * Answers 409 for a service-kind workload.
 */
export class ComputeWorkloadRunCommand extends Command<ComputeWorkloadRunInput, ComputeWorkloadRunOutput> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a run mints a run id and spends the tenant's compute quota, so a
   * retried 502 would start the job twice.
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
    return `/api/v1/workloads/${this.input.workloadId}/run`
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
  protected override parseResponse(rawResponse: unknown): ComputeWorkloadRunOutput {
    return parseResponseHelper(ComputeWorkloadRunResponseSchema, rawResponse)
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
   * Optionally wait for the run to reach a terminal state
   */
  protected override async processResponse(
    client: FlowcoreClient,
    response: ComputeWorkloadRunOutput,
  ): Promise<ComputeWorkloadRunOutput> {
    if (!this.input.waitForOperation) {
      return response
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input)
    return { ...response, operation }
  }
}
