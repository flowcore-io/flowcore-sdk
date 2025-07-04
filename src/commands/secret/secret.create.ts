import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Secret, SecretSchema } from "../../contracts/secret.ts"

/**
 * The input for the secret create command
 */
export interface SecretCreateInput {
  /** The tenant id */
  tenantId: string
  /** The key of the secret */
  key: string
  /** The value of the secret */
  value: string
  /** The description of the secret */
  description?: string
}

/**
 * Create a secret
 */
export class SecretCreateCommand extends Command<SecretCreateInput, Secret> {
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
    return `/api/v1/tenants/${this.input.tenantId}/secrets`
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
