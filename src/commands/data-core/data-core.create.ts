import { Command } from "../../common/command.ts"
import { type DataCore, DataCoreSchema } from "../../contracts/data-core.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the data core create command
 */
export interface DataCoreCreateInput {
  /** The tenant id */
  tenantId: string
  /** The name of the data core */
  name: string
  /** The description of the data core */
  description: string
  /** The access control of the data core */
  accessControl: "public" | "private"
  /** Whether the data core is delete protected */
  deleteProtection: boolean
  /** Whether the data core is managed by Flowcore */
  isFlowcoreManaged?: boolean
}

/**
 * Create a data core
 */
export class DataCoreCreateCommand extends Command<DataCoreCreateInput, DataCore> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

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
    return "https://data-core-2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/data-cores`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCore {
    return parseResponseHelper(DataCoreSchema, rawResponse)
  }
}
