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
 * The input for the compute workload rollback command
 */
export interface ComputeWorkloadRollbackInput extends ComputeOperationWaitOptions {
  /** The workload id (full UUID) */
  workloadId: string
}

/**
 * Roll a workload back to its previous revision.
 *
 * History is append-only, so this APPENDS a revision rather than rewinding
 * the counter: rolling back to revision 1 from revision 2 makes revision 3
 * active with revision 1's definition, and the workload then reports
 * `activeRevision: 3, rolledBackFrom: 1`.
 *
 * Answers 409 when there is no earlier revision to restore.
 */
export class ComputeWorkloadRollbackCommand extends Command<
  ComputeWorkloadRollbackInput,
  ComputeWorkloadMutationOutput
> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a rollback mints a revision and an operation id, and re-runs the
   * target revision's pre-sync hook.
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
    return `/api/v1/workloads/${this.input.workloadId}/rollback`
  }

  /**
   * Get the body for the request.
   *
   * The route takes NO body — the target revision is derived server-side.
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
   * Optionally wait for the cluster to converge
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
