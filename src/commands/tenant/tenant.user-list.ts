import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type TenantUser, TenantUserSchema } from "../../contracts/tenant.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant user list command
 */
export interface TenantUserListInput {
  tenantId: string
}

/**
 * List tenants users
 */
export class TenantUserListCommand extends Command<TenantUserListInput, TenantUser[]> {
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
    return `/api/v1/tenants/${this.input.tenantId}/users`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantUser[] {
    const response = parseResponseHelper(Type.Array(TenantUserSchema), rawResponse)
    return response
  }
}
