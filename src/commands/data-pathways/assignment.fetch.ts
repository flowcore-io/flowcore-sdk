import { Command } from "../../common/command.ts"
import { type DataPathwayAssignment, DataPathwayAssignmentSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayAssignmentFetchInput {
  id: string
}

export class DataPathwayAssignmentFetchCommand extends Command<DataPathwayAssignmentFetchInput, DataPathwayAssignment> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/assignments/${this.input.id}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayAssignment {
    return parseResponseHelper(DataPathwayAssignmentSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.id })
    }
    throw error
  }
}
