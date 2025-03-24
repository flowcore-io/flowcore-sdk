import { TenantFetchCommand } from "../commands/tenant/tenant.fetch.ts"
import type { ClientError } from "../exceptions/client-error.ts"
import { CommandError } from "../exceptions/command-error.ts"
import type { FlowcoreClient } from "./flowcore-client.ts"
import { tenantCache } from "./tenant.cache.ts"

/**
 * Abstract command for executing requests
 */
export abstract class Command<Input, Output> {
  /**
   * Whether the command should retry on failure
   */
  protected readonly retryOnFailure: boolean = true

  /**
   * The dedicated subdomain for the command
   */
  protected readonly dedicatedSubdomain?: string

  /**
   * The allowed modes for the command
   */
  protected readonly allowedModes: ("apiKey" | "bearer")[] = ["apiKey", "bearer"]

  /**
   * The input for the command
   */
  protected readonly input: Input

  constructor(input: Input) {
    /**
     * The input for the command
     */
    this.input = input
  }

  /**
   * Get the dedicated base URL
   */
  protected async getDedicatedBaseUrl(client: FlowcoreClient): Promise<string | null> {
    if (!this.dedicatedSubdomain) {
      return null
    }

    const inputTenant = typeof this.input === "object" && this.input !== null && "tenant" in this.input &&
      typeof this.input.tenant === "string" && this.input.tenant

    if (!inputTenant) {
      return null
    }

    let tenant = tenantCache.get(inputTenant)
    if (!tenant) {
      tenant = await client.execute(new TenantFetchCommand({ tenant: inputTenant }))
      tenantCache.set(inputTenant, tenant)
    }

    if (!tenant.isDedicated) {
      return null
    }

    if (!tenant.dedicated?.configuration.domain) {
      throw new CommandError(this.constructor.name, `Tenant ${inputTenant} does not have a dedicated domain configured`)
    }

    return `https://${this.dedicatedSubdomain}.${tenant.dedicated.configuration.domain}`
  }

  /**
   * Get the base URL for the request
   */
  protected abstract getBaseUrl(): string

  /**
   * Get the method for the request
   */
  protected getMethod(): string {
    return "POST"
  }

  /**
   * Get the path for the request
   */
  protected getPath(): string {
    return "/"
  }

  /**
   * Get the body for the request
   */
  protected getBody(): Record<string, unknown> | Array<unknown> | undefined {
    if (this.getMethod() === "GET") {
      return undefined
    }
    return this.input ?? undefined
  }

  /**
   * Get the headers for the request
   */
  protected getHeaders(): Record<string, string> {
    return typeof this.getBody() === "object"
      ? {
        "Content-Type": "application/json",
      }
      : {}
  }

  /**
   * Parse the response
   */
  protected abstract parseResponse(response: unknown): Output

  /**
   * Handle the client error
   */
  protected handleClientError(error: ClientError): void {
    throw error
  }

  /**
   * Get the request object
   */
  public async getRequest(client: FlowcoreClient): Promise<{
    allowedModes: ("apiKey" | "bearer")[]
    body: string | Record<string, unknown> | Array<unknown> | undefined
    headers: Record<string, string>
    baseUrl: string
    path: string
    method: string
    parseResponse: (response: unknown) => Output | Promise<Output>
    processResponse: (client: FlowcoreClient, response: Output) => Promise<Output>
    handleClientError: (error: ClientError) => void
    retryOnFailure: boolean
    customExecute?: (client: FlowcoreClient) => Promise<unknown>
  }> {
    return {
      allowedModes: this.allowedModes,
      body: this.getBody(),
      headers: this.getHeaders(),
      baseUrl: (await this.getDedicatedBaseUrl(client)) ?? this.getBaseUrl(),
      path: this.getPath(),
      method: this.getMethod(),
      parseResponse: this.parseResponse.bind(this),
      processResponse: this.processResponse.bind(this),
      handleClientError: this.handleClientError.bind(this),
      retryOnFailure: this.retryOnFailure,
    }
  }

  /**
   * Wait for the response
   */
  // deno-lint-ignore require-await
  protected async processResponse(_client: FlowcoreClient, response: Output): Promise<Output> {
    return response
  }
}
