import { Command } from "../../common/command.ts"
import type { TenantPreview } from "../../contracts/tenant.ts"
import { TenantPreviewSchema } from "../../contracts/tenant.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant preview command
 */
export interface TenantPreviewInput {
  /** The name of the tenant to preview */
  name: string
}

/**
 * Retrieve a public tenant preview
 */
export class TenantPreviewCommand extends Command<TenantPreviewInput, TenantPreview> {
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
    return "https://tenant.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/tenants/preview/${this.input.name}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantPreview {
    return parseResponseHelper(TenantPreviewSchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", { name: this.input.name })
    }
    throw error
  }
}

