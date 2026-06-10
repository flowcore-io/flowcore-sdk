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
          const policy = item as Record<string, unknown>
          const id = typeof policy.id === "string" ? policy.id : "unknown"

          // Return a minimal valid policy object
          return {
            id,
            name: typeof policy.name === "string" ? policy.name : "Unknown Policy",
            version: typeof policy.version === "string" ? policy.version : "1.0",
            description: typeof policy.description === "string" ? policy.description : "",
            flowcoreManaged: Boolean(policy.flowcoreManaged),
            policyDocuments: Array.isArray(policy.policyDocuments) ? policy.policyDocuments : [],
            organizationId: this.input.organizationId,
            frn: typeof policy.frn === "string" ? policy.frn : `frn::${this.input.organizationId}:policy/${id}`,
            archived: policy.archived === undefined ? false : Boolean(policy.archived),
          }
        }
      })
    }

    // Try the normal parsing
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse)
  }
}
