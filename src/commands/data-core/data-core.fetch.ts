import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type DataCore, DataCoreSchema } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

/**
 * The input for the data core fetch by id command
 */
export interface DataCoreFetchByIdInput {
  /** The id of the data core */
  dataCoreId: string
  /** The tenant id */
  tenantId?: never
  /** The tenant */
  tenant?: never
  /** The name of the data core */
  dataCore?: never
}

/**
 * The input for the data core fetch by name and tenant id command
 */
export interface DataCoreFetchByNameAndTenantIdInput {
  /** The tenant id */
  tenantId: string
  /** The tenant */
  tenant?: never
  /** The name of the data core */
  dataCore: string
  /** The id of the data core */
  dataCoreId?: never
}

/**
 * The input for the data core fetch by name and tenant command
 */
export interface DataCoreFetchByNameAndTenantInput {
  /** The tenant id */
  tenantId?: never
  /** The tenant */
  tenant: string
  /** The name of the data core */
  dataCore: string
  /** The id of the data core */
  dataCoreId?: never
}

function isDataCoreFetchByIdInput(input: DataCoreFetchInput): input is DataCoreFetchByIdInput {
  return "dataCoreId" in input
}

function isDataCoreFetchByNameAndTenantIdInput(
  input: DataCoreFetchInput,
): input is DataCoreFetchByNameAndTenantIdInput {
  return "tenantId" in input
}

function isDataCoreFetchByNameAndTenantInput(input: DataCoreFetchInput): input is DataCoreFetchByNameAndTenantInput {
  return "tenant" in input
}

/**
 * The input for the data core fetch command
 */
export type DataCoreFetchInput =
  | DataCoreFetchByIdInput
  | DataCoreFetchByNameAndTenantIdInput
  | DataCoreFetchByNameAndTenantInput

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
    if (isDataCoreFetchByIdInput(this.input)) {
      return `/api/v1/data-cores/${this.input.dataCoreId}`
    }
    const queryParams = new URLSearchParams()
    if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
      queryParams.set("tenantId", this.input.tenantId)
    }
    if (isDataCoreFetchByNameAndTenantInput(this.input)) {
      queryParams.set("tenant", this.input.tenant)
    }
    queryParams.set("name", this.input.dataCore)
    return `/api/v1/data-cores?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCore {
    if (isDataCoreFetchByIdInput(this.input)) {
      const response = parseResponseHelper(DataCoreSchema, rawResponse)
      return response
    }
    const response = parseResponseHelper(Type.Array(DataCoreSchema), rawResponse)
    if (response.length === 0) {
      if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenantId: this.input.tenantId })
      } else {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenant: this.input.tenant })
      }
    }
    return response[0]
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      if (isDataCoreFetchByIdInput(this.input)) {
        throw new NotFoundException("DataCore", { id: this.input.dataCoreId })
      } else if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenantId: this.input.tenantId })
      } else {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenant: this.input.tenant })
      }
    }
    throw error
  }
}
