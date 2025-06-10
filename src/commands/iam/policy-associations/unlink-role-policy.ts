import { Command, parseResponseHelper } from "@flowcore/sdk"
import { type RolePolicyLink, RolePolicyLinkSchema } from "./link-role-policy.ts"

/**
 * The input for the unlink role policy command
 */
export interface UnlinkRolePolicyInput {
  /** The role id */
  roleId: string
  /** The policy id */
  policyId: string
}

/**
 * Unlink a policy from a role
 */
export class UnlinkRolePolicyCommand extends Command<
  UnlinkRolePolicyInput,
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
