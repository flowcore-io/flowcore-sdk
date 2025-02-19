import { ClientError } from "../exceptions/client-error.ts"
import { CommandError } from "../exceptions/command-error.ts"
import type { Command } from "./command.ts"

const RETRYABLE_ERROR_CODES = [408, 429, 500, 502, 503, 504]

/**
 * The options for the bearer token
 */
interface ClientOptionsBearer {
  getBearerToken: () => Promise<string | null> | string | null
  apiKeyId?: never
  apiKey?: never
  retry?: {
    delay: number
    maxRetries: number
  } | null
}

/**
 * The options for the api key
 */
interface ClientOptionsApiKey {
  apiKeyId: string
  apiKey: string
  getBearerToken?: never
  retry?: {
    delay: number
    maxRetries: number
  } | null
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
  private baseUrl: string | undefined

  constructor(private readonly options: ClientOptions) {
    if ((this.options as ClientOptionsBearer).getBearerToken) {
      this.mode = "bearer"
    } else if ((this.options as ClientOptionsApiKey).apiKeyId && (this.options as ClientOptionsApiKey).apiKey) {
      this.mode = "apiKey"
    } else {
      throw new Error("Invalid client options")
    }

    if (this.options.retry === undefined) {
      this.options.retry = {
        delay: 250,
        maxRetries: 3,
      }
    }
  }

  /**
   * Get the auth header
   */
  private async getAuthHeader(): Promise<string | null> {
    if ((this.options as ClientOptionsBearer).getBearerToken) {
      const bearerToken = await (this.options as ClientOptionsBearer).getBearerToken()
      if (!bearerToken) {
        return null
      }
      return `Bearer ${bearerToken}`
    }
    if ((this.options as ClientOptionsApiKey).apiKeyId && (this.options as ClientOptionsApiKey).apiKey) {
      return `ApiKey ${(this.options as ClientOptionsApiKey).apiKeyId}:${(this.options as ClientOptionsApiKey).apiKey}`
    }
    return null
  }

  /**
   * Execute a command (inner method)
   */
  private async innerExecute<Input, Output>(
    command: Command<Input, Output>,
    retryCount: number = 0,
  ): Promise<Output> {
    const request = await command.getRequest(this)

    if (!request.allowedModes.includes(this.mode)) {
      throw new CommandError(command.constructor.name, `Not allowed in "${this.mode}" mode`)
    }

    const authHeader = await this.getAuthHeader()
    const headers: Record<string, string> = {
      ...request.headers,
      ...(authHeader ? { Authorization: authHeader } : {}),
    }

    let response: Response
    const url = this.baseUrl ? this.baseUrl + request.path : request.baseUrl + request.path
    let body: string | undefined
    if (typeof request.body === "object") {
      body = JSON.stringify(request.body)
    }
    try {
      response = await fetch(url, {
        method: request.method,
        headers,
        body,
      })
    } catch (error) {
      if (request.retryOnFailure && this.options.retry && retryCount < this.options.retry.maxRetries) {
        const delay = this.options.retry.delay
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.innerExecute(command, retryCount + 1)
      }
      const message = error instanceof Error ? error.message : "Unknown error"
      throw new ClientError(`Failed to execute command: ${message}`, 0, {
        command: command.constructor.name,
        error: error,
      })
    }

    if (!response.ok) {
      if (
        request.retryOnFailure &&
        this.options.retry && RETRYABLE_ERROR_CODES.includes(response.status) &&
        retryCount < this.options.retry.maxRetries
      ) {
        const delay = this.options.retry.delay
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.innerExecute(command, retryCount + 1)
      }
      const body = await response.json().catch(() => undefined)
      const commandName = command.constructor.name
      const error = new ClientError(
        `${commandName} failed with ${response.status}: ${response.statusText}`,
        response.status,
        body,
      )
      request.handleClientError(error)
    }
    const responseBody = response.status === 204 ? { status: response.status } : await response.json()
    const parsedBody = await request.parseResponse(responseBody)
    return request.processResponse(this, parsedBody)
  }

  /**
   * Override the base URL for all commands
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl
  }

  /**
   * Execute a command
   */
  execute<Input, Output>(command: Command<Input, Output>): Promise<Output> {
    return this.innerExecute(command, 0)
  }
}
