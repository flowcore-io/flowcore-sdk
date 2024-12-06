import type { FlowcoreClient } from "./flowcore-client.ts"

/**
 * Abstract command for executing requests
 */
export abstract class Command<Input, Output> {
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
  protected getBody(): string | undefined {
    if (this.getMethod() === "GET") {
      return undefined
    }
    return this.input ? JSON.stringify(this.input) : undefined
  }

  /**
   * Get the headers for the request
   */
  protected getHeaders(): Record<string, string> {
    return this.getBody()
      ? {
        "Content-Type": "application/json",
      }
      : {}
  }

  /**
   * Parse the response
   */
  protected abstract parseResponse(response: unknown, flowcoreClient: FlowcoreClient): Output | Promise<Output>

  /**
   * Get the request object
   */
  // deno-lint-ignore require-await
  public async getRequest(_client: FlowcoreClient): Promise<{
    allowedModes: ("apiKey" | "bearer")[]
    body: string | undefined
    headers: Record<string, string>
    baseUrl: string
    path: string
    method: string
    parseResponse: (response: unknown, client: FlowcoreClient) => Output | Promise<Output>
    waitForResponse: (client: FlowcoreClient, response: Output) => Promise<Output>
  }> {
    return {
      allowedModes: this.allowedModes,
      body: this.getBody(),
      headers: this.getHeaders(),
      baseUrl: this.getBaseUrl(),
      path: this.getPath(),
      method: this.getMethod(),
      parseResponse: this.parseResponse.bind(this),
      waitForResponse: this.waitForResponse.bind(this),
    }
  }

  /**
   * Wait for the response
   */
  // deno-lint-ignore require-await
  protected async waitForResponse(_client: FlowcoreClient, response: Output): Promise<Output> {
    return response
  }
}

/**
 * Abstract command for executing GraphQL requests
 */
export abstract class GraphQlCommand<Input, Output> extends Command<Input, Output> {
  protected override getBaseUrl(): string {
    return "https://graph.api.flowcore.io/graphql"
  }
}
