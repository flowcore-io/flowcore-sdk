import { Command } from "../../common/command.ts"
import { type DataPathwayPumpState, DataPathwayPumpStateSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayPumpStateFetchInput {
  assignmentId: string
}

export class DataPathwayPumpStateFetchCommand extends Command<DataPathwayPumpStateFetchInput, DataPathwayPumpState> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pump-states/${this.input.assignmentId}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayPumpState {
    return parseResponseHelper(DataPathwayPumpStateSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayPumpState", { assignmentId: this.input.assignmentId })
    }
    throw error
  }
}
