import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant disable sensitive data command
 */
export interface TenantDisableSensitiveDataInput {
  /** The id of the tenant */
  tenantId: string
}

export interface TenantDisableSensitiveDataResponse {
  sensitiveDataEnabled: boolean
}

/**
 * The response schema for the tenant disable sensitive data command
 */
const responseSchema = Type.Object({
  sensitiveDataEnabled: Type.Boolean(),
})

/**
 * Disable Sensitive Data Feature for a tenant
 */
export class TenantDisableSensitiveDataCommand extends Command<TenantDisableSensitiveDataInput, TenantDisableSensitiveDataResponse> {
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
    return "https://tenant.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/tenants/${this.input.tenantId}/disable-sensitive-data`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantDisableSensitiveDataResponse {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        id: this.input.tenantId,
      })
    }
    throw error
  }
}
