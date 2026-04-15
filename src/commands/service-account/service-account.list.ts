import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type ServiceAccount, ServiceAccountSchema } from "../../contracts/service-account.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the service account list command
 */
export interface ServiceAccountListInput {
  /** The tenant id */
  tenantId: string
}

/**
 * List service accounts
 */
export class ServiceAccountListCommand extends Command<ServiceAccountListInput, ServiceAccount[]> {
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
    const queryParams = new URLSearchParams({
      tenantId: this.input.tenantId,
    })
    return `/api/v1/service-accounts?${queryParams.toString()}`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ServiceAccount[] {
    return parseResponseHelper(Type.Array(ServiceAccountSchema), rawResponse)
  }
}
