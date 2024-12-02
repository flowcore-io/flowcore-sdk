/**
 * Abstract command for executing requests
 */
export abstract class Command<Input, Output> {
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
  protected abstract parseResponse(response: unknown): Output

  /**
   * Get the request object
   */
  public getRequest(): {
    body: string | undefined
    headers: Record<string, string>
    baseUrl: string
    path: string
    method: string
    parseResponse: (response: unknown) => Output
  } {
    return {
      body: this.getBody(),
      headers: this.getHeaders(),
      baseUrl: this.getBaseUrl(),
      path: this.getPath(),
      method: this.getMethod(),
      parseResponse: this.parseResponse.bind(this),
    }
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
