import { Command } from "@flowcore/sdk"

/**
 * The ready check response type
 */
export interface ReadyCheckResponse {
  success: boolean
}

/**
 * The input for the ready check command
 */
export type ReadyCheckInput = Record<string, never>

/**
 * Check if the IAM service is ready
 */
export class ReadyCheckCommand extends Command<
  ReadyCheckInput,
  ReadyCheckResponse
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

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
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return "/ready"
  }

  /**
   * Parse the response - since the API returns no body on success,
   * we simply indicate success if we get a 200 response
   */
  protected override parseResponse(_rawResponse: unknown): ReadyCheckResponse {
    return { success: true }
  }
}
