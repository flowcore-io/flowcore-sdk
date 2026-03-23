import { Command } from "../../common/command.ts"
import { type DataPathwayDeliveryErrorList, DataPathwayDeliveryErrorListSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayDeliveryErrorListInput {
  pathwayId: string
  limit?: number
  offset?: number
  sort?: "asc" | "desc"
}

export class DataPathwayDeliveryErrorListCommand extends Command<DataPathwayDeliveryErrorListInput, DataPathwayDeliveryErrorList> {
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
    if (this.input.limit !== undefined) queryParams.set("limit", String(this.input.limit))
    if (this.input.offset !== undefined) queryParams.set("offset", String(this.input.offset))
    if (this.input.sort) queryParams.set("sort", this.input.sort)
    return `/api/v1/delivery-errors?${queryParams}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayDeliveryErrorList {
    return parseResponseHelper(DataPathwayDeliveryErrorListSchema, rawResponse)
  }
}
