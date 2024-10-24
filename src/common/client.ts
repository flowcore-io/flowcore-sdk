import { ClientError } from "../exceptions/client-error.ts"
import type { Command } from "./command.ts"

export interface ClientOptions {
  baseUrl?: string
  getAuthToken?: () => Promise<string> | string
}

/**
 * A base client for executing commands
 */
export class Client {
  private readonly getAuthToken?: () => Promise<string> | string

  constructor(options: ClientOptions = {}) {
    this.getAuthToken = options.getAuthToken
  }

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
