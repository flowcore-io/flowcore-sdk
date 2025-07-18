import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant user add command
 */
export interface TenantUserAddInput {
  tenantId: string
  userId: string
}

/**
 * Add a user to a tenant
 */
export class TenantUserAddCommand extends Command<TenantUserAddInput, boolean> {
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
    return `/api/v1/tenants/${this.input.tenantId}/add-user`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): boolean {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean(),
      }),
      rawResponse,
    )
    return response.success
  }
}
