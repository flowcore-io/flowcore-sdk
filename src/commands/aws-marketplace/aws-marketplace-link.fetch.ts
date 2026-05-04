import { Command } from "../../common/command.ts"
import { type AwsMarketplaceLinkFetch, AwsMarketplaceLinkFetchSchema } from "../../contracts/aws-marketplace.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the AWS Marketplace link fetch command.
 */
export interface AwsMarketplaceLinkFetchInput {
  /** The AWS Marketplace linking id */
  linkingId: string
}

/**
 * Fetch an AWS Marketplace link.
 */
export class AwsMarketplaceLinkFetchCommand extends Command<AwsMarketplaceLinkFetchInput, AwsMarketplaceLinkFetch> {
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
    return "GET"
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
    return `/api/v1/aws-marketplace/links/${this.input.linkingId}`
  }

  /**
   * Parse the response.
   */
  protected override parseResponse(rawResponse: unknown): AwsMarketplaceLinkFetch {
    return parseResponseHelper(AwsMarketplaceLinkFetchSchema, rawResponse)
  }
}
