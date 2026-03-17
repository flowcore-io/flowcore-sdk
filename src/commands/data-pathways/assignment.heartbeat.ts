import { Command } from "../../common/command.ts"

export interface DataPathwayAssignmentHeartbeatInput {
  slotId: string
  assignmentId: string
  pathwayId: string
  metrics: {
    eventsFetchedTotal?: number
    eventsDeliveredTotal?: number
    deliveryErrorsTotal?: number
    bufferDepth?: number
    lagSeconds?: number
  }
}

export class DataPathwayAssignmentHeartbeatCommand extends Command<DataPathwayAssignmentHeartbeatInput, null> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/assignments/heartbeat`
  }

  // deno-lint-ignore no-unused-vars
  protected override parseResponse(rawResponse: unknown): null {
    return null
  }
}
