import { Command } from "../../common/command.ts"
import { type ContainerRegistry, ContainerRegistrySchema } from "../../contracts/container.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

interface ContainerRegustryUpdateInput {
  /** The id of the container-registry */
  containerId: string
  /** The name of the container-registry */
  name?: string
  /** The description */
  description?: string
  /** The registry url for the container */
  registryUrl?: string
  /** The username for authentication */
  username?: string
}

export class ContainerRegistryUpdateCommand extends Command<ContainerRegustryUpdateInput, ContainerRegistry> {
  protected override getMethod(): string {
    return "PATCH"
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
    //console.log(response)
    return parseResponseHelper(ContainerRegistrySchema, response)
  }
}
