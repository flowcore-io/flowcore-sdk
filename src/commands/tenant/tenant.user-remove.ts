import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant user remove command
 */
export interface TenantUserRemoveInput {
  tenantId: string
  userId: string
}

/**
 * Remove a user from a tenant
 */
export class TenantUserRemoveCommand extends Command<TenantUserRemoveInput, boolean> {
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
    return `/api/v1/tenants/${this.input.tenantId}/remove-user`
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
