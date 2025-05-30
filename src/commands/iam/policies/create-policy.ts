// src/contracts/policy.ts
import { Command, parseResponseHelper } from "@flowcore/sdk"
import { type Static, Type } from "@sinclair/typebox"

/**
 * The schema for a policy statement document
 */
export const PolicyStatementSchema = Type.Object({
  statementId: Type.Optional(Type.String()),
  resource: Type.String(),
  action: Type.Union([Type.String(), Type.Array(Type.String())]),
})

/**
 * The schema for a policy
 */
export const PolicySchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  version: Type.String(),
  policyDocuments: Type.Array(PolicyStatementSchema),
  description: Type.Optional(Type.String()),
  principal: Type.Optional(Type.String()),
  flowcoreManaged: Type.Boolean(),
  archived: Type.Optional(Type.Boolean()),
  frn: Type.String(),
})

/**
 * The Policy type
 */
export type Policy = Static<typeof PolicySchema>

/**
 * The Policy Statement type
 */
export type PolicyStatement = Static<typeof PolicyStatementSchema>

/**
 * The input for the policy create command
 */
export interface PolicyCreateInput {
  /** The organization id */
  organizationId: string
  /** The name of the policy */
  name: string
  /** The version of the policy */
  version: string
  /** The policy documents */
  policyDocuments: Array<{
    /** The optional statement id */
    statementId?: string
    /** The resource for this statement */
    resource: string
    /** The actions for this statement */
    action: string | string[]
  }>
  /** The description of the policy */
  description?: string
  /** The principal role that can access the resource */
  principal?: string
  /** Whether the policy is managed by Flowcore */
  flowcoreManaged?: boolean
}

/**
 * Create a policy
 */
export class PolicyCreateCommand extends Command<PolicyCreateInput, Policy> {
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
    return "/api/v1/policies/"
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    return {
      ...this.input,
      flowcoreManaged: this.input.flowcoreManaged ?? false,
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Policy {
    return parseResponseHelper(PolicySchema, rawResponse)
  }
}
