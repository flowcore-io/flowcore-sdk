import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"

/**
 * The mode of validation
 */
export type ValidationMode = "tenant" | "organization"

/**
 * The validation request access item
 */
export interface ValidationRequestAccessItem {
  action: string
  resource: string[]
}

/**
 * The schema for a valid policy
 */
export const ValidPolicySchema = Type.Object({
  policyFrn: Type.String(),
  statementId: Type.String(),
})

/**
 * The schema for a validation response
 */
export const ValidationResponseSchema = Type.Object({
  valid: Type.Boolean(),
  checksum: Type.String(),
  validPolicies: Type.Array(ValidPolicySchema),
})

/**
 * The valid policy type
 */
export interface ValidPolicy {
  policyFrn: string
  statementId: string
}

/**
 * The validation response type
 */
export interface ValidationResponse {
  valid: boolean
  checksum: string
  validPolicies: ValidPolicy[]
}

/**
 * The input for the user validation command
 */
export interface ValidateUserInput {
  /** The user id */
  userId: string
  /** The mode of validation */
  mode: ValidationMode
  /** The requested access */
  requestedAccess: ValidationRequestAccessItem[]
}

/**
 * Validate if a user can perform actions
 */
export class ValidateUserCommand extends Command<
  ValidateUserInput,
  ValidationResponse
> {
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
    return `/api/v1/validate/users/${this.input.userId}`
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    const { ...rest } = this.input
    return rest
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ValidationResponse {
    return parseResponseHelper(ValidationResponseSchema, rawResponse)
  }
}
