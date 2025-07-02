import { Command } from "../../common/command.ts"

/**
 * The input for the secret delete command
 */
export interface SecretDeleteInput {
  /** The tenant id */
  tenantId: string
  /** The key of the secret */
  key: string
}

/**
 * Delete a secret
 */
export class SecretDeleteCommand extends Command<SecretDeleteInput, boolean> {
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
    return `/api/v1/tenants/${this.input.tenantId}/secrets/${this.input.key}`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(_rawResponse: unknown): boolean {
    return true
  }
}
