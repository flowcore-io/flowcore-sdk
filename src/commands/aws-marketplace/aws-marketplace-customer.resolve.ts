import { Command } from "../../common/command.ts"
import {
  type AwsMarketplaceCustomerResolve,
  AwsMarketplaceCustomerResolveSchema,
} from "../../contracts/aws-marketplace.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the AWS Marketplace customer resolve command.
 */
export interface AwsMarketplaceCustomerResolveInput {
  /** The AWS Marketplace registration token */
  registrationToken: string
}

/**
 * Resolve an AWS Marketplace registration token.
 */
export class AwsMarketplaceCustomerResolveCommand
  extends Command<AwsMarketplaceCustomerResolveInput, AwsMarketplaceCustomerResolve> {
  /**
   * Whether the command should retry on failure.
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method.
   */
  protected override getMethod(): string {
    return "POST"
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
    return "/api/v1/aws-marketplace/customers/resolve"
  }

  /**
   * Parse the response.
   */
  protected override parseResponse(rawResponse: unknown): AwsMarketplaceCustomerResolve {
    return parseResponseHelper(AwsMarketplaceCustomerResolveSchema, rawResponse)
  }
}
