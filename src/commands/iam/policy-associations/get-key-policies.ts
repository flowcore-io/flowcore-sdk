import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import { type Policy, PolicySchema } from "../policies/create-policy.ts"

/**
 * The input for the key policies command
 */
export interface KeyPoliciesInput {
  /** The key id */
  keyId: string
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
const parseKeyPoliciesResponse = (rawResponse: unknown): Policy[] => {
  // Check if the response is null or undefined
  if (!rawResponse) {
    return []
  }

  // Check if it's already an array
  if (!Array.isArray(rawResponse)) {
    // Check if it's wrapped in an object
    if (typeof rawResponse === "object" && "data" in rawResponse) {
      return parseKeyPoliciesResponse((rawResponse as { data: unknown }).data)
    }
    if (typeof rawResponse === "object" && "policies" in rawResponse) {
      return parseKeyPoliciesResponse(
        (rawResponse as { policies: unknown }).policies,
      )
    }
    return []
  }

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

    // If not a flowcoreManaged error or not an array, return empty
    // Try to return raw array if it looks like it has the right structure
    if (
      Array.isArray(rawResponse) &&
      rawResponse.length > 0 &&
      rawResponse[0].id
    ) {
      return rawResponse as Policy[]
    }

    return []
  }
}

/**
 * Fetch policies for a key
 */
export class KeyPoliciesCommand extends Command<KeyPoliciesInput, Policy[]> {
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
    return `/api/v1/policy-associations/key/${this.input.keyId}/`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Policy[] {
    return parseKeyPoliciesResponse(rawResponse)
  }
}
