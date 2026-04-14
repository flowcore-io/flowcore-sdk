import { Command } from "../../common/command.ts"
import { type DataPathwayCommandDetail, DataPathwayCommandDetailSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCommandFetchInput {
  commandId: string
}

export class DataPathwayCommandFetchCommand extends Command<DataPathwayCommandFetchInput, DataPathwayCommandDetail> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer", "apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/commands/${this.input.commandId}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayCommandDetail {
    return parseResponseHelper(DataPathwayCommandDetailSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayCommand", { commandId: this.input.commandId })
    }
    throw error
  }
}
