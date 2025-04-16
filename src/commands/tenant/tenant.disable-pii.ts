import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant disable pii command
 */
export interface TenantDisablePiiInput {
  /** The id of the tenant */
  tenantId: string
}

export interface TenantDisablePiiResponse {
  piiEnabled: boolean
}

/**
 * The response schema for the tenant disable pii command
 */
const responseSchema = Type.Object({
  piiEnabled: Type.Boolean(),
})

/**
 * Disable Personal Identifiable Information (PII) Feature for a tenant
 */
export class TenantDisablePiiCommand extends Command<TenantDisablePiiInput, TenantDisablePiiResponse> {
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
    return `/api/v1/tenants/${this.input.tenantId}/disable-pii`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantDisablePiiResponse {
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
