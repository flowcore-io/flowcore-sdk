import { Command } from "../../common/command.ts"
import { type ServiceAccount, ServiceAccountSchema } from "../../contracts/service-account.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the service account edit command
 */
export interface ServiceAccountEditInput {
  /** The service account id */
  serviceAccountId: string
  /** The description of the service account */
  description?: string
  /** Whether the service account is enabled */
  enabled?: boolean
}

/**
 * Edit a service account
 */
export class ServiceAccountEditCommand extends Command<ServiceAccountEditInput, ServiceAccount> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
    return `/api/v1/service-accounts/${this.input.serviceAccountId}`
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    return {
      ...(this.input.description !== undefined ? { description: this.input.description } : {}),
      ...(this.input.enabled !== undefined ? { enabled: this.input.enabled } : {}),
    }
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ServiceAccount {
    return parseResponseHelper(ServiceAccountSchema, rawResponse)
  }
}
