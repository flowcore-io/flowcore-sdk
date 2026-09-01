import { Command } from "../../common/command.ts"
import { type ComputeDomain, ComputeDomainSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The TLS request block on an attach for a custom hostname.
 */
export interface ComputeDomainAttachTls {
  /** Only ACME/Let's Encrypt via cert-manager exists */
  mode: "letsencrypt"
  /** The cert-manager ClusterIssuer (defaults to `letsencrypt-prod` server-side) */
  clusterIssuer?: string
}

/**
 * Attach a hostname the TENANT owns, proved with a CNAME.
 */
export interface ComputeDomainAttachCustomInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** A lowercase fully qualified hostname, e.g. `api.acme.org`. Uppercase is REJECTED, not folded */
  hostname: string
  /** The container port the ingress routes to */
  targetPort: number
  /** Certificate issuance options */
  tls?: ComputeDomainAttachTls
  /** Never set alongside `hostname` — the two branches are an XOR */
  subdomain?: never
}

/**
 * Attach a single label under the PLATFORM's wildcard zone.
 *
 * TENANT-SCOPED MINT: the served hostname is
 * `<subdomain>-<tenantSlug>.<zone>` — the platform resolves the tenant's
 * slug at attach time and suffixes it, so two tenants asking for the same
 * subdomain never clash. The service answers 422 for a reserved subdomain
 * (`www`, `flowcore`, `usable`), for a scoped label over 63 bytes and for
 * an unresolvable tenant slug, and 409 when the tenant's active wildcard
 * cap is reached. Bindings minted before scoping keep their stored
 * hostnames.
 */
export interface ComputeDomainAttachWildcardInput {
  /** The workload id (full UUID) */
  workloadId: string
  /** A single lowercase DNS label — no dots, which would reach outside the platform zone */
  subdomain: string
  /** The container port the ingress routes to */
  targetPort: number
  /** Never set alongside `subdomain` — the two branches are an XOR */
  hostname?: never
  /** Never set for a wildcard subdomain — the platform's wildcard certificate already exists */
  tls?: never
}

/**
 * The input for the compute domain attach command — custom hostname XOR
 * platform wildcard subdomain.
 */
export type ComputeDomainAttachInput = ComputeDomainAttachCustomInput | ComputeDomainAttachWildcardInput

/**
 * Attach a custom domain or a platform wildcard subdomain to a workload.
 *
 * TWO SUCCESS CODES, both from an awaited write and both carrying the same
 * BARE domain object (no `{ success: true }` envelope):
 * - 201 for a wildcard subdomain — the platform owns the zone and the
 *   wildcard certificate already exists, so the binding is ready on return;
 * - 202 for a custom hostname — the caller still has to publish the CNAME and
 *   cert-manager still has to issue.
 *
 * THERE IS NO `operationId` HERE, so this command has no `waitForOperation`.
 * A custom hostname is followed up with `ComputeDomainVerifyCommand`, which is
 * the surface that performs the live DNS and certificate check.
 *
 * Answers 409 when the hostname is already on a live binding, or when the
 * workload is of kind `job` and has no Service to route to.
 */
export class ComputeDomainAttachCommand extends Command<ComputeDomainAttachInput, ComputeDomain> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: an attach mints a domain id, and a second attach of the same
   * hostname answers 409 — a retry of an already-recorded request would
   * surface that conflict as the caller's answer.
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
    return `/api/v1/workloads/${this.input.workloadId}/domains`
  }

  /**
   * Get the body for the request.
   *
   * OVERRIDDEN BECAUSE BOTH BRANCHES OF THE UPSTREAM BODY ARE `.strict()` —
   * that is exactly what makes the union a real XOR. The base implementation
   * would send `workloadId` (a path parameter) inside the JSON, which matches
   * NEITHER branch, so every call would be 422.
   */
  protected override getBody(): Record<string, unknown> {
    const { workloadId: _workloadId, ...payload } = this.input
    return payload
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeDomain {
    return parseResponseHelper(ComputeDomainSchema, rawResponse)
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
