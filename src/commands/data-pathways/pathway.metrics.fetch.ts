import { Command } from "../../common/command.ts"
import { type DataPathwayMetrics, DataPathwayMetricsSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayMetricsFetchInput {
  id: string
}

export class DataPathwayMetricsFetchCommand extends Command<DataPathwayMetricsFetchInput, DataPathwayMetrics> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.id}/metrics`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayMetrics {
    return parseResponseHelper(DataPathwayMetricsSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.id })
    }
    throw error
  }
}
