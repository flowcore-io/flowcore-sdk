// src/contracts/policy.ts
import { Command, parseResponseHelper } from "@flowcore/sdk"
import { type Static, Type, type TObject, type TString, type TArray, type TUnion, type TOptional, type TBoolean } from "@sinclair/typebox"

/**
 * The schema for a policy statement document
 */
export const PolicyStatementSchema: TObject<{
  statementId: TOptional<TString>
  resource: TString
  action: TUnion<[TString, TArray<TString>]>
}> = Type.Object({
  statementId: Type.Optional(Type.String()),
  resource: Type.String(),
  action: Type.Union([Type.String(), Type.Array(Type.String())]),
})

/**
 * The schema for a policy
 */
export const PolicySchema: TObject<{
  id: TString
  organizationId: TString
  name: TString
  version: TString
  policyDocuments: TArray<typeof PolicyStatementSchema>
  description: TOptional<TString>
  principal: TOptional<TString>
  flowcoreManaged: TBoolean
  archived: TOptional<TBoolean>
  frn: TString
}> = Type.Object({
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
