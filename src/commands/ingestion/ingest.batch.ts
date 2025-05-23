import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import type { IngestEventInput } from "../../contracts/event.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface IngestBatchInput<T extends unknown> extends Omit<IngestEventInput<T>, "eventData"> {
  events: IngestEventInput<T>["eventData"][]
}

/**
 * The output for the batch ingestion command
 */
export interface IngestBatchOutput {
  /** the events */
  eventIds: string[]
  /** success status */
  success: boolean
}

/**
 * The response schema for the batch ingestion command
 */
const responseSchema = Type.Object({
  eventIds: Type.Array(Type.String()),
  success: Type.Boolean(),
})

/**
 * Ingest a batch of events
 */
export class IngestBatchCommand<T extends unknown> extends Command<IngestBatchInput<T>, IngestBatchOutput> {
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
    const authHeader = this.clientAuthOptions.apiKey || null

    return {
      "Content-Type": "application/json",
      ...(this.input.flowcoreManaged && { "X-Flowcore-Managed": "true" }),
      ...(metadata && { "x-flowcore-metadata-json": btoa(JSON.stringify(metadata)) }),
      ...(this.input.eventTime && { "x-flowcore-event-time": this.input.eventTime }),
      ...(this.input.validTime && { "x-flowcore-valid-time": this.input.validTime }),
      ...(authHeader && { "Authorization": authHeader }),
    }
  }

  /**
   * Get the path for the request
   */
  protected override getPath(): string {
    return `/events/${this.input.tenantName}/${this.input.dataCoreId}/${this.input.flowTypeName}/${this.input.eventTypeName}`
  }
  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): IngestBatchOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): unknown[] {
    return this.input.events
  }
}
