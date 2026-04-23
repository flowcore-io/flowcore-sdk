import { Command } from "../../common/command.ts"
import {
  type DataPathwayPumpStateBySource,
  DataPathwayPumpStateBySourceSchema,
} from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayPumpStateFetchBySourceInput {
  pathwayId: string
  sourceId: string
}

export class DataPathwayPumpStateFetchBySourceCommand
  extends Command<DataPathwayPumpStateFetchBySourceInput, DataPathwayPumpStateBySource> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pump-states/${this.input.pathwayId}/sources/${this.input.sourceId}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayPumpStateBySource {
    return parseResponseHelper(DataPathwayPumpStateBySourceSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayPumpState", {
        pathwayId: this.input.pathwayId,
        sourceId: this.input.sourceId,
      })
    }
    throw error
  }
}
