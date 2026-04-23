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
    throughput?: {
      global: { eventsPerSecond: number; totalRecorded: number; windowSeconds: number }
      endpoints: Record<
        string,
        {
          eventsPerSecond: number
          successRate: number
          totalDelivered: number
          totalFailed: number
          lastDeliveryAgeMs: number | null
          healthy: boolean
          sources: Record<
            string,
            {
              flowType: string
              name?: string
              eventsPerSecond: number
              successRate: number
              avgDurationMs: number
              totalDelivered: number
              totalFailed: number
              lastDeliveryAgeMs: number | null
              healthy: boolean
              recentResults: Array<{ status: number; durationMs: number; success: boolean; ageMs: number }>
            }
          >
        }
      >
    }
  }
}

export class DataPathwayAssignmentHeartbeatCommand extends Command<DataPathwayAssignmentHeartbeatInput, null> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "POST"
  }

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
