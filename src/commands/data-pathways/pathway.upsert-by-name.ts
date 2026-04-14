import { Command } from "../../common/command.ts"
import type { PathwayConfig, VirtualConfig } from "../../contracts/data-pathways.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { Static, TLiteral, TObject, TString, TUnion } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"

type TUpsertResponse = TObject<{
  pathwayId: TString
  status: TUnion<[TLiteral<"created">, TLiteral<"updated">]>
}>

export const DataPathwayUpsertByNameResponseSchema: TUpsertResponse = Type.Object({
  pathwayId: Type.String(),
  status: Type.Union([Type.Literal("created"), Type.Literal("updated")]),
})
export type DataPathwayUpsertByNameResponse = Static<typeof DataPathwayUpsertByNameResponseSchema>

export interface DataPathwayUpsertByNameInput {
  name: string
  tenant: string
  dataCore: string
  sizeClass?: "small" | "medium" | "high"
  enabled?: boolean
  labels?: Record<string, string>
  type?: "managed" | "virtual"
  config?: PathwayConfig
  virtualConfig?: VirtualConfig
}

export class DataPathwayUpsertByNameCommand
  extends Command<DataPathwayUpsertByNameInput, DataPathwayUpsertByNameResponse> {
  protected override retryOnFailure: boolean = false
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

  protected override getMethod(): string {
    return "PUT"
  }

  protected override getBaseUrl(): string {
    return "https://data-pathways.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/pathways/by-name/${encodeURIComponent(this.input.name)}`
  }

  protected override getBody(): Record<string, unknown> {
    const { name: _name, ...payload } = this.input
    return payload
  }

  protected override parseResponse(rawResponse: unknown): DataPathwayUpsertByNameResponse {
    return parseResponseHelper(DataPathwayUpsertByNameResponseSchema, rawResponse)
  }
}
