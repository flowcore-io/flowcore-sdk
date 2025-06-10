import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import { type Role, RoleSchema } from "../roles/create-role.ts"

/**
 * The input for the user roles command
 */
export interface UserRolesInput {
  /** The user id */
  userId: string
  /** The optional organization id */
  organizationId?: string
}

/**
 * Fetch roles for a user
 */
export class UserRolesCommand extends Command<UserRolesInput, Role[]> {
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
    const basePath = `/api/v1/role-associations/user/${this.input.userId}/`
    // Add organizationId directly to the URL as a query parameter if provided
    if (this.input.organizationId) {
      return `${basePath}?organizationId=${this.input.organizationId}`
    }
    return basePath
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Role[] {
    return parseResponseHelper(Type.Array(RoleSchema), rawResponse)
  }
}
