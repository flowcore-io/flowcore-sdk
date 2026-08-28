import { Command } from "../../common/command.ts"
import { type ComputeRegistry, ComputeRegistrySchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute registry rotate command
 */
export interface ComputeRegistryRotateInput {
  /** The registry id (full UUID) */
  registryId: string
  /**
   * The NEW pull secret, 8..4096 characters.
   *
   * Rotation replaces the credential; it does not re-describe the registry.
   * The previous secret is never returned and never becomes readable.
   */
  secret: string
}

/**
 * Rotate a registry's credentials.
 *
 * Answers 200 with the sanitized registry read back from the projection, so
 * `updatedAt` is the REAL rotation timestamp rather than a wall-clock guess.
 * The in-cluster pull Secret is patched by the reconciler; no pod rolls.
 *
 * The response body is BARE, with no `{ success: true }` envelope.
 */
export class ComputeRegistryRotateCommand extends Command<ComputeRegistryRotateInput, ComputeRegistry> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
    return `/api/v1/registries/${this.input.registryId}`
  }

  /**
   * Get the body for the request.
   *
   * OVERRIDDEN BECAUSE THE UPSTREAM BODY IS `.strict()` AND DELIBERATELY
   * NARROW — `{ secret }` and nothing else, so that an attempt to smuggle a
   * `serverUrl` or `isDefault` change through the rotation path is a 422. The
   * base implementation would send `registryId`, a path parameter, inside the
   * JSON and every call would be refused.
   */
  protected override getBody(): Record<string, unknown> {
    const { registryId: _registryId, ...payload } = this.input
    return payload
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeRegistry {
    return parseResponseHelper(ComputeRegistrySchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Registry", {
        registryId: this.input.registryId,
      })
    }
    throw error
  }
}
