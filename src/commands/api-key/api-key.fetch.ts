import { Command } from "../../common/command.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { type ApiKey, ApiKeySchema } from "../../contracts/api-key.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the api key fetch command
 */
export interface ApiKeyFetchInput {
  /** The api key id */
  apiKeyId: string
}

/**
 * Fetch an api key
 */
export class ApiKeyFetchCommand extends Command<ApiKeyFetchInput, ApiKey> {
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

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("ApiKey", { id: this.input.apiKeyId })
    }
    throw error
  }
}
