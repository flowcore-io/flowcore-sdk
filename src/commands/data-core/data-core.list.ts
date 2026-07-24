import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type DataCoreWithAccess, DataCoreWithAccessSchema } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the data core list command
 */
export interface DataCoreListInput {
  /** The tenant id */
  tenantId?: string
  /** The tenant name */
  tenant?: string
  /** The data core name */
  name?: string
  /** Page number (1-based). Used with limit. Defaults to 1 when limit is provided. */
  page?: number
  /** Maximum number of data cores to return (max 100). Omit to return all data cores. */
  limit?: number
  /** Data core ids to pin to the front of the list (comma-separated string or array) */
  ids?: string | string[]
}

const responseSchema = Type.Object({
  ...DataCoreWithAccessSchema.properties,
  access: Type.Array(Type.String()),
})

/**
 * Fetch all data cores for a tenant
 */
export class DataCoreListCommand extends Command<DataCoreListInput, DataCoreWithAccess[]> {
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
    return "https://data-core-2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    if (this.input.tenantId) {
      queryParams.set("tenantId", this.input.tenantId)
    }
    if (this.input.tenant) {
      queryParams.set("tenant", this.input.tenant)
    }
    if (this.input.name) {
      queryParams.set("name", this.input.name)
    }
    if (this.input.page !== undefined) {
      queryParams.set("page", this.input.page.toString())
    }
    if (this.input.limit !== undefined) {
      queryParams.set("limit", this.input.limit.toString())
    }
    if (this.input.ids !== undefined) {
      const ids = Array.isArray(this.input.ids) ? this.input.ids.join(",") : this.input.ids
      queryParams.set("ids", ids)
    }
    const qs = queryParams.toString()
    return qs ? `/api/v1/data-cores?${qs}` : "/api/v1/data-cores"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCoreWithAccess[] {
    return parseResponseHelper(Type.Array(responseSchema), rawResponse) as DataCoreWithAccess[]
  }
}
