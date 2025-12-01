import { GraphQlCommand } from "../../common/command-graphql.ts"
import { type LegacyScenario, LegacyScenarioSchema } from "../../contracts/legacy-scenario.ts"
import { InvalidResponseException } from "../../exceptions/invalid-response.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the legacy scenario fetch command
 */
export interface LegacyScenarioFetchInput {
  /** The scenario ID */
  scenarioId: string
}

const QUERY = `
query GetScenarioById($scenarioId: ID!) {
  scenario(id: $scenarioId) {
    id
    name
    description
    flowcoreUserId
    organizationId
    deploymentState
    createdAt
    updatedAt
    nodes {
      id
      type
      name
      description
      data
      parents
      children
    }
  }
}
`

/**
 * Fetch a legacy scenario by ID
 */
export class LegacyScenarioFetchCommand extends GraphQlCommand<LegacyScenarioFetchInput, LegacyScenario> {
  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      query: QUERY,
      variables: {
        scenarioId: this.input.scenarioId,
      },
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): LegacyScenario {
    const response = rawResponse as {
      data?: {
        scenario?: LegacyScenario | null
      }
      errors?: Array<{ message: string }>
    }

    if (response.errors && response.errors.length > 0) {
      throw new InvalidResponseException(
        response.errors.map((e) => e.message).join(", "),
        { graphql: response.errors.map((e) => e.message).join(", ") },
      )
    }

    if (!response.data?.scenario) {
      throw new NotFoundException("Legacy Scenario", { id: this.input.scenarioId })
    }

    return parseResponseHelper(LegacyScenarioSchema, response.data.scenario)
  }
}

