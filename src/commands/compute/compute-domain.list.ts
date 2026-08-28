import { Command } from "../../common/command.ts"
import { type ComputeDomain, ComputeDomainListResponseSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute domain list command
 */
export interface ComputeDomainListInput {
  /** The workload id (full UUID) */
  workloadId: string
}

/**
 * List the domains attached to a workload, oldest first.
 *
 * LIVE bindings only — a detached binding leaves the list rather than being
 * hidden behind a flag — and served entirely from the projection: this
 * endpoint performs no DNS lookup and reads no cluster state. Use
 * `ComputeDomainVerifyCommand` for a fresh observation. A workload with no
 * domains answers 200 with an empty array.
 *
 * Response envelope: `{ success: true, domains: [...] }`, unwrapped here.
 */
export class ComputeDomainListCommand extends Command<ComputeDomainListInput, ComputeDomain[]> {
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
    return `/api/v1/workloads/${this.input.workloadId}/domains`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeDomain[] {
    return parseResponseHelper(ComputeDomainListResponseSchema, rawResponse).domains
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
