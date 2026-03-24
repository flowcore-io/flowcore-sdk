import { Command } from "../../common/command.ts"
import { type DataPathwayDeliveryLogList, DataPathwayDeliveryLogListSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayDeliveryLogListInput {
  pathwayId: string
  success?: boolean
  limit?: number
  offset?: number
  sort?: "asc" | "desc"
}

export class DataPathwayDeliveryLogListCommand
  extends Command<DataPathwayDeliveryLogListInput, DataPathwayDeliveryLogList> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    queryParams.set("pathwayId", this.input.pathwayId)
    if (this.input.success !== undefined) queryParams.set("success", String(this.input.success))
    if (this.input.limit !== undefined) queryParams.set("limit", String(this.input.limit))
    if (this.input.offset !== undefined) queryParams.set("offset", String(this.input.offset))
    if (this.input.sort) queryParams.set("sort", this.input.sort)
    return `/api/v1/delivery-log?${queryParams}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayDeliveryLogList {
    return parseResponseHelper(DataPathwayDeliveryLogListSchema, rawResponse)
  }
}
