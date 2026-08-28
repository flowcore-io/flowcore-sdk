import { Command } from "../../common/command.ts"
import { type ComputeRegistry, ComputeRegistrySchema } from "../../contracts/compute.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute registry register command
 */
export interface ComputeRegistryRegisterInput {
  /** The tenant id (full UUID) — carried in the BODY, not the path */
  tenantId: string
  /** Human label for the registry entry */
  name: string
  /**
   * The registry host as a container runtime addresses it, e.g. `ghcr.io` or
   * `registry.internal:5000`. A SCHEME IS REJECTED rather than stripped, and
   * so is uppercase — normalization is the caller's decision to make.
   */
  serverUrl: string
  /** The robot account the pull credential belongs to */
  username: string
  /**
   * The pull secret — a PAT, registry password or service principal secret,
   * 8..4096 characters.
   *
   * WRITE-ONLY. It is sealed before it reaches the event payload and no
   * endpoint on the service can read it back; rotation replaces it. It never
   * appears in any response type in this SDK.
   */
  secret: string
  /** Make this the tenant's default registry (defaults to false) */
  isDefault?: boolean
}

/**
 * Register container image registry credentials.
 *
 * Answers 201 with the registry READ BACK from the projection — SANITIZED,
 * with no credential field of any kind. The service contacts no registry and
 * creates no Kubernetes Secret; the in-cluster reconciler synthesizes the pull
 * Secret asynchronously, and `ComputeRegistryFetchCommand` reports whether it
 * succeeded.
 *
 * Answers 409 when a registry for the same `serverUrl` is already configured
 * for the tenant.
 *
 * The body is `.strict()` upstream, but NO `getBody()` override is needed
 * here: this route carries its tenancy in the body, so the command's input
 * and the request body are the same object — there is no path parameter to
 * strip.
 *
 * The response body is BARE, with no `{ success: true }` envelope — unlike
 * the registry LIST and the registry DETAIL reads, which both use one.
 */
export class ComputeRegistryRegisterCommand extends Command<ComputeRegistryRegisterInput, ComputeRegistry> {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a registration mints a registry id, and a second registration of
   * the same `serverUrl` answers 409 — a retry of an already-recorded request
   * would surface that conflict as the caller's answer.
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
    return "/api/v1/registries"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeRegistry {
    return parseResponseHelper(ComputeRegistrySchema, rawResponse)
  }
}
