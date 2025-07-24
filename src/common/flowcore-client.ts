import { ClientError } from "../exceptions/client-error.ts"
import { CommandError } from "../exceptions/command-error.ts"
import { tryCatch } from "../utils/try-catch.ts"
import type { Command } from "./command.ts"
import { tenantCache } from "./tenant.cache.ts"

const RETRYABLE_ERROR_CODES = [408, 429, 500, 502, 503, 504]

/**
 * The options for the bearer token
 */
interface ClientOptionsBearer {
  getBearerToken: () => Promise<string | null> | string | null
  /**
   * The ID of the API key.
   * @deprecated Use apiKey only instead (apiKeyId is only used for old api keys).
   */
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
  /**
   * The ID of the API key.
   * @deprecated Use apiKey only instead (apiKeyId is only used for old api keys).
   */
  apiKeyId?: string
  apiKey: string
  getBearerToken?: never
  retry?: {
    delay: number
    maxRetries: number
  } | null
}

function isClientOptionsBearer(options: ClientOptions): options is ClientOptionsBearer {
  return "getBearerToken" in options
}

function isClientOptionsApiKey(options: ClientOptions): options is ClientOptionsApiKey {
  return "apiKey" in options
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
    if (isClientOptionsBearer(this.options)) {
      this.mode = "bearer"
    } else if (isClientOptionsApiKey(this.options)) {
      if (!this.options.apiKeyId) {
        const parts = this.options.apiKey.split("_")
        if (parts.length !== 3 || parts[0] !== "fc") {
          throw new Error("Invalid api key")
        }
        this.options.apiKeyId = parts[1]
      }
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
    direct?: boolean,
  ): Promise<Output> {
    // Set the client auth options on the command
    if (typeof (command as unknown as Command<Input, Output>).setClientAuthOptions === "function") {
      if ((this.options as ClientOptionsBearer).getBearerToken) {
        const bearerToken = await (this.options as ClientOptionsBearer).getBearerToken()
        ;(command as unknown as Command<Input, Output>).setClientAuthOptions({ token: bearerToken || undefined })
      } else if ((this.options as ClientOptionsApiKey).apiKeyId && (this.options as ClientOptionsApiKey).apiKey) {
        ;(command as unknown as Command<Input, Output>).setClientAuthOptions({
          apiKeyId: (this.options as ClientOptionsApiKey).apiKeyId,
          apiKey: (this.options as ClientOptionsApiKey).apiKey,
        })
      }
    }

    const request = await command.getRequest(this, direct)

    if (request.customExecute) {
      return request.customExecute(this) as Promise<Output>
    }

    if (!request.allowedModes.includes(this.mode)) {
      throw new CommandError(command.constructor.name, `Not allowed in "${this.mode}" mode`)
    }

    const { data: authHeader, error: authHeaderError } = await tryCatch(this.getAuthHeader())
    if (authHeaderError) {
      throw new ClientError("Failed to get auth header", 0, command.constructor.name, {
        command: command.constructor.name,
        error: authHeaderError,
      })
    }
    const headers: Record<string, string> = {
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...request.headers,
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
        return this.innerExecute(command, retryCount + 1, direct)
      }
      const message = error instanceof Error ? error.message : "Unknown error"
      throw new ClientError(`Failed to execute command: ${message}`, 0, command.constructor.name, {
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
        return this.innerExecute(command, retryCount + 1, direct)
      }
      const body = await response.json().catch(() => undefined)
      const commandName = command.constructor.name
      const error = new ClientError(
        `${commandName} failed with ${response.status}: ${response.statusText}`,
        response.status,
        command.constructor.name,
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
  execute<Input, Output>(command: Command<Input, Output>, direct?: boolean): Promise<Output> {
    return this.innerExecute(command, 0, direct)
  }

  /**
   * Close the client and clean up resources
   * This should be called when the client is no longer needed to prevent memory leaks
   */
  close(): void {
    // Clear the tenant cache
    tenantCache.clear()
  }

  /**
   * Dispose the client
   */
  [Symbol.dispose](): void {
    this.close()
  }
}
