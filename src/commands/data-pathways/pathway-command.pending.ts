import { Command } from "../../common/command.ts"
import { type DataPathwayCommandList, DataPathwayCommandListSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCommandPendingByPathwayInput {
  pathwayId: string
}

/**
 * Fetch pending commands for a virtual pathway. Mirrors the assignment-scoped
 * `command.pending` endpoint but for virtual pathways that poll by pathwayId.
 */
export class DataPathwayCommandPendingByPathwayCommand
  extends Command<DataPathwayCommandPendingByPathwayInput, DataPathwayCommandList> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer", "apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/pending`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayCommandList {
    return parseResponseHelper(DataPathwayCommandListSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.pathwayId })
    }
    throw error
  }
}
