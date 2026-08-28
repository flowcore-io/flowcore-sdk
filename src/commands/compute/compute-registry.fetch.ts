import { Command } from "../../common/command.ts"
import { type ComputeRegistryDetail, ComputeRegistryDetailResponseSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute registry fetch command
 */
export interface ComputeRegistryFetchInput {
  /** The registry id (full UUID) */
  registryId: string
}

/**
 * Inspect a single registry, with whether its credential really reached the
 * tenant's namespace.
 *
 * `synthesisStatus` is what the RECONCILER reported and nothing else: this
 * route never probes the registry, never opens a credential and makes no
 * outbound call. `pending` means no report has arrived yet.
 *
 * A REMOVED registry answers 404, not 410 — indistinguishable from an unknown
 * one, which is the same non-disclosure property the 404-on-denial collapse
 * gives.
 *
 * Response envelope: `{ success: true, registry: {...} }`, unwrapped here —
 * note that register and rotate return the registry BARE instead.
 */
export class ComputeRegistryFetchCommand extends Command<ComputeRegistryFetchInput, ComputeRegistryDetail> {
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
    return `/api/v1/registries/${this.input.registryId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeRegistryDetail {
    return parseResponseHelper(ComputeRegistryDetailResponseSchema, rawResponse).registry
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
