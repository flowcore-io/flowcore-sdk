// src/commands/iam/policies/validate-policy.ts
import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { type Static, type TLiteral, type TObject, Type } from "@sinclair/typebox"

/**
 * The schema for a successful policy validation response.
 *
 * Returned by `POST /api/v1/policies/validate` when the submitted policy
 * payload passes every rule the create and patch paths enforce. Invalid
 * payloads are surfaced as 4xx errors (422 for format / tenant boundary /
 * UUID violations, 404 when the organization is not found) and are not
 * represented in this schema.
 */
export const PolicyValidateResponseSchema: TObject<{
  valid: TLiteral<true>
}> = Type.Object({
  valid: Type.Literal(true),
})

/**
 * The Policy Validate response type
 */
export type PolicyValidateResponse = Static<typeof PolicyValidateResponseSchema>

/**
 * The input for the policy validate command.
 *
 * Mirrors the service's `validatePolicyBody` DTO: only the fields that are
 * actually validated are required. The command is a dry-run of the same
 * helpers used by `PolicyCreateCommand` and `PolicyUpdateCommand`, so a
 * successful response guarantees the payload would also be accepted by
 * those commands.
 */
export interface PolicyValidateInput {
  /** The organization that would own the policy — used to enforce the tenant boundary on policyDocuments resources */
  organizationId: string
  /** The policy documents to validate */
  policyDocuments: Array<{
    /** The optional statement id */
    statementId?: string
    /** The resource for this statement */
    resource: string
    /** The actions for this statement */
    action: string | string[]
  }>
  /** The optional principal role FRN (cross-tenant is intentionally permitted here) */
  principal?: string
}

/**
 * Dry-run validate a prospective policy payload.
 *
 * Calls `POST /api/v1/policies/validate`, which runs the same
 * validation helpers as `POST /api/v1/policies/` and
 * `PATCH /api/v1/policies/:id`. A successful response means the same
 * payload would be accepted by the create/update commands. Useful for
 * giving immediate feedback in UIs, CLIs, and SDK consumers before any
 * write actually happens.
 */
export class PolicyValidateCommand extends Command<PolicyValidateInput, PolicyValidateResponse> {
  /**
   * Whether the command should retry on failure.
   *
   * Disabled because a 422 here indicates an invalid payload — retrying
   * would just re-submit the same bad data.
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
    return "/api/v1/policies/validate"
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    return {
      ...this.input,
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): PolicyValidateResponse {
    return parseResponseHelper(PolicyValidateResponseSchema, rawResponse)
  }
}
