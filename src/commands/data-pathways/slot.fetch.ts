import { Command } from "../../common/command.ts"
import { type DataPathwaySlot, DataPathwaySlotSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwaySlotFetchInput {
  id: string
}

export class DataPathwaySlotFetchCommand extends Command<DataPathwaySlotFetchInput, DataPathwaySlot> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/slots/${this.input.id}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwaySlot {
    return parseResponseHelper(DataPathwaySlotSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwaySlot", { id: this.input.id })
    }
    throw error
  }
}
