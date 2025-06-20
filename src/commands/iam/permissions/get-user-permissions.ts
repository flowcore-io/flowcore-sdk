import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"

/**
 * The schema for a permission
 */
export const PermissionSchema = Type.Object({
  tenant: Type.String(),
  type: Type.String(),
  id: Type.String(),
  action: Type.Array(Type.String()),
})

/**
 * The permission type
 */
export interface Permission {
  tenant: string
  type: string
  id: string
  action: string[]
}

/**
 * The input for the user permissions command
 */
export interface UserPermissionsInput {
  /** The optional permission type */
  type?: string
}

/**
 * Get all permissions for the current user
 */
export class UserPermissionsCommand extends Command<
  UserPermissionsInput,
  Permission[]
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = true

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
    return "/api/v1/permissions/"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Permission[] {
    return parseResponseHelper(Type.Array(PermissionSchema), rawResponse)
  }
}
