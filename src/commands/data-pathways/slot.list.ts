import { Command } from "../../common/command.ts"
import { type DataPathwaySlotList, DataPathwaySlotListSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwaySlotListInput {
  class?: "small" | "medium" | "high"
  limit?: number
  offset?: number
  sort?: "asc" | "desc"
}

export class DataPathwaySlotListCommand extends Command<DataPathwaySlotListInput, DataPathwaySlotList> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    if (this.input.class) queryParams.set("class", this.input.class)
    if (this.input.limit !== undefined) queryParams.set("limit", String(this.input.limit))
    if (this.input.offset !== undefined) queryParams.set("offset", String(this.input.offset))
    if (this.input.sort) queryParams.set("sort", this.input.sort)
    const qs = queryParams.toString()
    return `/api/v1/slots${qs ? `?${qs}` : ""}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwaySlotList {
    return parseResponseHelper(DataPathwaySlotListSchema, rawResponse)
  }
}
