import { Command } from "../../common/command.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import {
  type ComputePreSyncSpec,
  type ComputeSlotTier,
  type ComputeWorkloadEnvVar,
  ComputeWorkloadMutationResponseSchema,
  type ComputeWorkloadProbes,
  type ComputeWorkloadScaling,
  type ComputeWorkloadSecretRef,
} from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { CommandError } from "../../exceptions/command-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import {
  type ComputeOperationWaitOptions,
  type ComputeWorkloadMutationOutput,
  waitForComputeOperation,
} from "./wait-for-operation.ts"

/**
 * The input for the compute workload update command
 */
export interface ComputeWorkloadUpdateInput extends ComputeOperationWaitOptions {
  /** The workload id (full UUID) */
  workloadId: string
  /** New container image */
  image?: string
  /** New compute slot tier */
  slotTier?: ComputeSlotTier
  /** New replica count, 1..50. Zero is not accepted here — that is what pause is for */
  replicas?: number
  /** New container port */
  port?: number
  /** Replaces the probe block */
  probes?: ComputeWorkloadProbes
  /** Replaces the pre-sync hook */
  preSync?: ComputePreSyncSpec
  /** Replaces the scaling block WHOLESALE — it is not merged into the stored one */
  scaling?: ComputeWorkloadScaling
  /**
   * Replaces the environment variables WHOLESALE, like `scaling` above.
   * Sending `[]` CLEARS every variable the previous revision set — that is
   * how a variable is removed, as there is no per-key patch.
   */
  env?: ComputeWorkloadEnvVar[]
  /** Replaces the organization-secret bindings wholesale, same rule as `env` */
  secrets?: ComputeWorkloadSecretRef[]
}

/**
 * Update a workload's definition.
 *
 * Answers 202: the change is RECORDED as a new revision and the returned
 * workload is the one still serving. The revision is promoted only when the
 * reconciler reports the returned operation `succeeded`, so a workload whose
 * pre-sync hook fails keeps reporting the previous image — poll the operation
 * (or pass `waitForOperation: true`) before treating the new definition as
 * live.
 *
 * Switching `scaling.mode` from `hpa` to `manual` additionally requires
 * `replicas` in the same call; the service answers 422 without it.
 */
export class ComputeWorkloadUpdateCommand extends Command<ComputeWorkloadUpdateInput, ComputeWorkloadMutationOutput> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE. A PATCH looks idempotent and is not: each call MINTS A REVISION
   * and an operation id server-side, and re-applying a revision re-runs the
   * workload's pre-sync hook. A retried 502 whose original request had
   * already been recorded would append a second identical revision and run
   * the migration hook twice.
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
   * OVERRIDDEN BECAUSE THE UPSTREAM BODY IS `.strict()`. The base
   * implementation sends the WHOLE input, which would put `workloadId` (a
   * path parameter) and the client-side `waitForOperation` /
   * `operationTimeoutMs` / `operationPollIntervalMs` knobs into the JSON —
   * and every one of them is a key `UpdateWorkloadRequestSchema` does not
   * list, so the service would answer 422 on the very first call.
   */
  protected override getBody(): Record<string, unknown> {
    const {
      workloadId: _workloadId,
      waitForOperation: _waitForOperation,
      operationTimeoutMs: _operationTimeoutMs,
      operationPollIntervalMs: _operationPollIntervalMs,
      ...payload
    } = this.input
    if (Object.keys(payload).length === 0) {
      throw new CommandError(this.constructor.name, "No fields to update")
    }
    return payload
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
