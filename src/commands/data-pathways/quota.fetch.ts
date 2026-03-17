import { Command } from "../../common/command.ts"
import { type DataPathwayQuotaWithUsage, DataPathwayQuotaWithUsageSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayQuotaFetchInput {
  tenant: string
}

export class DataPathwayQuotaFetchCommand extends Command<DataPathwayQuotaFetchInput, DataPathwayQuotaWithUsage> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/quotas/${this.input.tenant}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayQuotaWithUsage {
    return parseResponseHelper(DataPathwayQuotaWithUsageSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayQuota", { tenant: this.input.tenant })
    }
    throw error
  }
}
