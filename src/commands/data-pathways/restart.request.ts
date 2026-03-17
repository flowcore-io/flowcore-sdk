import { Command } from "../../common/command.ts"
import {
  type DataPathwayRestartRequestResponse,
  DataPathwayRestartRequestResponseSchema,
} from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayRestartRequestInput {
  targets: {
    flowTypes?: string[]
    pathwayIds?: string[]
    selector?: {
      tenant?: string
      labels?: Record<string, string>
    }
  }
  mode?: "datapumpRestart" | "hardReset"
  position: {
    timeBucket?: string
    eventId?: string
  }
  stopAt?: string | null
  timeoutMs?: number
  requestedBy: string
  reason?: string
}

export class DataPathwayRestartRequestCommand
  extends Command<DataPathwayRestartRequestInput, DataPathwayRestartRequestResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/restarts/request`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayRestartRequestResponse {
    return parseResponseHelper(DataPathwayRestartRequestResponseSchema, rawResponse)
  }
}
