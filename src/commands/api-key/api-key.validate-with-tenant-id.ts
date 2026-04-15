import { Command } from "../../common/command.ts"
import { type ApiKeyValidation, ApiKeyValidationSchema } from "../../contracts/api-key.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the api key validate with tenant id command
 */
export interface ApiKeyValidateWithTenantIdInput {
  /** The api key to validate */
  apiKey: string
  /** The tenant id */
  tenantId: string
}

/**
 * Validate an api key with tenant id
 */
export class ApiKeyValidateWithTenantIdCommand extends Command<ApiKeyValidateWithTenantIdInput, ApiKeyValidation> {
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
    return "/api/v1/api-keys/validate-with-tenant-id"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ApiKeyValidation {
    return parseResponseHelper(ApiKeyValidationSchema, rawResponse)
  }
}
