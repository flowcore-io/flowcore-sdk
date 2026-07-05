import { Command } from "../../common/command.ts"

/**
 * The input for the api key delete command
 */
export interface ApiKeyDeleteInput {
  /** The api key id */
  apiKeyId: string
}

/**
 * Delete an api key
 */
export class ApiKeyDeleteCommand extends Command<ApiKeyDeleteInput, boolean> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "DELETE"
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
   * The allowed modes for the command. Api-key mode requires tenant-store >=
   * the release that accepts AuthType.ApiKey on the api-key management routes;
   * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey", "bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(_rawResponse: unknown): boolean {
    return true
  }
}
