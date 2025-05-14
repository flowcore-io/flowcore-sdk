import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"



/**
 * The input for the scenario delete command
 */
export interface ScenarioDeleteInput {
  /** The tenant id */
  tenantId: string
  /** The scenario id */
  scenarioId: string
}

export interface ScenarioDeleteOutput {
  success: boolean
}

const ScenarioDeleteOutputSchema = Type.Object({
  success: Type.Boolean(),
})

/**
 * Delete a scenario
 */
export class ScenarioDeleteCommand extends Command<ScenarioDeleteInput, ScenarioDeleteOutput> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "DELETE"
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
  protected override parseResponse(rawResponse: unknown): ScenarioDeleteOutput {
    return parseResponseHelper(ScenarioDeleteOutputSchema, rawResponse)
  }
}
