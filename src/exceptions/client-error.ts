export class ClientError extends Error {
  constructor(message: string, public readonly status: number) {
    super(`Client failed with ${status}: ${message}`)
  }
}
