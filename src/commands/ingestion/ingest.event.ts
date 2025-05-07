import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import type { IngestEventInput } from "../../contracts/event.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The output for the ingest event command
 */
export interface IngestEventOutput {
  /** the events */
  eventId: string
  /** success status */
  success: boolean
}

/**
 * The response schema for the ingest event command
 */
const responseSchema = Type.Object({
  eventId: Type.String(),
  success: Type.Boolean(),
})

/**
 * Ingest an event
 */
export class IngestEventCommand<T extends unknown> extends Command<IngestEventInput<T>, IngestEventOutput> {
  /**
   * The dedicated subdomain for the command
   */
  protected override dedicatedSubdomain: string = "webhook"

  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "POST"
  }

  /**
   * Get the base url for the request
   */
  protected override getBaseUrl(): string {
    if (this.input.tenantName === "flowcore") {
      return "https://flowcore.webhook.flowcore.io"
    }

    return "https://webhook.api.flowcore.io"
  }

  protected override getHeaders(): Record<string, string> {
    const metadata: Record<string, string> | undefined =
      this.input.metadata && Object.keys(this.input.metadata).length > 0 ? this.input.metadata : undefined

    if (metadata && this.input.ttl) {
      metadata["ttl-on/stored-event"] = "true"
    }

    if (metadata && this.input.isEphemeral) {
      metadata["do-not-archive-on/stored-event"] = "true"
    }

    // For legacy ingestion endpoints, use just the API key instead of the "ApiKey {apiKeyId}:{apiKey}" format
    const authHeader = this.clientAuthOptions.apiKey || null;

    return {
      "Content-Type": "application/json",
      ...(metadata && { "x-flowcore-metadata-json": JSON.stringify(metadata) }),
      ...(this.input.eventTime && { "x-flowcore-event-time": this.input.eventTime }),
      ...(this.input.validTime && { "x-flowcore-valid-time": this.input.validTime }),
      ...(authHeader && { "Authorization": authHeader }),
    }
  }

  /**
   * Get the path for the request
   */
  protected override getPath(): string {
    return `/event/${this.input.tenantName}/${this.input.dataCoreId}/${this.input.flowTypeName}/${this.input.eventTypeName}`
  }
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): IngestEventOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return this.input.eventData as Record<string, unknown>
  }
}
