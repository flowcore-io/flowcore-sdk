import { Command } from "../../common/command.ts"
import { type DataPathwayCommandList, DataPathwayCommandListSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCommandPendingInput {
  assignmentId: string
}

export class DataPathwayCommandPendingCommand extends Command<DataPathwayCommandPendingInput, DataPathwayCommandList> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/assignments/${this.input.assignmentId}/commands/pending`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayCommandList {
    return parseResponseHelper(DataPathwayCommandListSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId })
    }
    throw error
  }
}
