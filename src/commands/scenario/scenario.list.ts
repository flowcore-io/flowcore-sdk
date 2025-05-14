import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type Scenario, ScenarioSchema } from "../../contracts/scenario.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the scenario create command
 */
export interface ScenarioListInput {
  /** The tenant id */
  tenantId: string
}

/**
 * The output for the scenario list command
 */
export interface ScenarioListOutput {
  /** The tenant id */
  id: string
  /** the scenarios in that tenant */
  scenarios: Scenario[]
}

const ScenarioListOutputSchema = Type.Object({
  id: Type.String(),
  scenarios: Type.Array(ScenarioSchema),
})

/**
 * list all scenarios
 */
export class ScenarioListCommand extends Command<ScenarioListInput, ScenarioListOutput> {
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
    return `/api/v1/scenarios/tenant/${this.input.tenantId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ScenarioListOutput {
    return parseResponseHelper(ScenarioListOutputSchema, rawResponse)
  }
}
