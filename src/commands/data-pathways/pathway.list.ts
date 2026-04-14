import { Command } from "../../common/command.ts"
import { type DataPathwayList, DataPathwayListSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayListInput {
  tenant?: string
  sizeClass?: "small" | "medium" | "high"
  type?: "managed" | "virtual"
  enabled?: boolean
  priority?: number
  limit?: number
  offset?: number
  sort?: "asc" | "desc"
}

export class DataPathwayListCommand extends Command<DataPathwayListInput, DataPathwayList> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    if (this.input.tenant) queryParams.set("tenant", this.input.tenant)
    if (this.input.sizeClass) queryParams.set("sizeClass", this.input.sizeClass)
    if (this.input.type) queryParams.set("type", this.input.type)
    if (this.input.enabled !== undefined) queryParams.set("enabled", String(this.input.enabled))
    if (this.input.priority !== undefined) queryParams.set("priority", String(this.input.priority))
    if (this.input.limit !== undefined) queryParams.set("limit", String(this.input.limit))
    if (this.input.offset !== undefined) queryParams.set("offset", String(this.input.offset))
    if (this.input.sort) queryParams.set("sort", this.input.sort)
    const qs = queryParams.toString()
    return `/api/v1/pathways${qs ? `?${qs}` : ""}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayList {
    return parseResponseHelper(DataPathwayListSchema, rawResponse)
  }
}
