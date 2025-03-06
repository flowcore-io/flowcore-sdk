import type { ClientError } from "../exceptions/client-error.ts"
import type { FlowcoreClient } from "./flowcore-client.ts"

/**
 * Abstract command for executing requests
 */
export abstract class Command<Input, Output> {
  /**
   * Whether the command should retry on failure
   */
  protected readonly retryOnFailure: boolean = true

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
  // deno-lint-ignore require-await
  public async getRequest(_client: FlowcoreClient): Promise<{
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
      baseUrl: this.getBaseUrl(),
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
