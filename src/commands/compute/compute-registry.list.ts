import { Command } from "../../common/command.ts"
import { type ComputeRegistry, ComputeRegistryListResponseSchema } from "../../contracts/compute.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the compute registry list command
 */
export interface ComputeRegistryListInput {
  /** The tenant id (full UUID) */
  tenantId: string
}

/**
 * List a tenant's configured container image registries, sanitized.
 *
 * NO CREDENTIAL IS RETURNED, and none can be: the registry type has no
 * `secret`, no encrypted token and no `dockerconfigjson` field. Credentials
 * are write-only and rotation-only. A tenant with no registries answers 200
 * with an empty array.
 *
 * Response envelope: `{ success: true, registries: [...] }`, unwrapped here.
 */
export class ComputeRegistryListCommand extends Command<ComputeRegistryListInput, ComputeRegistry[]> {
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
    queryParams.set("tenantId", this.input.tenantId)
    return `/api/v1/registries?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ComputeRegistry[] {
    return parseResponseHelper(ComputeRegistryListResponseSchema, rawResponse).registries
  }
}
