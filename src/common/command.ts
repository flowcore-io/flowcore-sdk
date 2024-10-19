import type { Static, TSchema } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"

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

  protected parseResponse<T extends TSchema>(response: unknown): Static<T> {
    if (!Value.Check(this.schema, response)) {
      const errors = Value.Errors(this.schema, response)
      for (const error of errors) {
        console.debug("invalid response", error.path, error.message)
      }
      throw new Error("Invalid response")
    }
    return response as Static<T>
  }

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
