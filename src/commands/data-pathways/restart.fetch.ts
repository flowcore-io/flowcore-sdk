import { Command } from "../../common/command.ts"
import { type DataPathwayRestartRequest, DataPathwayRestartRequestSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayRestartFetchInput {
  id: string
}

export class DataPathwayRestartFetchCommand extends Command<DataPathwayRestartFetchInput, DataPathwayRestartRequest> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/restarts/${this.input.id}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayRestartRequest {
    return parseResponseHelper(DataPathwayRestartRequestSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayRestartRequest", { id: this.input.id })
    }
    throw error
  }
}
