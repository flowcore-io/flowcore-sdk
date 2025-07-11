import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import {
  type ValidationMode,
  type ValidationRequestAccessItem,
  type ValidationResponse,
  ValidationResponseSchema,
} from "./validate-user.ts"

/**
 * The input for the key validation command
 */
export interface ValidateKeyInput {
  /** The key id */
  keyId: string
  /** The mode of validation */
  mode: ValidationMode
  /** The requested access */
  requestedAccess: ValidationRequestAccessItem[]
}

/**
 * Validate if a key can perform actions
 */
export class ValidateKeyCommand extends Command<
  ValidateKeyInput,
  ValidationResponse
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = true

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
    return `/api/v1/validate/keys/${this.input.keyId}`
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
