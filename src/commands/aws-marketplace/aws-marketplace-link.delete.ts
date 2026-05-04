import { Command } from "../../common/command.ts"
import { type AwsMarketplaceLinkDelete, AwsMarketplaceLinkDeleteSchema } from "../../contracts/aws-marketplace.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the AWS Marketplace link delete command.
 */
export interface AwsMarketplaceLinkDeleteInput {
  /** The AWS Marketplace linking id */
  linkingId: string
  /** Optional unlink reason */
  reason?: string
}

/**
 * Delete an AWS Marketplace link.
 */
export class AwsMarketplaceLinkDeleteCommand extends Command<AwsMarketplaceLinkDeleteInput, AwsMarketplaceLinkDelete> {
  /**
   * Whether the command should retry on failure.
   */
  protected override retryOnFailure: boolean = false

  /**
   * The allowed modes for the command.
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Get the method.
   */
  protected override getMethod(): string {
    return "DELETE"
  }

  /**
   * Get the base url.
   */
  protected override getBaseUrl(): string {
    return "https://subscription-2.api.flowcore.io"
  }

  /**
   * Get the path.
   */
  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    if (this.input.reason) queryParams.set("reason", this.input.reason)
    const query = queryParams.toString()
    return `/api/v1/aws-marketplace/links/${this.input.linkingId}${query ? `?${query}` : ""}`
  }

  /**
   * Get the body.
   */
  protected override getBody(): undefined {
    return undefined
  }

  /**
   * Parse the response.
   */
  protected override parseResponse(rawResponse: unknown): AwsMarketplaceLinkDelete {
    return parseResponseHelper(AwsMarketplaceLinkDeleteSchema, rawResponse)
  }
}
