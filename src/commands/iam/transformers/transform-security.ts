import { Command, parseResponseHelper } from "@flowcore/sdk"
import { type TransformerResponse, TransformerResponseSchema } from "./transform-iam.ts"

/**
 * The input for the security transformer command
 */
export interface SecurityTransformerInput {
  /** The event ID */
  eventId: string
  /** The aggregator */
  aggregator: string
  /** The event type */
  eventType: string
  /** The valid time (ISO format) */
  validTime: string
  /** The payload */
  payload: unknown
  /** The metadata */
  metadata?: Record<string, unknown>
  /** The secret for authentication */
  secret: string
}

/**
 * Transform security data
 */
export class SecurityTransformerCommand extends Command<
  SecurityTransformerInput,
  TransformerResponse
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

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
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return "/transformers/security.0"
  }

  /**
   * Get the headers
   */
  protected override getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      "x-secret": this.input.secret,
    }
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> {
    // deno-lint-ignore no-unused-vars
    const { secret, ...rest } = this.input
    return rest
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TransformerResponse {
    return parseResponseHelper(TransformerResponseSchema, rawResponse)
  }
}
