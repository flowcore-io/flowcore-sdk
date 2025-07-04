import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Variable, VariableSchema } from "../../contracts/variable.ts"

/**
 * The input for the variable edit command
 */
export interface VariableEditInput {
  /** The tenant id */
  tenantId: string
  /** The key of the variable */
  key: string
  /** The value of the variable */
  value?: string
  /** The description of the variable */
  description?: string
}

/**
 * Edit a variable
 */
export class VariableEditCommand extends Command<VariableEditInput, Variable> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
}
