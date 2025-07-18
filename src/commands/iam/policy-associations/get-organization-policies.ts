import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { Type } from "@sinclair/typebox"
import { type Policy, PolicySchema } from "../policies/create-policy.ts"

/**
 * The input for the organization policies command
 */
export interface OrganizationPoliciesInput {
  /** The organization id */
  organizationId: string
}

/**
 * Fetch policies for an organization
 */
export class OrganizationPoliciesCommand extends Command<
  OrganizationPoliciesInput,
  Policy[]
> {
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
    // Use a proxy URL in development mode
    // if (process.env.NODE_ENV === "development") {
    // 	return typeof window === "undefined"
    // 		? "http://localhost:3000" // Server-side in dev
    // 		: ""; // Client-side in dev (relative URL)
    // }
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    // Use the proxy API in development mode
    // if (process.env.NODE_ENV === "development") {
    // 	return `/api/proxy/iam/policy-associations/organization/${this.input.organizationId}`;
    // }
    return `/api/v1/policy-associations/organization/${this.input.organizationId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Policy[] {
    try {
      // Handle empty responses
      if (!rawResponse) {
        return []
      }

      // If we get an array directly, try to parse each item
      if (Array.isArray(rawResponse)) {
        return rawResponse.map((item) => {
          try {
            return parseResponseHelper(PolicySchema, item)
          } catch (_error: unknown) {
            // Return a minimal valid policy object
            return {
              id: item.id || "unknown",
              name: item.name || "Unknown Policy",
              version: item.version || "1.0",
              description: item.description || "",
              flowcoreManaged: !!item.flowcoreManaged,
              policyDocuments: item.policyDocuments || [],
              organizationId: this.input.organizationId,
              frn: item.frn ||
                `frn::${this.input.organizationId}:policy/${item.id || "unknown"}`,
              archived: item.archived === undefined ? false : !!item.archived,
            }
          }
        })
      }

      // Try the normal parsing
      return parseResponseHelper(Type.Array(PolicySchema), rawResponse)
    } catch (error) {
      throw error
    }
  }
}
