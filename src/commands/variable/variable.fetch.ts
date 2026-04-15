import { Command } from "../../common/command.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { type Variable, VariableSchema } from "../../contracts/variable.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the variable fetch command
 */
export interface VariableFetchInput {
  /** The tenant id */
  tenantId: string
  /** The variable key */
  key: string
}

/**
 * Fetch a variable
 */
export class VariableFetchCommand extends Command<VariableFetchInput, Variable> {
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
    return `/api/v1/tenants/${this.input.tenantId}/variables/${this.input.key}`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Variable {
    return parseResponseHelper(VariableSchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Variable", { tenantId: this.input.tenantId, key: this.input.key })
    }
    throw error
  }
}
