import { Command } from "../../../../common/command.ts"
import { parseResponseHelper } from "../../../../utils/parse-response-helper.ts"
import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

/**
 * The input for the role archive command
 */
export interface RoleArchiveInput {
  /** The role id */
  roleId: string
}

/**
 * The schema for the archive role response
 */
export const ArchiveRoleResponseSchema: TObject<{
  message: TString
}> = Type.Object({
  message: Type.String(),
})

/**
 * The archive role response type
 */
export type ArchiveRoleResponse = Static<typeof ArchiveRoleResponseSchema>

/**
 * Archive a role by ID
 */
export class RoleArchiveCommand extends Command<
  RoleArchiveInput,
  ArchiveRoleResponse
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
    return `/api/v1/roles/${this.input.roleId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ArchiveRoleResponse {
    return parseResponseHelper(ArchiveRoleResponseSchema, rawResponse)
  }
}
