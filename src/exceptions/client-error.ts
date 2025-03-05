/**
 * An error thrown when the client request fails
 */
export class ClientError extends Error {
  constructor(message: string, public readonly status: number, public readonly body?: unknown) {
    super(`Client failed with ${status}: ${body ? JSON.stringify(body) : message}`)
  }
}
