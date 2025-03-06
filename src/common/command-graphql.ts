import { Command } from "./command.ts"

/**
 * Abstract command for executing GraphQL requests
 */
export abstract class GraphQlCommand<Input, Output> extends Command<Input, Output> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Get the base URL for the request
   */
  protected override getBaseUrl(): string {
    return "https://graph.api.flowcore.io"
  }

  /**
   * Get the path for the request
   */
  protected override getPath(): string {
    return "/graphql"
  }
}
