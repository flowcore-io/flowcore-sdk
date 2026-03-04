import { Command } from "../../common/command.ts"
import { type TenantInstance, TenantInstanceSchema } from "../../contracts/tenant.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant instance fetch by id command
 */
export interface TenantInstanceFetchByIdInput {
  /** The id of the tenant */
  tenantId: string
  /** The name of the tenant */
  tenant?: never
}

/**
 * The input for the tenant instance fetch by name command
 */
export interface TenantInstanceFetchByNameInput {
  /** The name of the tenant */
  tenant: string
  /** The id of the tenant */
  tenantId?: never
}

/**
 * The input for the tenant instance fetch command
 */
export type TenantInstanceFetchInput = TenantInstanceFetchByIdInput | TenantInstanceFetchByNameInput

/**
 * Fetch a tenant instance
 */
export class TenantInstanceFetchCommand extends Command<TenantInstanceFetchInput, TenantInstance> {
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
    if ("tenantId" in this.input && this.input.tenantId) {
      return `/api/v1/tenants/by-id/${this.input.tenantId}/instance`
    }
    return `/api/v1/tenants/by-name/${this.input.tenant}/instance`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantInstance {
    return parseResponseHelper(TenantInstanceSchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        [this.input.tenantId ? "id" : "name"]: this.input.tenantId ?? this.input.tenant,
      })
    }
    throw error
  }
}
