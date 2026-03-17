import { Command } from "../../common/command.ts"
import { type DataPathwayQuotaSetResponse, DataPathwayQuotaSetResponseSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayQuotaSetInput {
  tenant: string
  maxSlots: {
    small: number
    medium: number
    high: number
  }
}

export class DataPathwayQuotaSetCommand extends Command<DataPathwayQuotaSetInput, DataPathwayQuotaSetResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "PUT"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/quotas/${this.input.tenant}`
  }

  protected override getBody(): Record<string, unknown> {
    const { tenant: _tenant, ...payload } = this.input
    return payload
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayQuotaSetResponse {
    return parseResponseHelper(DataPathwayQuotaSetResponseSchema, rawResponse)
  }
}
