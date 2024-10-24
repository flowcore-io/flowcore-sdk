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
   * Get the path for the request
   */
  protected getPath(): string {
    return "/"
  }

  /**
   * Get the body for the request
   */
  protected getBody(): string {
    return JSON.stringify(this.input)
  }

  /**
   * Get the headers for the request
   */
  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
    }
  }

  /**
   * Parse the response
   */
  protected abstract parseResponse(response: unknown): Output

  /**
   * Get the request object
   */
  public getRequest(): {
    body: string
    headers: Record<string, string>
    baseUrl: string
    path: string
    parseResponse: (response: unknown) => Output
  } {
    return {
      body: this.getBody(),
      headers: this.getHeaders(),
      baseUrl: this.getBaseUrl(),
      path: this.getPath(),
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
