import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type ApiKey, ApiKeySchema } from "../../contracts/api-key.ts"

/**
 * The input for the api key edit command
 */
export interface ApiKeyEditInput {
  /** The api key id */
  apiKeyId: string
  /** The description of the api key */
  description: string
}

/**
 * Edit an api key
 */
export class ApiKeyEditCommand extends Command<ApiKeyEditInput, ApiKey> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

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
    return "https://tenant-store.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/api-keys/${this.input.apiKeyId}`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ApiKey {
    return parseResponseHelper(ApiKeySchema, rawResponse)
  }
}
