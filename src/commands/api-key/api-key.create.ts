import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type ApiKeyWithValue, ApiKeyWithValueSchema } from "../../contracts/api-key.ts"

/**
 * The input for the api key create command
 */
export interface ApiKeyCreateInput {
  /** The tenant id */
  tenantId: string
  /** The name of the api key */
  name: string
  /** The description of the api key */
  description?: string
}

/**
 * Create an api key
 */
export class ApiKeyCreateCommand extends Command<ApiKeyCreateInput, ApiKeyWithValue> {
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
    return "/api/v1/api-keys"
  }

  /**
   * The allowed modes for the command. Api-key mode requires tenant-store >=
   * the release that accepts AuthType.ApiKey on the api-key management routes;
   * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey", "bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ApiKeyWithValue {
    return parseResponseHelper(ApiKeyWithValueSchema, rawResponse)
  }
}
