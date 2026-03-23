import { Command } from "../../common/command.ts"
import { type DataPathwayAssignmentList, DataPathwayAssignmentListSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayAssignmentListInput {
  status?: "active" | "completed" | "failed" | "revoked" | "expired"
  slotId?: string
  pathwayId?: string
  limit?: number
  offset?: number
  sort?: "asc" | "desc"
}

export class DataPathwayAssignmentListCommand
  extends Command<DataPathwayAssignmentListInput, DataPathwayAssignmentList> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    if (this.input.status) queryParams.set("status", this.input.status)
    if (this.input.slotId) queryParams.set("slotId", this.input.slotId)
    if (this.input.pathwayId) queryParams.set("pathwayId", this.input.pathwayId)
    if (this.input.limit !== undefined) queryParams.set("limit", String(this.input.limit))
    if (this.input.offset !== undefined) queryParams.set("offset", String(this.input.offset))
    if (this.input.sort) queryParams.set("sort", this.input.sort)
    const qs = queryParams.toString()
    return `/api/v1/assignments${qs ? `?${qs}` : ""}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayAssignmentList {
    return parseResponseHelper(DataPathwayAssignmentListSchema, rawResponse)
  }
}
