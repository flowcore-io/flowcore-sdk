/**
 * An error thrown when the response from the server is invalid
 */
export class InvalidResponseException extends Error {
  constructor(message: string, public readonly errors: Record<string, string>) {
    const errorString = JSON.stringify(errors)
    super(`${message}: ${errorString.slice(0, 1000)}`)
    this.errors = errors
  }
}
