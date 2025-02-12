import { type ContainerRegistryDelete, ContainerRegistryDeleteSchema } from "../../contracts/container.ts"
import { Command, parseResponseHelper } from "../../mod.ts"

export interface ContainerRegistryDeleteInput {
  /** The id of the new container-registry */
  containerId: string
}

export class ContainerRegistryDeleteCommand extends Command<ContainerRegistryDeleteInput, ContainerRegistryDelete> {
  protected override getMethod(): string {
    return "DELETE"
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
  protected override parseResponse(response: unknown): ContainerRegistryDelete {
    console.log(response)
    return parseResponseHelper(ContainerRegistryDeleteSchema, response)
  }
}
