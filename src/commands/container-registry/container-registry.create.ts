import { Command } from "../../common/command.ts"
import { type ContainerRegistry, ContainerRegistrySchema } from "../../contracts/container.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface ContainerRegistryCreateInput {
  /** The tenant id to add the container registry to*/
  organizationId: string
  /** The name of the container registry */
  name: string
  /**A description of the container registry */
  description?: string
  /** The URL of the container registry */
  registryUrl: string
  /** The username to authenticate with the container registry */
  username?: string
  /** The password to authenticate with the container registry */
  password?: string
}

export class ContainerRegistryCreateCommand extends Command<ContainerRegistryCreateInput, ContainerRegistry> {
  /**
   * Allowed methods of the command
   */

  /**
   * GET the method
   */
  protected override getMethod(): string {
    return "POST"
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
    return `/api/v1/container`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(response: unknown): ContainerRegistry {
    return parseResponseHelper(ContainerRegistrySchema, response)
  }
}
