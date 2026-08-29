import { Command } from "../../common/command.ts"
import { type ComputeNoContent, ComputeNoContentSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute domain detach command
 */
export interface ComputeDomainDetachInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** The domain binding id (full UUID) */
  domainId: string
}

/**
 * Detach a domain from a workload.
 *
 * Answers `204 No Content`. The service awaits its own write before
 * responding, so on return the hostname is already attachable again; the
 * in-cluster reconciler removes the Ingress rule and Certificate
 * asynchronously. The projection row is MARKED detached, never deleted.
 *
 * `FlowcoreClient` substitutes `{ status: 204 }` for the empty body, and that
 * synthetic object is what this command returns.
 */
export class ComputeDomainDetachCommand extends Command<ComputeDomainDetachInput, ComputeNoContent> {
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
    return `/api/v1/workloads/${this.input.workloadId}/domains/${this.input.domainId}`
  }

  /**
   * Get the body for the request. The route takes NO body.
   */
  protected override getBody(): undefined {
    return undefined
  }

  /**
   * Parse the response.
   *
   * The endpoint answers 204 with an EMPTY body, which `FlowcoreClient` turns
   * into `{ status: 204 }` before it reaches here — so this schema describes
   * that synthetic object, not anything the service serialized.
   */
  protected override parseResponse(rawResponse: unknown): ComputeNoContent {
    return parseResponseHelper(ComputeNoContentSchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Domain", {
        workloadId: this.input.workloadId,
        domainId: this.input.domainId,
      })
    }
    throw error
  }
}
