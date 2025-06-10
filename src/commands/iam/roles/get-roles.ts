import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import { type Role, RoleSchema } from "./create-role.ts"

/**
 * The input for the role list command
 */
export interface RoleListInput {
  /** Optional organization id to filter by */
  organizationId?: string
}

/**
 * List roles for the current user
 */
export class RoleListCommand extends Command<RoleListInput, Role[]> {
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
    return "/api/v1/roles/"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Role[] {
    return parseResponseHelper(Type.Array(RoleSchema), rawResponse)
  }
}
