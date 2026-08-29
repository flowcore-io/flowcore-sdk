import { Command } from "../../common/command.ts"
import { type ComputeWorkloadRunList, ComputeWorkloadRunListSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload runs list command
 */
export interface ComputeWorkloadRunsListInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** Page size, 1..200 (defaults to 50 server-side) */
  limit?: number
  /** Opaque cursor from a previous page's `nextCursor` */
  cursor?: string
}

/**
 * List a workload's run history, newest first.
 *
 * Every execution the platform has run for the workload: on-demand batch runs
 * (`kind: "batch"`) AND the pre-sync hooks its creates, updates and rollbacks
 * gated on (`kind: "pre_sync"`).
 *
 * PAGINATED, unlike `ComputeWorkloadListCommand` — run history is unbounded by
 * construction and nothing ever removes a row. Feed `nextCursor` back as
 * `cursor`; it is absent on the last page. The response is a BARE object, with
 * no `{ success: true }` envelope.
 */
export class ComputeWorkloadRunsListCommand extends Command<ComputeWorkloadRunsListInput, ComputeWorkloadRunList> {
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
    if (this.input.limit !== undefined) {
      queryParams.set("limit", this.input.limit.toString())
    }
    if (this.input.cursor !== undefined) {
      queryParams.set("cursor", this.input.cursor)
    }
    const qs = queryParams.toString()
    const path = `/api/v1/workloads/${this.input.workloadId}/runs`
    return qs ? `${path}?${qs}` : path
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkloadRunList {
    return parseResponseHelper(ComputeWorkloadRunListSchema, rawResponse)
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
