import { Command } from "../../common/command.ts"

/**
 * The input for the reset adapter command
 */
export interface ResetAdapterInput {
  /** The adapter ID to reset */
  adapterId: string
  /** The tenant name */
  tenant: string
  /** The time bucket to reset from (format: YYYYMMDDhhiiss) */
  timeBucket?: string
  /** The event ID to reset from */
  eventId?: string
  /** The reason for resetting the adapter */
  reason?: string
}

export interface ResetAdapterResponse {
  /** Whether the reset was successful */
  success: boolean
  /** A message describing the result */
  message: string
}

/**
 * Reset an adapter
 */
export class ResetAdapterCommand extends Command<ResetAdapterInput, ResetAdapterResponse> {
  /**
   * The dedicated subdomain for the command
   */
  protected override dedicatedSubdomain = "logs"

  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = true

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
    return "https://logs.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return "/api/v1/pods/reset"
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ResetAdapterResponse {
    return rawResponse as ResetAdapterResponse
  }
}
