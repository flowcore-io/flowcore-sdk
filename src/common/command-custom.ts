import type { FlowcoreClient } from "./flowcore-client.ts"
import { Command } from "./command.ts"
import type { ClientError } from "../exceptions/client-error.ts"

/**
 * Abstract command for executing custom requests
 */
export abstract class CustomCommand<Input, Output> extends Command<Input, Output> {
  /**
   * Get the base URL for the request
   */
  protected override getBaseUrl(): string {
    return "NONE"
  }

  /**
   * Custom execute method
   */
  protected abstract customExecute(client: FlowcoreClient): Promise<Output>

  /**
   * Get the request object
   */
  public override async getRequest(client: FlowcoreClient, direct?: boolean): Promise<{
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
    customExecute: (client: FlowcoreClient) => Promise<Output>
  }> {
    // `super.getRequest` is async: spreading it without awaiting yields NONE
    // of its keys (a Promise has no own enumerable properties), so the
    // returned object used to carry `customExecute` alone.
    return {
      ...(await super.getRequest(client, direct)),
      customExecute: this.customExecute.bind(this),
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(response: unknown): Output {
    return response as Output
  }
}
