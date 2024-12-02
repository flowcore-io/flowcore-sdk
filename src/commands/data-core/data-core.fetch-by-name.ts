import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type DataCore, DataCoreSchema } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"

/**
 * The input for the data core fetch by name command
 */
export type DataCoreFetchByNameInput = {
  /** The tenant  */
  tenant: string
  /** The data core name */
  name: string
}

/**
 * Fetch a data core by name and tenant
 */
export class DataCoreFetchByNameCommand extends Command<DataCoreFetchByNameInput, DataCore> {
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
    queryParams.set("tenant", this.input.tenant)
    queryParams.set("name", this.input.name)
    return `/api/v1/data-cores?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCore {
    const response = parseResponseHelper(Type.Array(DataCoreSchema), rawResponse)
    if (response.length === 0) {
      throw new NotFoundException("DataCore", this.input.name)
    }
    return response[0]
  }
}
