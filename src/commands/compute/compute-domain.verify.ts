import { Command } from "../../common/command.ts"
import { type ComputeDomainVerifyResponse, ComputeDomainVerifyResponseSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute domain verify command
 */
export interface ComputeDomainVerifyInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** The domain binding id (full UUID) */
  domainId: string
}

/**
 * Verify DNS ownership and read the TLS certificate state.
 *
 * Resolves the domain's CNAME and reads the cert-manager Certificate
 * READ-ONLY. This endpoint never issues a certificate and never mutates any
 * Kubernetes resource.
 *
 * EVERY OBSERVED OUTCOME IS A 200, including the unhappy ones: a missing or
 * mismatched CNAME is `verification.verified: false`, a certificate that is
 * not ready yet is `tls.status: "pending_issuance"`, a failed issuance is
 * `tls.status: "failed"`. Only a broken upstream changes the status code —
 * 503 when DNS or the Kubernetes API is unreachable, 502 when either answers
 * badly.
 *
 * The response is a BARE object, deliberately NARROWER than the domain object
 * that attach and list return: verify reports what was just observed, it does
 * not restate the binding.
 */
export class ComputeDomainVerifyCommand extends Command<ComputeDomainVerifyInput, ComputeDomainVerifyResponse> {
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
    return `/api/v1/workloads/${this.input.workloadId}/domains/${this.input.domainId}/verify`
  }

  /**
   * Get the body for the request. The route takes NO body.
   */
  protected override getBody(): undefined {
    return undefined
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeDomainVerifyResponse {
    return parseResponseHelper(ComputeDomainVerifyResponseSchema, rawResponse)
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
