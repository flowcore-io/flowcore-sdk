import { Command } from "../../common/command.ts"

/**
 * The input for the variable delete command
 */
export interface VariableDeleteInput {
  /** The tenant id */
  tenantId: string
  /** The key of the variable */
  key: string
}

/**
 * Delete a variable
 */
export class VariableDeleteCommand extends Command<VariableDeleteInput, boolean> {
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
    return `/api/v1/tenants/${this.input.tenantId}/variables/${this.input.key}`
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
