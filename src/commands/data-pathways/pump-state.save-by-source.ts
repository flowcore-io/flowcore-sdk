import { Command } from "../../common/command.ts"
import {
  type DataPathwayPumpStateSaveResponse,
  DataPathwayPumpStateSaveResponseSchema,
} from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayPumpStateSaveBySourceInput {
  pathwayId: string
  sourceId: string
  state: {
    timeBucket: string
    eventId?: string
  }
}

export class DataPathwayPumpStateSaveBySourceCommand
  extends Command<DataPathwayPumpStateSaveBySourceInput, DataPathwayPumpStateSaveResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "PUT"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pump-states/${this.input.pathwayId}/sources/${this.input.sourceId}`
  }

  protected override getBody(): Record<string, unknown> {
    return { state: this.input.state }
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayPumpStateSaveResponse {
    return parseResponseHelper(DataPathwayPumpStateSaveResponseSchema, rawResponse)
  }
}
