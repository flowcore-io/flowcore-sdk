import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the data core fetch by id command
 */
export interface DataCoreExistsInput {
  /** The id of the data core */
  dataCoreId: string
}

/**
 * The output for the data core exists command
 */
export interface DataCoreExistsOutput {
  /** Whether the data core exists */
  exists: boolean
}

/**
 * Fetch a data core
 */
export class DataCoreExistsCommand extends Command<DataCoreExistsInput, DataCoreExistsOutput> {
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
    return `/api/v1/data-cores/${this.input.dataCoreId}/exists`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): DataCoreExistsOutput {
    const response = parseResponseHelper(Type.Object({ exists: Type.Boolean() }), rawResponse)
    return response
  }
}
