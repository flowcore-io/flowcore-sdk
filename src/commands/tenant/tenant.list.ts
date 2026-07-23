import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type TenantListItem, TenantListItemSchema } from "../../contracts/tenant.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant list command
 */
export interface TenantListInput {
  /** Page number (1-based) */
  page?: number
  /** Number of tenants per page */
  limit?: number
  /** Tenant ids to pin to the front of the list (comma-separated string or array) */
  ids?: string | string[]
}

/**
 * List tenants
 */
export class TenantListCommand extends Command<TenantListInput, TenantListItem[]> {
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
    const query = new URLSearchParams()
    if (this.input.page !== undefined) {
      query.set("page", this.input.page.toString())
    }
    if (this.input.limit !== undefined) {
      query.set("limit", this.input.limit.toString())
    }
    if (this.input.ids !== undefined) {
      const ids = Array.isArray(this.input.ids) ? this.input.ids.join(",") : this.input.ids
      query.set("ids", ids)
    }
    const qs = query.toString()
    return qs ? `/api/v1/tenants/list?${qs}` : `/api/v1/tenants/list`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantListItem[] {
    const response = parseResponseHelper(Type.Array(TenantListItemSchema), rawResponse)
    return response
  }
}
