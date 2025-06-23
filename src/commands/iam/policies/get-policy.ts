import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { Type } from "@sinclair/typebox"
import { type Policy, PolicySchema } from "./create-policy.ts" // Reuse the Policy type definition

/**
 * The input for the policy list command
 */
export interface PolicyListInput {
  /** The organization id */
  organizationId?: string
}

/**
 * List policies
 */
export class PolicyListCommand extends Command<PolicyListInput, Policy[]> {
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
    return "/api/v1/policies/"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Policy[] {
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse)
  }
}
