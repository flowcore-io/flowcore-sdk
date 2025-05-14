import { Command } from "../../common/command.ts"
import { type Scenario, ScenarioSchema } from "../../contracts/scenario.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the scenario create command
 */
export interface ScenarioCreateInput {
  /** The tenant id */
  tenantId: string
  /** The name of the scenario */
  name: string
  /** The description of the scenario */
  description?: string
  /** The display name of the scenario */
  displayName?: string
}

/**
 * Create a scenario
 */
export class ScenarioCreateCommand extends Command<ScenarioCreateInput, Scenario> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "POST"
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
    return `/api/v1/scenarios`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Scenario {
    return parseResponseHelper(ScenarioSchema, rawResponse)
  }
}
