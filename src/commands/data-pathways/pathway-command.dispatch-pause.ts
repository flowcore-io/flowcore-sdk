import { Command } from "../../common/command.ts"
import { type DataPathwayCommandResponse, DataPathwayCommandResponseSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayCommandDispatchPauseInput {
  pathwayId: string
  /**
   * What to pause. Each entry is either a bare flow type (`"orders.0"`, every pump group
   * on it) or a composite `"orders.0::hot"` naming exactly one pump. Omit to pause every
   * pump.
   *
   * A composite target is rejected with 409 unless the pathway advertised composite
   * entries in `virtualConfig.flowTypes`. An older consumer compares targets against flow
   * type names only, so it would match nothing and pause nothing.
   */
  targets?: string[]
  reason?: string
  requestedBy?: string
  timeoutMs?: number
}

/**
 * Pause delivery on a virtual pathway.
 *
 * Delivery to the consumer's handlers stops while its pump keeps fetching, keeps its
 * buffer and keeps its cursor. The desired state is recorded on the pathway, so a
 * consumer that restarts comes back paused at the same position.
 *
 * This is NOT `disable`. Disabling a virtual pathway deletes its API key, and a later
 * enable resets the cursor to latest.
 */
export class DataPathwayCommandDispatchPauseCommand extends Command<
  DataPathwayCommandDispatchPauseInput,
  DataPathwayCommandResponse
> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/pause`
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
