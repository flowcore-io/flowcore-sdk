import { type ContainerRegistry, ContainerRegistrySchema } from "../../contracts/container.ts"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface ContainerRegistryFetchInput {
  /** The id of container */
  containerId: string
}

export class ContainerRegistryFetchCommand extends Command<ContainerRegistryFetchInput, ContainerRegistry> {
  protected override getMethod(): string {
    return "GET"
  }
  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://registry.api.flowcore.io"
  }
  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/container/${this.input.containerId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(response: unknown): ContainerRegistry {
    return parseResponseHelper(ContainerRegistrySchema, response)
  }
}
