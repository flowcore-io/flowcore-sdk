import { Command } from "../../common/command.ts"
import { type Scenario, ScenarioSchema } from "../../contracts/scenario.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"


/**
 * The input for the scenario fetch command
 */
export interface ScenarioFetchInput {
  /** The scenario id */
  scenarioId: string
}

/**
 * The output for the scenario fetch command
 */
export interface ScenarioFetchOutput {
  /** The tenant id */
  id: string
  /** the scenarios in that tenant */
  scenarios: Scenario[]
}
/**
 * fetch a scenario
 */
export class ScenarioFetchCommand extends Command<ScenarioFetchInput, Scenario> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
  }
  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://scenario-2.api.flowcore.io"
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
