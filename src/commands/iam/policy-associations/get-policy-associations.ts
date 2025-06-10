import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"

/**
 * The schema for a policy-key association
 */
export const PolicyKeyAssociationSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String(),
})

/**
 * The schema for a policy-user association
 */
export const PolicyUserAssociationSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
})

/**
 * The schema for a policy-role association
 */
export const PolicyRoleAssociationSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  roleId: Type.String(),
})

/**
 * The schema for policy associations
 */
export const PolicyAssociationsSchema = Type.Object({
  keys: Type.Array(PolicyKeyAssociationSchema),
  users: Type.Array(PolicyUserAssociationSchema),
  roles: Type.Array(PolicyRoleAssociationSchema),
})

/**
 * The policy-key association type
 */
export type PolicyKeyAssociation = {
  policyId: string
  organizationId: string
  keyId: string
}

/**
 * The policy-user association type
 */
export type PolicyUserAssociation = {
  policyId: string
  organizationId: string
  userId: string
}

/**
 * The policy-role association type
 */
export type PolicyRoleAssociation = {
  policyId: string
  organizationId: string
  roleId: string
}

/**
 * The policy associations type
 */
export type PolicyAssociations = {
  keys: PolicyKeyAssociation[]
  users: PolicyUserAssociation[]
  roles: PolicyRoleAssociation[]
}

/**
 * The input for the policy associations command
 */
export interface PolicyAssociationsInput {
  /** The policy id */
  policyId: string
}

/**
 * Parse policy associations response with fallbacks for missing data
 */
const parsePolicyAssociationsResponse = (
  rawResponse: unknown,
): PolicyAssociations => {
  try {
    // First try standard parsing
    return parseResponseHelper(PolicyAssociationsSchema, rawResponse)
  } catch (_error: unknown) {
    // If it's not an object at all, return empty arrays
    if (!rawResponse || typeof rawResponse !== "object") {
      return { keys: [], users: [], roles: [] }
    }

    // Extract the raw data with safe fallbacks
    const rawData = rawResponse as Record<string, unknown>

    // Ensure each section exists and is an array
    let keys = Array.isArray(rawData.keys) ? rawData.keys : []
    let users = Array.isArray(rawData.users) ? rawData.users : []
    let roles = Array.isArray(rawData.roles) ? rawData.roles : []

    // Try to validate each section separately
    try {
      keys = parseResponseHelper(Type.Array(PolicyKeyAssociationSchema), keys)
    } catch (_error: unknown) {
      keys = []
    }

    try {
      users = parseResponseHelper(
        Type.Array(PolicyUserAssociationSchema),
        users,
      )
    } catch (_error: unknown) {
      users = []
    }

    try {
      roles = parseResponseHelper(
        Type.Array(PolicyRoleAssociationSchema),
        roles,
      )
    } catch (_error: unknown) {
      roles = []
    }

    return { keys, users, roles }
  }
}

/**
 * Fetch associations for a policy
 */
export class PolicyAssociationsCommand extends Command<
  PolicyAssociationsInput,
  PolicyAssociations
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
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/policy-associations/${this.input.policyId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): PolicyAssociations {
    return parsePolicyAssociationsResponse(rawResponse)
  }
}
