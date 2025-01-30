import { Command } from "../../common/command.ts"
import { type DataCore, DataCoreSchema } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { CommandError } from "../../exceptions/command-error.ts"
/**
 * The input for the data core update command
 */
export type DataCoreUpdateInput = {
  /** The id of the data core */
  dataCoreId: string
  /** The description of the data core */
  description?: string
  /** The access control of the data core */
  accessControl?: "public" | "private"
  /** Whether the data core is delete protected */
  deleteProtection?: boolean
}

/**
 * Update a data core
 */
export class DataCoreUpdateCommand extends Command<DataCoreUpdateInput, DataCore> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
    return `/api/v1/data-cores/${this.input.dataCoreId}`
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): string | undefined {
    const { dataCoreId: _dataCoreId, ...payload } = this.input
    if (Object.keys(payload).length === 0) {
      throw new CommandError(this.constructor.name, "No fields to update")
    }
    return JSON.stringify(payload)
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCore {
    return parseResponseHelper(DataCoreSchema, rawResponse)
  }
}
