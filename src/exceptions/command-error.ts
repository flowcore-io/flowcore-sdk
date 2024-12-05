/**
 * An error thrown when the command fails
 */
export class CommandError extends Error {
  constructor(commandName: string, message: string) {
    super(`Command "${commandName}" failed with: ${message}`)
  }
}
