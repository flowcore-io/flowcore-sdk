import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the user role associations delete command
 */
export interface UserRoleAssociationDeleteInput {
  /** the user id */
  userId: string
  /** the role id */
  roleId: string
}

/**
 * The response for the user role associations delete command
 */
const responseSchema: TObject<{
  roleId: TString
  organizationId: TString
  userId: TString
}> = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
})

/**
 * Delete a user role association
 */
export class UserRoleAssociationDeleteCommand
  extends Command<UserRoleAssociationDeleteInput, Static<typeof responseSchema>> {
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
    return `/api/v1/role-associations/user/${this.input.userId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Static<typeof responseSchema> {
    return parseResponseHelper(responseSchema, rawResponse)
  }
}
