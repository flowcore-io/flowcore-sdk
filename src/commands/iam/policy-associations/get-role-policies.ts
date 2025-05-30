import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import { type Policy, PolicySchema } from "../policies/create-policy.ts"

/**
 * The input for the role policies command
 */
export interface RolePoliciesInput {
  /** The role id */
  roleId: string
}

/**
 * Interface for raw policy data from API before validation
 */
interface RawPolicy {
  id: string
  organizationId: string
  name: string
  version: string
  policyDocuments: Array<{
    statementId?: string
    resource: string
    action: string | string[]
  }>
  description?: string
  principal?: string
  flowcoreManaged: unknown // Could be any type before sanitization
  archived?: boolean
  frn: string
}

/**
 * Custom parser to handle non-boolean flowcoreManaged values
 */
const parseRolePoliciesResponse = (rawResponse: unknown): Policy[] => {
  try {
    // First try standard parsing
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse)
  } catch (error) {
    // If there's an error, check if it's related to flowcoreManaged
    if (
      error instanceof Error &&
      error.message.includes("flowcoreManaged") &&
      Array.isArray(rawResponse)
    ) {
      // Convert flowcoreManaged to boolean for each policy
      const sanitizedPolicies = rawResponse.map((policy: RawPolicy) => ({
        ...policy,
        // Convert to boolean using double negation
        flowcoreManaged: policy.flowcoreManaged === true || !!policy.flowcoreManaged,
      }))

      // Try parsing again with the sanitized data
      return parseResponseHelper(Type.Array(PolicySchema), sanitizedPolicies)
    }

    // If not a flowcoreManaged error or not an array, rethrow
    throw error
  }
}

/**
 * Fetch policies for a role
 */
export class RolePoliciesCommand extends Command<RolePoliciesInput, Policy[]> {
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
    return `/api/v1/policy-associations/role/${this.input.roleId}/`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Policy[] {
    return parseRolePoliciesResponse(rawResponse)
  }
}
