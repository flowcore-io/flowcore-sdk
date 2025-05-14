import { Command } from "../../common/command.ts"
import { type Scenario, ScenarioSchema } from "../../contracts/scenario.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface ScenarioFetchByIdInput {
  /** The scenario id */
  scenarioId: string
  /** The tenant id */
  tenantId?: never
  /** scenario name */
  name?: never
}

export interface ScenarioFetchByNameInput {
  /** The scenario id */
  scenarioId?: never
  /** The tenant id */
  tenantId: string
  /** scenario name */
  name: string
}

function isScenarioFetchByIdInput(input: ScenarioFetchInput): input is ScenarioFetchByIdInput {
  return "scenarioId" in input
}

function isScenarioFetchByNameAndTenantInput(input: ScenarioFetchInput): input is ScenarioFetchByNameInput {
  return "tenantId" in input
}

/**
 * The input for the scenario fetch command
 */
export type ScenarioFetchInput = ScenarioFetchByIdInput | ScenarioFetchByNameInput

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
    if (this.input.scenarioId) {
      return `/api/v1/scenarios/${this.input.scenarioId}`
    }
    return `/api/v1/scenarios/tenant/${this.input.tenantId}/name/${this.input.name}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Scenario {
    return parseResponseHelper(ScenarioSchema, rawResponse)
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      if (isScenarioFetchByIdInput(this.input)) {
        throw new NotFoundException("Scenario", { id: this.input.scenarioId })
      } else if (isScenarioFetchByNameAndTenantInput(this.input)) {
        throw new NotFoundException("Scenario", { name: this.input.name, tenantId: this.input.tenantId })
      }
    }
    throw error
  }
}
