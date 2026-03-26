import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type DataPathwayPumpPulseResponse, DataPathwayPumpPulseResponseSchema } from "../../contracts/data-pathways.ts"

export interface SendPumpPulseInput {
  pathwayId: string
  flowType: string
  timeBucket: string
  eventId: string | null
  isLive: boolean
  buffer: {
    depth: number
    reserved: number
    sizeBytes: number
  }
  counters: {
    acknowledged: number
    failed: number
    pulled: number
  }
  uptimeMs: number
}

export class SendPumpPulseCommand extends Command<SendPumpPulseInput, DataPathwayPumpPulseResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "POST"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pump-pulse`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayPumpPulseResponse {
    return parseResponseHelper(DataPathwayPumpPulseResponseSchema, rawResponse)
  }
}
