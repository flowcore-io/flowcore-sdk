import { Command } from "../../common/command.ts"
import { type DataPathway, DataPathwaySchema } from "../../contracts/data-pathways.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface DataPathwayFetchByNameInput {
  name: string
  tenant: string
}

export class DataPathwayFetchByNameCommand extends Command<DataPathwayFetchByNameInput, DataPathway> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    const qs = new URLSearchParams({ tenant: this.input.tenant }).toString()
    return `/api/v1/pathways/by-name/${encodeURIComponent(this.input.name)}?${qs}`
  }

  protected override parseResponse(rawResponse: unknown): DataPathway {
    return parseResponseHelper(DataPathwaySchema, rawResponse)
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { name: this.input.name, tenant: this.input.tenant })
    }
    throw error
  }
}
