import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type FlowType, FlowTypeSchema } from "../../contracts/flow-type.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ClientError } from "../../exceptions/client-error.ts"

/**
 * The input for the flow type fetch by name command
 */
type FlowTypeFetchByNameInput = {
  /** The id of the data core */
  dataCoreId: string
  /** The name of the flow type */
  flowType: string
  /** The id of the flow type */
  flowTypeId?: never
}

/**
 * The input for the flow type fetch by id command
 */
type FlowTypeFetchByIdInput = {
  /** The id of the flow type */
  flowTypeId: string
  /** The id of the data core */
  dataCoreId?: never
  /** The name of the flow type */
  flowType?: never
}

/**
 * The input for the flow type fetch command
 */
export type FlowTypeFetchInput = FlowTypeFetchByIdInput | FlowTypeFetchByNameInput

/**
 * Fetch a flow type
 */
export class FlowTypeFetchCommand extends Command<FlowTypeFetchInput, FlowType> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://flow-type-2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    if ("flowTypeId" in this.input) {
      return `/api/v1/flow-types/${this.input.flowTypeId}`
    }
    const queryParams = new URLSearchParams()
    queryParams.set("dataCoreId", this.input.dataCoreId)
    queryParams.set("name", this.input.flowType)
    return `/api/v1/flow-types?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): FlowType {
    if ("flowTypeId" in this.input) {
      const response = parseResponseHelper(FlowTypeSchema, rawResponse)
      return response
    }
    const response = parseResponseHelper(Type.Array(FlowTypeSchema), rawResponse)
    if (response.length === 0) {
      throw new NotFoundException("FlowType", { name: this.input.flowType })
    }
    return response[0]
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("FlowType", {
        [this.input.flowTypeId ? "id" : "name"]: this.input.flowTypeId ?? this.input.flowType,
      })
    }
    throw error
  }
}
