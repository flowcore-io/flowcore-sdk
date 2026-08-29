import { Command } from "../../common/command.ts"
import { type ComputeWorkloadRevisionList, ComputeWorkloadRevisionListSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload revisions list command
 */
export interface ComputeWorkloadRevisionsListInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** Page size (defaults to the service's own page size) */
  limit?: number
  /** Opaque cursor from a previous page's `nextCursor` */
  cursor?: string
}

/**
 * List a workload's revision history, newest ordinal first.
 *
 * Every definition the workload has ever been recorded with: the revision
 * seeded at creation (`cause: "created"`), one per update and one per
 * rollback. A rollback is a NEW revision carrying the ordinal it restored
 * from — history is never edited.
 *
 * `outcome` is read from the operation that carried the revision to the
 * cluster, so a revision recorded but never promoted (a failed pre-sync hook,
 * say) is distinguishable from one merely superseded. IT IS ABSENT on a
 * `created` revision, which mints no operation at all — check for it before
 * reading it.
 *
 * PAGINATED, like `ComputeWorkloadRunsListCommand`: revision history is
 * unbounded by construction and nothing ever removes a row. Feed `nextCursor`
 * back as `cursor`; it is absent on the last page. The response is a BARE
 * object, with no `{ success: true }` envelope.
 */
export class ComputeWorkloadRevisionsListCommand extends Command<
  ComputeWorkloadRevisionsListInput,
  ComputeWorkloadRevisionList
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
    const queryParams = new URLSearchParams()
    if (this.input.limit !== undefined) {
      queryParams.set("limit", this.input.limit.toString())
    }
    if (this.input.cursor !== undefined) {
      queryParams.set("cursor", this.input.cursor)
    }
    const qs = queryParams.toString()
    const path = `/api/v1/workloads/${this.input.workloadId}/revisions`
    return qs ? `${path}?${qs}` : path
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkloadRevisionList {
    return parseResponseHelper(ComputeWorkloadRevisionListSchema, rawResponse)
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
