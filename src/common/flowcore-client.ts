import { ClientError } from "../exceptions/client-error.ts"
import type { Command } from "./command.ts"

/**
 * The options for the bearer token
 */
interface ClientOptionsBearer {
  getBearerToken: () => Promise<string> | string
}

/**
 * The options for the api key
 */
interface ClientOptionsApiKey {
  apiKeyId: string
  apiKey: string
}

/**
 * The options for the client
 */
export type ClientOptions = ClientOptionsBearer | ClientOptionsApiKey

/**
 * A base client for executing commands
 */
export class FlowcoreClient {
  constructor(private readonly options: ClientOptions) {}

  /**
   * Get the auth header
   */
  private async getAuthHeader(): Promise<string> {
    if ((this.options as ClientOptionsBearer).getBearerToken) {
      return `Bearer ${await (this.options as ClientOptionsBearer).getBearerToken()}`
    }
    if ((this.options as ClientOptionsApiKey).apiKeyId && (this.options as ClientOptionsApiKey).apiKey) {
      return `ApiKey ${(this.options as ClientOptionsApiKey).apiKeyId}:${(this.options as ClientOptionsApiKey).apiKey}`
    }
    return ""
  }

  /**
   * Execute a command
   */
  async execute<Input, Output>(command: Command<Input, Output>): Promise<Output> {
    const request = command.getRequest()
    // console.log("request", request)
    // console.log("headers", {
    //   ...request.headers,
    //   Authorization: await this.getAuthHeader(),
    // })
    const response = await fetch(request.baseUrl + request.path, {
      method: request.method,
      headers: {
        ...request.headers,
        Authorization: await this.getAuthHeader(),
      },
      body: request.body,
    })
    if (!response.ok) {
      const body = await response.json().catch(() => undefined)
      throw new ClientError(response.statusText, response.status, body)
    }
    const body = await response.json()
    return request.parseResponse(body) as Output
  }
}
