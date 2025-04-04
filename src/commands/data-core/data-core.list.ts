import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type DataCoreWithAccess, DataCoreWithAccessSchema } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the data core fetch by name command
 */
export interface DataCoreListInput {
  /** The tenant id */
  tenantId?: string
  /** The tenant name */
  tenant?: string
  /** The data core name */
  name?: string
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
    return `/api/v1/data-cores?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCoreWithAccess[] {
    return parseResponseHelper(Type.Array(responseSchema), rawResponse) as DataCoreWithAccess[]
  }
}
