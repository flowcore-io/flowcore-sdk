import { Command } from "../../common/command.ts"
import { type DataPathwayCommandResponse, DataPathwayCommandResponseSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCommandDispatchResumeInput {
  pathwayId: string
  /**
   * What to resume. Same shape as the pause targets: a bare flow type, or a composite
   * `"orders.0::hot"`. Omit to resume every pump.
   */
  targets?: string[]
  reason?: string
  requestedBy?: string
  timeoutMs?: number
}

/**
 * Resume delivery on a virtual pathway, continuing from the exact position where
 * {@link DataPathwayCommandDispatchPauseCommand} stopped it.
 */
export class DataPathwayCommandDispatchResumeCommand extends Command<
  DataPathwayCommandDispatchResumeInput,
  DataPathwayCommandResponse
> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/resume`
  }

  protected override getBody(): Record<string, unknown> {
    const { pathwayId: _pathwayId, ...payload } = this.input
    return payload
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayCommandResponse {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.pathwayId })
    }
  }
}
