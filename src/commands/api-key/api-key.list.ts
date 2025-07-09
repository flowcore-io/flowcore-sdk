import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { Type } from "@sinclair/typebox"
import { type ApiKey, ApiKeySchema } from "../../contracts/api-key.ts"

/**
 * The input for the api key list command
 */
export interface ApiKeyListInput {
  /** The tenant id */
  tenantId: string
}

/**
 * List api keys
 */
export class ApiKeyListCommand extends Command<ApiKeyListInput, ApiKey[]> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

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
    return "https://tenant-store.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/api-keys?tenantId=${this.input.tenantId}`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ApiKey[] {
    return parseResponseHelper(Type.Array(ApiKeySchema), rawResponse)
  }
}
