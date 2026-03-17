import { Command } from "../../common/command.ts"
import { type DataPathwayAssignmentNext, DataPathwayAssignmentNextSchema } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayAssignmentNextInput {
  slotId: string
  class: "small" | "medium" | "high"
}

export class DataPathwayAssignmentNextCommand
  extends Command<DataPathwayAssignmentNextInput, DataPathwayAssignmentNext> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/assignments/next`
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayAssignmentNext {
    return parseResponseHelper(DataPathwayAssignmentNextSchema, rawResponse)
  }
}
