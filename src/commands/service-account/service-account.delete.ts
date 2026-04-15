import { Command } from "../../common/command.ts"

/**
 * The input for the service account delete command
 */
export interface ServiceAccountDeleteInput {
  /** The service account id */
  serviceAccountId: string
}

/**
 * Delete a service account
 */
export class ServiceAccountDeleteCommand extends Command<ServiceAccountDeleteInput, boolean> {
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
    return `/api/v1/service-accounts/${this.input.serviceAccountId}`
  }

  /**
   * Get the body
   */
  protected override getBody(): undefined {
    return undefined
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(): boolean {
    return true
  }
}
