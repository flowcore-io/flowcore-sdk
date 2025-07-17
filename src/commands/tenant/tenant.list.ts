import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type TenantListItem, TenantListItemSchema } from "../../contracts/tenant.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * List tenants
 */
export class TenantListCommand extends Command<Record<string, never>, TenantListItem[]> {
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
    return `/api/v1/tenants/list`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantListItem[] {
    const response = parseResponseHelper(Type.Array(TenantListItemSchema), rawResponse)
    return response
  }
}
