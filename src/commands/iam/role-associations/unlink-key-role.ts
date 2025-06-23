import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { type KeyRoleLink, KeyRoleLinkSchema } from "./link-key-role.ts"

/**
 * The input for the unlink key role command
 */
export interface UnlinkKeyRoleInput {
  /** The key id */
  keyId: string
  /** The role id */
  roleId: string
}

/**
 * Unlink a role from a key
 */
export class UnlinkKeyRoleCommand extends Command<
  UnlinkKeyRoleInput,
  KeyRoleLink
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "DELETE"
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
  protected override parseResponse(rawResponse: unknown): KeyRoleLink {
    return parseResponseHelper(KeyRoleLinkSchema, rawResponse)
  }
}
