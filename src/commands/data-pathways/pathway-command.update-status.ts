import { Command } from "../../common/command.ts"
import { type DataPathwayCommandResponse, DataPathwayCommandResponseSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCommandUpdateStatusByPathwayInput {
  pathwayId: string
  commandId: string
  phase: "acknowledged" | "restarting" | "running" | "failed" | "timedOut"
  details?: string
}

/**
 * Update command status for a virtual pathway callback. Mirrors the
 * assignment-scoped `command.update-status` endpoint but for virtual pathways
 * that report completion by pathwayId.
 */
export class DataPathwayCommandUpdateStatusByPathwayCommand
  extends Command<DataPathwayCommandUpdateStatusByPathwayInput, DataPathwayCommandResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer", "apiKey"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/${this.input.commandId}/status`
  }

  protected override getBody(): Record<string, unknown> {
    const { pathwayId: _pathwayId, commandId: _commandId, ...payload } = this.input
    return payload
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayCommandResponse {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayCommand", {
        pathwayId: this.input.pathwayId,
        commandId: this.input.commandId,
      })
    }
    throw error
  }
}
