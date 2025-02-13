/**
 * An error thrown when the response from the server is invalid
 */
export class InvalidResponseException extends Error {
  constructor(message: string, public readonly errors: Record<string, string>) {
    super(`${message}: ${JSON.stringify(errors)}`)
    this.errors = errors
  }
}
