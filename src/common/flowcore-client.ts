import { ClientError } from "../exceptions/client-error.ts"
import { CommandError } from "../exceptions/command-error.ts"
import type { Command } from "./command.ts"

/**
 * The options for the bearer token
 */
interface ClientOptionsBearer {
  getBearerToken: () => Promise<string> | string
  apiKeyId?: never
  apiKey?: never
}

/**
 * The options for the api key
 */
interface ClientOptionsApiKey {
  apiKeyId: string
  apiKey: string
  getBearerToken?: never
}

/**
 * The options for the client
 */
export type ClientOptions = ClientOptionsBearer | ClientOptionsApiKey

/**
 * A base client for executing commands
 */
export class FlowcoreClient {
  private mode: "apiKey" | "bearer"
  constructor(private readonly options: ClientOptions) {
    if ((this.options as ClientOptionsBearer).getBearerToken) {
      this.mode = "bearer"
    } else if ((this.options as ClientOptionsApiKey).apiKeyId && (this.options as ClientOptionsApiKey).apiKey) {
      this.mode = "apiKey"
    } else {
      throw new Error("Invalid client options")
    }
  }

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
    const request = await command.getRequest(this)

    if (!request.allowedModes.includes(this.mode)) {
      throw new CommandError(command.constructor.name, `Not allowed in "${this.mode}" mode`)
    }

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
      const commandName = command.constructor.name
      throw new ClientError(
        `${commandName} failed with ${response.status}: ${response.statusText}`,
        response.status,
        body,
      )
    }
    const body = await response.json()
    const parsedBody = await request.parseResponse(body, this)
    return request.waitForResponse(this, parsedBody)
  }
}
