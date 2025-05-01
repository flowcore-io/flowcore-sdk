import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant enable sensitive data command
 */
export interface TenantEnableSensitiveDataInput {
  /** The id of the tenant */
  tenantId: string
}

export interface TenantEnableSensitiveDataResponse {
  sensitiveDataEnabled: boolean
}

/**
 * The response schema for the tenant enable sensitive data command
 */
const responseSchema = Type.Object({
  sensitiveDataEnabled: Type.Boolean(),
})

/**
 * Enable Sensitive Data Feature for a tenant
 */
export class TenantEnableSensitiveDataCommand extends Command<TenantEnableSensitiveDataInput, TenantEnableSensitiveDataResponse> {
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
    return `/api/v1/tenants/${this.input.tenantId}/enable-sensitive-data`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantEnableSensitiveDataResponse {
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
