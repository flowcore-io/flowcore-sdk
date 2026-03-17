import { Command } from "../../common/command.ts"
import {
  type DataPathwayExpireLeasesResponse,
  DataPathwayExpireLeasesResponseSchema,
} from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export type DataPathwayAssignmentExpireLeasesInput = Record<string, never>

export class DataPathwayAssignmentExpireLeasesCommand
  extends Command<DataPathwayAssignmentExpireLeasesInput, DataPathwayExpireLeasesResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/assignments/expire-leases`
  }

  protected override getBody(): Record<string, unknown> | undefined {
    return undefined
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayExpireLeasesResponse {
    return parseResponseHelper(DataPathwayExpireLeasesResponseSchema, rawResponse)
  }
}
