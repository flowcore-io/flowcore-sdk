import { Command } from "../../common/command.ts"

export interface DataPathwayAssignmentCompleteInput {
  slotId: string
  assignmentId: string
  pathwayId: string
  outcome: "completed" | "failed" | "revoked"
}

export class DataPathwayAssignmentCompleteCommand extends Command<DataPathwayAssignmentCompleteInput, null> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "POST"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/assignments/complete`
  }

  // deno-lint-ignore no-unused-vars
  protected override parseResponse(rawResponse: unknown): null {
    return null
  }
}
