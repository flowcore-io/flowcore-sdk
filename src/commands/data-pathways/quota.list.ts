import { Command } from "../../common/command.ts"
import { type DataPathwayQuotaList, DataPathwayQuotaListSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export type DataPathwayQuotaListInput = Record<string, never>

export class DataPathwayQuotaListCommand extends Command<DataPathwayQuotaListInput, DataPathwayQuotaList> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/quotas`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayQuotaList {
    return parseResponseHelper(DataPathwayQuotaListSchema, rawResponse)
  }
}
