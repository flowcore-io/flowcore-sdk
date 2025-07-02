import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Secret, SecretSchema } from "../../contracts/secret.ts"

/**
 * The input for the secret edit command
 */
export interface SecretEditInput {
  /** The tenant id */
  tenantId: string
  /** The key of the secret */
  key: string
  /** The value of the secret */
  value?: string
  /** The description of the secret */
  description?: string
}

/**
 * Edit a secret
 */
export class SecretEditCommand extends Command<SecretEditInput, Secret> {
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
    return `/api/v1/tenants/${this.input.tenantId}/secrets/${this.input.key}`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Secret {
    return parseResponseHelper(SecretSchema, rawResponse)
  }
}
