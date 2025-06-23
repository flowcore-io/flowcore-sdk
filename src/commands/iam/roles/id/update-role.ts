import { Command } from "../../../../common/command.ts"
import { parseResponseHelper } from "../../../../utils/parse-response-helper.ts"
import { type Role, RoleSchema } from "../create-role.ts"

/**
 * The input for the role update command
 */
export interface RoleUpdateInput {
  /** The role id */
  roleId: string
  /** The organization id */
  organizationId: string
  /** The name of the role */
  name: string
  /** The description of the role */
  description?: string
  /** Whether the role is managed by Flowcore */
  flowcoreManaged?: boolean
}

/**
 * Update a role by ID
 */
export class RoleUpdateCommand extends Command<RoleUpdateInput, Role> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

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
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/roles/${this.input.roleId}`
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    const { roleId, ...rest } = this.input
    return {
      id: roleId,
      ...rest,
      flowcoreManaged: rest.flowcoreManaged ?? false,
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Role {
    return parseResponseHelper(RoleSchema, rawResponse)
  }
}
