import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

/**
 * The schema for a key role link response
 */
export const KeyRoleLinkSchema: TObject<{
  roleId: TString
  organizationId: TString
  keyId: TString
}> = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String(),
})

/**
 * The key role link response type
 */
export type KeyRoleLink = Static<typeof KeyRoleLinkSchema>

/**
 * The input for the link key role command
 */
export interface LinkKeyRoleInput {
  /** The key id */
  keyId: string
  /** The role id */
  roleId: string
}

/**
 * Link a role to a key
 */
export class LinkKeyRoleCommand extends Command<LinkKeyRoleInput, KeyRoleLink> {
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
