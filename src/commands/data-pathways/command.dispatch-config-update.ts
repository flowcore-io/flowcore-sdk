import { Command } from "../../common/command.ts"
import { type DataPathwayCommandResponse, DataPathwayCommandResponseSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCommandDispatchConfigUpdateInput {
  assignmentId: string
  generation: number
  config: Record<string, unknown>
}

export class DataPathwayCommandDispatchConfigUpdateCommand
  extends Command<DataPathwayCommandDispatchConfigUpdateInput, DataPathwayCommandResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/assignments/${this.input.assignmentId}/commands/config-update`
  }

  protected override getBody(): Record<string, unknown> {
    const { assignmentId: _assignmentId, ...payload } = this.input
    return payload
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayCommandResponse {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId })
    }
    throw error
  }
}
