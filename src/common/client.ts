import type { Command } from "./command.ts"

export interface ClientOptions {
  baseUrl?: string
  getAuthToken?: () => Promise<string> | string
}

/**
 * A client for the Flowcore API
 */
export class Client {
  private readonly baseUrl: string
  private readonly getAuthToken?: () => Promise<string> | string

  constructor(options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "https://graph.api.flowcore.io/graphql"
    this.getAuthToken = options.getAuthToken
  }

  async execute<Input, Output>(command: Command<Input, Output>): Promise<Output> {
    const request = command.getRequest()
    const authToken = await this.getAuthToken?.()
    try {
      const response = await fetch(this.baseUrl + request.path, {
        method: "POST",
        headers: {
          ...request.headers,
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: request.body,
      })
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }
      const body = await response.json()
      return request.parseResponse(body)
    } catch (error) {
      throw error
    }
  }
}
