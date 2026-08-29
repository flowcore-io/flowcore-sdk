import { Command } from "../../common/command.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { ComputeWorkloadDeleteResponseSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import {
  type ComputeOperationWaitOptions,
  type ComputeWorkloadDeleteOutput,
  waitForComputeOperation,
} from "./wait-for-operation.ts"

/**
 * The input for the compute workload delete command
 */
export interface ComputeWorkloadDeleteInput extends ComputeOperationWaitOptions {
  /** The workload id (full UUID) */
  workloadId: string
}

/**
 * Delete a workload and cascade its domain bindings.
 *
 * Answers 202 with the teardown's operation id and NO workload body. Every
 * live domain binding is released first, then the workload leaves
 * `GET /api/v1/workloads` immediately; the in-cluster reconciler removes the
 * Deployment, the Service, the autoscaler and the Jobs asynchronously.
 *
 * `GET /api/v1/workloads/{workloadId}` keeps resolving the workload while the
 * teardown runs, reporting it `archived`.
 */
export class ComputeWorkloadDeleteCommand extends Command<ComputeWorkloadDeleteInput, ComputeWorkloadDeleteOutput> {
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
    return "https://compute.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/workloads/${this.input.workloadId}`
  }

  /**
   * Get the body for the request.
   *
   * The route takes NO body. Left to the base implementation it would send
   * the whole input — the path parameter and the client-side wait knobs — as
   * JSON on a DELETE.
   */
  protected override getBody(): undefined {
    return undefined
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkloadDeleteOutput {
    return parseResponseHelper(ComputeWorkloadDeleteResponseSchema, rawResponse)
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
   * Optionally wait for the teardown to finish
   */
  protected override async processResponse(
    client: FlowcoreClient,
    response: ComputeWorkloadDeleteOutput,
  ): Promise<ComputeWorkloadDeleteOutput> {
    if (!this.input.waitForOperation) {
      return response
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input)
    return { ...response, operation }
  }
}
