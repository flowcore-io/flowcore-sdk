import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

/**
 * The schema for a role policy link response
 */
export const RolePolicyLinkSchema: TObject<{
  policyId: TString
  organizationId: TString
  roleId: TString
}> = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  roleId: Type.String(),
})

/**
 * The role policy link response type
 */
export type RolePolicyLink = Static<typeof RolePolicyLinkSchema>

/**
 * The input for the link role policy command
 */
export interface LinkRolePolicyInput {
  /** The role id */
  roleId: string
  /** The policy id */
  policyId: string
}

/**
 * Link a policy to a role
 */
export class LinkRolePolicyCommand extends Command<
  LinkRolePolicyInput,
  RolePolicyLink
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
    return `/api/v1/policy-associations/role/${this.input.roleId}/`
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    return {
      policyId: this.input.policyId,
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): RolePolicyLink {
    return parseResponseHelper(RolePolicyLinkSchema, rawResponse)
  }
}
