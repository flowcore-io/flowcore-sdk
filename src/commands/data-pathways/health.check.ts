import { Command } from "../../common/command.ts"
import { type DataPathwayHealth, DataPathwayHealthSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export type DataPathwayHealthCheckInput = Record<string, never>

export class DataPathwayHealthCheckCommand extends Command<DataPathwayHealthCheckInput, DataPathwayHealth> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return "/api/v1/health"
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayHealth {
    return parseResponseHelper(DataPathwayHealthSchema, rawResponse)
  }
}
