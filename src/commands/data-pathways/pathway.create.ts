import { Command } from "../../common/command.ts"
import {
  type DataPathwayMutationResponse,
  DataPathwayMutationResponseSchema,
  type PathwayConfig,
} from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCreateInput {
  id: string
  tenant: string
  dataCore: string
  sizeClass: "small" | "medium" | "high"
  enabled?: boolean
  priority?: number
  version?: number
  labels?: Record<string, string>
  config?: PathwayConfig
}

export class DataPathwayCreateCommand extends Command<DataPathwayCreateInput, DataPathwayMutationResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "PUT"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.id}`
  }

  protected override getBody(): Record<string, unknown> {
    const { id: _id, ...payload } = this.input
    return payload
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayMutationResponse {
    return parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse)
  }
}
