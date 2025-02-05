import { type ContainerRegistry, ContainerRegistrySchema } from "../../contracts/container.ts"
import { Command, parseResponseHelper } from "../../mod.ts"

export interface ContainerRegistryFetchByIdInput {
  /** The id of container */
  containerId: string
}

export class ContainerRegistryFetchById extends Command<ContainerRegistryFetchByIdInput, ContainerRegistry> {
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
