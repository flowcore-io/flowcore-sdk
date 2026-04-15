import { Command } from "../../common/command.ts"
import { type ServiceAccountWithSecret, ServiceAccountWithSecretSchema } from "../../contracts/service-account.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the service account create command
 */
export interface ServiceAccountCreateInput {
  /** The tenant id */
  tenantId: string
  /** The name of the service account */
  name: string
  /** The description of the service account */
  description?: string
  /** Whether the service account should be admin */
  isAdmin?: boolean
}

/**
 * Create a service account
 */
export class ServiceAccountCreateCommand extends Command<ServiceAccountCreateInput, ServiceAccountWithSecret> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

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
    return "https://tenant-store.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return "/api/v1/service-accounts"
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ServiceAccountWithSecret {
    return parseResponseHelper(ServiceAccountWithSecretSchema, rawResponse)
  }
}
