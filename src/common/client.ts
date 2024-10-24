import { ClientError } from "../exceptions/client-error.ts"
import type { Command } from "./command.ts"

/**
 * The options for the client
 */
export interface ClientOptions {
  /**
   * The function to get the auth token
   */
  getAuthToken?: () => Promise<string> | string
}

/**
 * A base client for executing commands
 */
export class Client {
  /**
   * The function to get the auth token
   */
  private readonly getAuthToken?: () => Promise<string> | string

  constructor(options: ClientOptions = {}) {
    this.getAuthToken = options.getAuthToken
  }

  /**
   * Execute a command
   */
  async execute<Input, Output>(command: Command<Input, Output>): Promise<Output> {
    const request = command.getRequest()
    const authToken = await this.getAuthToken?.()
    const response = await fetch(request.baseUrl + request.path, {
      method: "POST",
      headers: {
        ...request.headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: request.body,
    })
    if (!response.ok) {
      throw new ClientError(response.statusText, response.status)
    }
    const body = await response.json()
    return request.parseResponse(body) as Output
  }
}
