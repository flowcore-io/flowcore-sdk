import { Command } from "../../common/command.ts"
import { type ComputeWorkloadDeploymentEvents, ComputeWorkloadDeploymentEventsSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload events list command
 */
export interface ComputeWorkloadEventsListInput {
  /** The workload id (full UUID) */
  workloadId: string
}

/**
 * List a workload's recent KUBERNETES deployment events, most recently seen
 * first.
 *
 * These are cluster events, not Flowcore events: the workload's Deployment,
 * Service and autoscaler, its ReplicaSets, its pods and its pre-sync and run
 * Jobs, read live across both Kubernetes API groups, merged and deduplicated.
 * The namespace and every object name are derived SERVER-SIDE from the
 * workload projection, so there is deliberately no namespace or selector
 * parameter here.
 *
 * NO PAGINATION, and none is needed: THE WINDOW IS THE CLUSTER'S. Kubernetes
 * reaps events on its own TTL — roughly an hour on this platform — and nothing
 * older survives; the service persists nothing to widen it.
 *
 * AN EMPTY `events` ARRAY IS A NORMAL ANSWER, not an error: a workload the
 * cluster has had nothing to say about within the TTL answers 200 with an
 * empty list. The response is a BARE object, with no `{ success: true }`
 * envelope.
 */
export class ComputeWorkloadEventsListCommand extends Command<
  ComputeWorkloadEventsListInput,
  ComputeWorkloadDeploymentEvents
> {
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
    return `/api/v1/workloads/${this.input.workloadId}/events`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkloadDeploymentEvents {
    return parseResponseHelper(ComputeWorkloadDeploymentEventsSchema, rawResponse)
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
