import { Command } from "../../common/command.ts"
import {
  type AwsMarketplaceDedicatedClusterType,
  type AwsMarketplaceLinkCreate,
  AwsMarketplaceLinkCreateSchema,
  type AwsMarketplaceProductProperties,
} from "../../contracts/aws-marketplace.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the AWS Marketplace link create command.
 */
export interface AwsMarketplaceLinkCreateInput {
  /** The AWS Marketplace registration token */
  registrationToken: string
  /** The tenant slug */
  tenant: string
  /** The tenant id */
  tenantId: string
  /** Product-specific properties */
  productProperties?: AwsMarketplaceProductProperties & {
    /** The dedicated cluster type for dedicated products */
    dedicatedClusterType?: AwsMarketplaceDedicatedClusterType
  }
  /** Optional license key */
  licenseKey?: string
}

/**
 * Create an AWS Marketplace link for a tenant.
 */
export class AwsMarketplaceLinkCreateCommand extends Command<AwsMarketplaceLinkCreateInput, AwsMarketplaceLinkCreate> {
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
    return "/api/v1/aws-marketplace/links"
  }

  /**
   * Parse the response.
   */
  protected override parseResponse(rawResponse: unknown): AwsMarketplaceLinkCreate {
    return parseResponseHelper(AwsMarketplaceLinkCreateSchema, rawResponse)
  }
}
