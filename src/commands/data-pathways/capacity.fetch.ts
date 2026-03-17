import { Command } from "../../common/command.ts"
import { type DataPathwayCapacity, DataPathwayCapacitySchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export type DataPathwayCapacityFetchInput = Record<string, never>

export class DataPathwayCapacityFetchCommand extends Command<DataPathwayCapacityFetchInput, DataPathwayCapacity> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/capacity`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayCapacity {
    return parseResponseHelper(DataPathwayCapacitySchema, rawResponse)
  }
}
