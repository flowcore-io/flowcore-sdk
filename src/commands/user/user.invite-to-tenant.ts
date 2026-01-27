import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { Static, TBoolean, TObject, TString } from "@sinclair/typebox"

/**
 * The input for inviting a user to a tenant
 */
export interface UserInviteToTenantInput {
  tenantName: string
  userEmail: string
}

/**
 * The output for inviting a user to a tenant
 */
export type UserInviteToTenantOutput = Static<typeof responseSchema>

const responseSchema: TObject<{
  success: TBoolean
  tenantName: TString
  invitedEmail: TString
}> = Type.Object({
  success: Type.Boolean(),
  tenantName: Type.String(),
  invitedEmail: Type.String(),
})

/**
 * Invite an existing user (by email) to a tenant
 */
export class UserInviteToTenantCommand extends Command<
  UserInviteToTenantInput,
  UserInviteToTenantOutput
> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Get the base URL for the request
   */
  protected override getBaseUrl(): string {
    return "https://user-2.api.flowcore.io"
  }

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "POST"
  }

  /**
   * Get the path for the request
   */
  protected override getPath(): string {
    return "/api/users/invitations"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): UserInviteToTenantOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }
}
