import { Command } from "../../common/command.ts"
import {
  type ServiceAccountSecretRotation,
  ServiceAccountSecretRotationSchema,
} from "../../contracts/service-account.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the service account rotate secret command
 */
export interface ServiceAccountRotateSecretInput {
  /** The service account id */
  serviceAccountId: string
}

/**
 * Rotate a service account secret
 */
export class ServiceAccountRotateSecretCommand
  extends Command<ServiceAccountRotateSecretInput, ServiceAccountSecretRotation> {
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
    return `/api/v1/service-accounts/${this.input.serviceAccountId}/rotate-secret`
  }

  /**
   * Get the body
   */
  protected override getBody(): undefined {
    return undefined
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ServiceAccountSecretRotation {
    return parseResponseHelper(ServiceAccountSecretRotationSchema, rawResponse)
  }
}
