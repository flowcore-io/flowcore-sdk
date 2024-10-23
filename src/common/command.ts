import type { TSchema } from "@sinclair/typebox"

export abstract class Command<Input, Output> {
  protected readonly input: Input
  private output?: Output

  constructor(input: Input) {
    this.output = undefined
    this.input = input
  }

  protected abstract schema: TSchema

  protected getPath(): string {
    return "/"
  }

  protected getBody(): string {
    return JSON.stringify(this.input)
  }

  protected getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
    }
  }

  protected abstract parseResponse(response: unknown): Output

  public getRequest(): {
    body: string
    headers: Record<string, string>
    path: string
    // deno-lint-ignore no-explicit-any
    parseResponse: (response: unknown) => any
  } {
    return {
      body: this.getBody(),
      headers: this.getHeaders(),
      path: this.getPath(),
      parseResponse: this.parseResponse,
    }
  }
}
