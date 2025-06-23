import { Command, parseResponseHelper } from "@flowcore/sdk"
import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"

/**
 * The schema for a key policy link response
 */
export const KeyPolicyLinkSchema: TObject<{
  policyId: TString
  organizationId: TString
  keyId: TString
}> = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String(),
})

/**
 * The key policy link response type
 */
export type KeyPolicyLink = Static<typeof KeyPolicyLinkSchema>

/**
 * The input for the link key policy command
 */
export interface LinkKeyPolicyInput {
  /** The key id */
  keyId: string
  /** The policy id */
  policyId: string
}

/**
 * Link a policy to a key
 */
export class LinkKeyPolicyCommand extends Command<
  LinkKeyPolicyInput,
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
