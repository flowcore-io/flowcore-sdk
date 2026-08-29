import { Command } from "../../common/command.ts"
import { type ComputeWorkloadLogs, ComputeWorkloadLogsSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute workload logs fetch command
 */
export interface ComputeWorkloadLogsFetchInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** ISO-8601 lower bound */
  since?: string
  /** ISO-8601 upper bound */
  until?: string
  /** Free-text search over the message */
  search?: string
  /** Maximum number of lines, 1..1000 (defaults to 100 server-side) */
  limit?: number
  /** Restrict to one container by name */
  container?: string
}

/**
 * Query indexed historical container logs for a workload.
 *
 * The tenant namespace and the `flowcore.io/workload-id` pod label are derived
 * SERVER-SIDE from the workload projection and cannot be widened by the
 * caller, so there is deliberately no namespace or label parameter here.
 *
 * This is the HISTORICAL, indexed surface. The live SSE stream
 * (`GET /api/v1/workloads/{workloadId}/logs/stream`) is NOT covered by this
 * SDK — it needs a streaming transport this client does not have.
 *
 * The response is a BARE object, with no `{ success: true }` envelope.
 */
export class ComputeWorkloadLogsFetchCommand extends Command<ComputeWorkloadLogsFetchInput, ComputeWorkloadLogs> {
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
    if (this.input.since !== undefined) {
      queryParams.set("since", this.input.since)
    }
    if (this.input.until !== undefined) {
      queryParams.set("until", this.input.until)
    }
    if (this.input.search !== undefined) {
      queryParams.set("search", this.input.search)
    }
    if (this.input.limit !== undefined) {
      queryParams.set("limit", this.input.limit.toString())
    }
    if (this.input.container !== undefined) {
      queryParams.set("container", this.input.container)
    }
    const qs = queryParams.toString()
    const path = `/api/v1/workloads/${this.input.workloadId}/logs`
    return qs ? `${path}?${qs}` : path
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeWorkloadLogs {
    return parseResponseHelper(ComputeWorkloadLogsSchema, rawResponse)
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
