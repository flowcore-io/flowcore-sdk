import { Command } from "../../common/command.ts"
import { type ContainerRegistryList, ContainerRegistryListSchema } from "../../contracts/container.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface ContainerRegistryFetchTenantInput {
  /** The tenant id */
  tenantId: string
}

export class ContainerRegistListCommand extends Command<ContainerRegistryFetchTenantInput, ContainerRegistryList> {
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
    return `/api/v1/container/tenants/${this.input.tenantId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(response: unknown): ContainerRegistryList {
    return parseResponseHelper(ContainerRegistryListSchema, response)
  }
}
