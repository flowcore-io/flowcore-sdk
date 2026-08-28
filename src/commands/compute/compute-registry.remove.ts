import { Command } from "../../common/command.ts"
import { type ComputeNoContent, ComputeNoContentSchema } from "../../contracts/compute.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute registry remove command
 */
export interface ComputeRegistryRemoveInput {
  /** The registry id (full UUID) */
  registryId: string
}

/**
 * Remove a registry.
 *
 * Answers `204 No Content`. The service awaits its own write before
 * responding, so on return the `serverUrl` is registrable again and a second
 * DELETE answers 404. The row is TOMBSTONED, never deleted — the registration
 * and every rotation stay readable for support.
 *
 * REMOVAL IS UNCONDITIONAL: no workload reference is checked and no new
 * default is elected. Running pods are unaffected; a pull from that host fails
 * only when the kubelet next pulls. The in-cluster credential is revoked by
 * the reconciler asynchronously.
 *
 * `FlowcoreClient` substitutes `{ status: 204 }` for the empty body, and that
 * synthetic object is what this command returns.
 */
export class ComputeRegistryRemoveCommand extends Command<ComputeRegistryRemoveInput, ComputeNoContent> {
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
    return `/api/v1/registries/${this.input.registryId}`
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
   * into `{ status: 204 }` before it reaches here.
   */
  protected override parseResponse(rawResponse: unknown): ComputeNoContent {
    return parseResponseHelper(ComputeNoContentSchema, rawResponse)
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
