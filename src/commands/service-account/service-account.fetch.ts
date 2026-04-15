import { Command } from "../../common/command.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { type ServiceAccount, ServiceAccountSchema } from "../../contracts/service-account.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the service account fetch command
 */
export interface ServiceAccountFetchInput {
  /** The service account id */
  serviceAccountId: string
}

/**
 * Fetch a service account
 */
export class ServiceAccountFetchCommand extends Command<ServiceAccountFetchInput, ServiceAccount> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
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
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ServiceAccount {
    return parseResponseHelper(ServiceAccountSchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("ServiceAccount", { id: this.input.serviceAccountId })
    }
    throw error
  }
}
