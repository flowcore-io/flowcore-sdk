import { Command } from "../../common/command.ts"
import {
  type DataPathwaySlotMutationResponse,
  DataPathwaySlotMutationResponseSchema,
} from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwaySlotRegisterInput {
  slotId: string
  podUnitId: string
  class: "small" | "medium" | "high"
  version: string
  labels?: Record<string, string>
}

export class DataPathwaySlotRegisterCommand
  extends Command<DataPathwaySlotRegisterInput, DataPathwaySlotMutationResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/slots/register`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwaySlotMutationResponse {
    return parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse)
  }
}
