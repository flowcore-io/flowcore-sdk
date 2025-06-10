import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"

/**
 * The schema for a user role link response
 */
export const UserRoleLinkSchema = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
})

/**
 * The user role link response type
 */
export interface UserRoleLink {
  roleId: string
  organizationId: string
  userId: string
}

/**
 * The input for the link user role command
 */
export interface LinkUserRoleInput {
  /** The user id */
  userId: string
  /** The role id */
  roleId: string
}

/**
 * Link a role to a user
 */
export class LinkUserRoleCommand extends Command<
  LinkUserRoleInput,
  UserRoleLink
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

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
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/role-associations/user/${this.input.userId}/`
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    return {
      roleId: this.input.roleId,
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): UserRoleLink {
    return parseResponseHelper(UserRoleLinkSchema, rawResponse)
  }
}
