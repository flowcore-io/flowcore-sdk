import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Variable, VariableSchema } from "../../contracts/variable.ts"
import { Type } from "@sinclair/typebox"

/**
 * The input for the variable list command
 */
export interface VariableListInput {
  /** The tenant id */
  tenantId: string
}

/**
 * List variables
 */
export class VariableListCommand extends Command<VariableListInput, Variable[]> {
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
    return `/api/v1/tenants/${this.input.tenantId}/variables`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Variable[] {
    return parseResponseHelper(Type.Array(VariableSchema), rawResponse)
  }
}
