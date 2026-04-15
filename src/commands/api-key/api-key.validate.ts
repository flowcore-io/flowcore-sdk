import { Command } from "../../common/command.ts"
import { type ApiKeyValidation, ApiKeyValidationSchema } from "../../contracts/api-key.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the api key validate command
 */
export interface ApiKeyValidateInput {
  /** The api key to validate */
  apiKey: string
}

/**
 * Validate an api key
 */
export class ApiKeyValidateCommand extends Command<ApiKeyValidateInput, ApiKeyValidation> {
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
    return "https://tenant-store.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return "/api/v1/api-keys/validate"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ApiKeyValidation {
    return parseResponseHelper(ApiKeyValidationSchema, rawResponse)
  }
}
