import { Command } from "../../common/command.ts"
import { type ComputeWorkload, ComputeWorkloadListResponseSchema } from "../../contracts/compute.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload list command
 */
export interface ComputeWorkloadListInput {
  /** The tenant id (full UUID) */
  tenantId: string
}

/**
 * List a tenant's workloads, newest first.
 *
 * Deleted workloads are excluded server-side. The response is wrapped in the
 * `{ success: true, workloads: [...] }` envelope; this command unwraps it.
 */
export class ComputeWorkloadListCommand extends Command<ComputeWorkloadListInput, ComputeWorkload[]> {
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
    const queryParams = new URLSearchParams()
    queryParams.set("tenantId", this.input.tenantId)
    return `/api/v1/workloads?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkload[] {
    return parseResponseHelper(ComputeWorkloadListResponseSchema, rawResponse).workloads
  }
}
