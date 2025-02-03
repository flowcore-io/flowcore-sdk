import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type DataCore, DataCoreSchema } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

/**
 * The input for the data core fetch by id command
 */
type DataCoreFetchByIdInput = {
  /** The id of the data core */
  dataCoreId: string
  /** The name of the data core */
  dataCore?: never
  /** The tenant id */
  tenantId?: never
}

/**
 * The input for the data core fetch by name command
 */
interface DataCoreFetchByNameInput {
  /** The tenant id */
  tenantId: string
  /** The name of the data core */
  dataCore: string
  /** The id of the data core */
  dataCoreId?: never
}

/**
 * The input for the data core fetch command
 */
export type DataCoreFetchInput = DataCoreFetchByIdInput | DataCoreFetchByNameInput

/**
 * Fetch a data core
 */
export class DataCoreFetchCommand extends Command<DataCoreFetchInput, DataCore> {
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
    if ("dataCoreId" in this.input) {
      return `/api/v1/data-cores/${this.input.dataCoreId}`
    }
    const queryParams = new URLSearchParams()
    queryParams.set("tenantId", this.input.tenantId)
    queryParams.set("name", this.input.dataCore)
    return `/api/v1/data-cores?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCore {
    if ("dataCoreId" in this.input) {
      const response = parseResponseHelper(DataCoreSchema, rawResponse)
      return response
    }
    const response = parseResponseHelper(Type.Array(DataCoreSchema), rawResponse)
    if (response.length === 0) {
      throw new NotFoundException("DataCore", { name: this.input.dataCore })
    }
    return response[0]
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataCore", {
        [this.input.dataCoreId ? "id" : "name"]: this.input.dataCoreId ?? this.input.dataCore,
      })
    }
    throw error
  }
}
