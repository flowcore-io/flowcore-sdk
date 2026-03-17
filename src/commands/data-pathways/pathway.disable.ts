import { Command } from "../../common/command.ts"
import { type DataPathwayMutationResponse, DataPathwayMutationResponseSchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayDisableInput {
  id: string
  reason?: string
}

export class DataPathwayDisableCommand extends Command<DataPathwayDisableInput, DataPathwayMutationResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  protected override getMethod(): string {
    return "POST"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/${this.input.id}/disable`
  }

  protected override getBody(): Record<string, unknown> {
    const { id: _id, ...payload } = this.input
    return payload
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayMutationResponse {
    return parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.id })
    }
    throw error
  }
}
