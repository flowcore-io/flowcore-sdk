import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import {
  type DataPathwayPumpStatus,
  DataPathwayPumpStatusSchema,
} from "../../contracts/data-pathways.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

export interface FetchPumpStatusInput {
  pathwayId: string
}

export class FetchPumpStatusCommand extends Command<FetchPumpStatusInput, DataPathwayPumpStatus> {
  protected override retryOnFailure: boolean = true
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer", "apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.pathwayId}/pump-status`
  }

  protected override getBody(): Record<string, unknown> | undefined {
    return undefined
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayPumpStatus {
    return parseResponseHelper(DataPathwayPumpStatusSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Pathway", { pathwayId: this.input.pathwayId })
    }
    throw error
  }
}
