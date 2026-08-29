import { Command } from "../../common/command.ts"
import {
  type ComputeWorkload,
  type ComputeWorkloadDefinition,
  ComputeWorkloadResponseSchema,
} from "../../contracts/compute.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload create command
 */
export interface ComputeWorkloadCreateInput {
  /** The tenant id (full UUID) */
  tenantId: string
  /** The name of the workload */
  name: string
  /**
   * The full definition. `image` and `slotTier` are required — they have no
   * safe default, so a request without them is 422.
   */
  definition: ComputeWorkloadDefinition
}

/**
 * Create a workload.
 *
 * Answers 201 with the workload READ BACK from the projection, not a
 * `{ status: "processing" }` stub: the service awaits its own
 * `workload.created.0` write before responding. Revision 1 is active from
 * birth. The cluster rollout that follows is observable through
 * `ComputeWorkloadFetchCommand`.
 *
 * Response envelope: `{ success: true, workload: {...} }`, unwrapped here.
 */
export class ComputeWorkloadCreateCommand extends Command<ComputeWorkloadCreateInput, ComputeWorkload> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a create mints a workload id server-side, so a retried 502 would
   * deploy the same workload twice.
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
    return "/api/v1/workloads"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkload {
    return parseResponseHelper(ComputeWorkloadResponseSchema, rawResponse).workload
  }
}
