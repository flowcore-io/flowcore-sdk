import { Command } from "../../../../common/command.ts"
import { parseResponseHelper } from "../../../../utils/parse-response-helper.ts"
import { type Policy, PolicySchema } from "../create-policy.ts"

/**
 * The input for the policy get command
 */
export interface PolicyGetInput {
  /** The policy id */
  policyId: string
}

/**
 * Get a policy by ID
 */
export class PolicyGetCommand extends Command<PolicyGetInput, Policy> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = true

  /**
   * Create a new instance of the command
   * @param policyId - The ID of the policy to get
   */
  constructor(policyId: string)
  /**
   * Create a new instance of the command
   * @param input - The input for the command
   */
  constructor(input: PolicyGetInput)
  constructor(inputOrPolicyId: PolicyGetInput | string) {
    const input = typeof inputOrPolicyId === "string" ? { policyId: inputOrPolicyId } : inputOrPolicyId
    super(input)
  }

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
    return `/api/v1/policies/${this.input.policyId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Policy {
    return parseResponseHelper(PolicySchema, rawResponse)
  }
}
