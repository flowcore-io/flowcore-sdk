import { Command } from "../../common/command.ts"
import {
  type DataPathwaySlotMutationResponse,
  DataPathwaySlotMutationResponseSchema,
} from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwaySlotHeartbeatInput {
  id: string
}

export class DataPathwaySlotHeartbeatCommand
  extends Command<DataPathwaySlotHeartbeatInput, DataPathwaySlotMutationResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/slots/${this.input.id}/heartbeat`
  }

  protected override getBody(): Record<string, unknown> {
    return {}
  }

  protected override parseResponse(rawResponse: unknown): DataPathwaySlotMutationResponse {
    return parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwaySlot", { id: this.input.id })
    }
    throw error
  }
}
