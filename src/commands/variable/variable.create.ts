import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Variable, VariableSchema } from "../../contracts/variable.ts"

/**
 * The input for the variable create command
 */
export interface VariableCreateInput {
  /** The tenant id */
  tenantId: string
  /** The key of the variable */
  key: string
  /** The value of the variable */
  value: string
  /** The description of the variable */
  description?: string
}

/**
 * Create a variable
 */
export class VariableCreateCommand extends Command<VariableCreateInput, Variable> {
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
    return `/api/v1/tenants/${this.input.tenantId}/variables`
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
