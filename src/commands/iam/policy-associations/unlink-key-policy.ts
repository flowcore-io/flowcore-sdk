import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { type KeyPolicyLink, KeyPolicyLinkSchema } from "./link-key-policy.ts"

/**
 * The input for the unlink key policy command
 */
export interface UnlinkKeyPolicyInput {
  /** The key id */
  keyId: string
  /** The policy id */
  policyId: string
}

/**
 * Unlink a policy from a key
 */
export class UnlinkKeyPolicyCommand extends Command<
  UnlinkKeyPolicyInput,
  KeyPolicyLink
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "DELETE"
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
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    return {
      policyId: this.input.policyId,
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): KeyPolicyLink {
    return parseResponseHelper(KeyPolicyLinkSchema, rawResponse)
  }
}
