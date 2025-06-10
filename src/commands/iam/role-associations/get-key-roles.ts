import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import { type Role, RoleSchema } from "../roles/create-role.ts"

/**
 * The input for the key roles command
 */
export interface KeyRolesInput {
  /** The key id */
  keyId: string
}

/**
 * Fetch roles for a key
 */
export class KeyRolesCommand extends Command<KeyRolesInput, Role[]> {
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
    return `/api/v1/role-associations/key/${this.input.keyId}/`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Role[] {
    return parseResponseHelper(Type.Array(RoleSchema), rawResponse)
  }
}
