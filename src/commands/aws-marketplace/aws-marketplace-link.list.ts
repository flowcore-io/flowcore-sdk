import { Command } from "../../common/command.ts"
import { type AwsMarketplaceLinkList, AwsMarketplaceLinkListSchema } from "../../contracts/aws-marketplace.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the AWS Marketplace link list command.
 */
export interface AwsMarketplaceLinkListInput {
  /** The tenant slug */
  tenant?: string
  /** The tenant id */
  tenantId?: string
  /** The AWS Marketplace customer id */
  awsCustomerId?: string
  /** The AWS Marketplace product code */
  awsProductCode?: string
}

/**
 * List AWS Marketplace links.
 */
export class AwsMarketplaceLinkListCommand extends Command<AwsMarketplaceLinkListInput, AwsMarketplaceLinkList> {
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
    const queryParams = new URLSearchParams()
    if (this.input.tenant) queryParams.set("tenant", this.input.tenant)
    if (this.input.tenantId) queryParams.set("tenantId", this.input.tenantId)
    if (this.input.awsCustomerId) queryParams.set("awsCustomerId", this.input.awsCustomerId)
    if (this.input.awsProductCode) queryParams.set("awsProductCode", this.input.awsProductCode)
    return `/api/v1/aws-marketplace/links?${queryParams.toString()}`
  }

  /**
   * Parse the response.
   */
  protected override parseResponse(rawResponse: unknown): AwsMarketplaceLinkList {
    return parseResponseHelper(AwsMarketplaceLinkListSchema, rawResponse)
  }
}
