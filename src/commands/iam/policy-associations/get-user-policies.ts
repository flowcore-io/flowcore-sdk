import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import { type Policy, PolicySchema } from "../policies/create-policy.ts"

/**
 * The input for the user policies command
 */
export interface UserPoliciesInput {
  /** The user id */
  userId: string
  /** The optional organization id */
  organizationId?: string
}

/**
 * Fetch policies for a user
 */
export class UserPoliciesCommand extends Command<UserPoliciesInput, Policy[]> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

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
    return `/api/v1/policy-associations/user/${this.input.userId}/`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Policy[] {
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse)
  }
}
