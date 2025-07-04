import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Secret, SecretSchema } from "../../contracts/secret.ts"
import { Type } from "@sinclair/typebox"

/**
 * The input for the secret list command
 */
export interface SecretListInput {
  /** The tenant id */
  tenantId: string
}

/**
 * List secrets
 */
export class SecretListCommand extends Command<SecretListInput, Secret[]> {
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
    return `/api/v1/tenants/${this.input.tenantId}/secrets`
  }

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Secret[] {
    return parseResponseHelper(Type.Array(SecretSchema), rawResponse)
  }
}
