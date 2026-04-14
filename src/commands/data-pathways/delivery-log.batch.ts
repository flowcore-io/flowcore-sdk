import { Command } from "../../common/command.ts"
import {
  type DataPathwayDeliveryLogBatchEntry,
  type DataPathwayDeliveryLogBatchResponse,
  DataPathwayDeliveryLogBatchResponseSchema,
} from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayDeliveryLogBatchInput {
  entries: DataPathwayDeliveryLogBatchEntry[]
}

export class DataPathwayDeliveryLogBatchCommand
  extends Command<DataPathwayDeliveryLogBatchInput, DataPathwayDeliveryLogBatchResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "POST"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return "/api/v1/delivery-log/batch"
  }

  protected override getBody(): Record<string, unknown> {
    return { entries: this.input.entries }
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayDeliveryLogBatchResponse {
    return parseResponseHelper(DataPathwayDeliveryLogBatchResponseSchema, rawResponse)
  }
}
