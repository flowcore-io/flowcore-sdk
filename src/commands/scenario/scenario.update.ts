import { Command } from "../../common/command.ts"
import { type Scenario, ScenarioSchema } from "../../contracts/scenario.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the scenario update command
 */
export interface ScenarioUpdateInput {
  /** The scenario id */
  scenarioId: string
  /** The description of the scenario */
  description?: string
  /** The display name of the scenario */
  displayName?: string
}

/**
 * Update a scenario
 */
export class ScenarioUpdateCommand extends Command<ScenarioUpdateInput, Scenario> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
  }
  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://scenario-2.api.flowcore.io"
  }

  /**
   * Get the body
   */
  protected override getBody(): Record<string, unknown> | Array<unknown> | undefined {
    return {
      ...(this.input.description && { description: this.input.description }),
      ...(this.input.displayName && { displayName: this.input.displayName }),
    }
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/scenarios/${this.input.scenarioId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Scenario {
    return parseResponseHelper(ScenarioSchema, rawResponse)
  }
}
