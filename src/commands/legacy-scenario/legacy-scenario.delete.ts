import { GraphQlCommand } from "../../common/command-graphql.ts"
import { InvalidResponseException } from "../../exceptions/invalid-response.ts"

/**
 * The input for the legacy scenario delete command
 */
export interface LegacyScenarioDeleteInput {
  /** The organization ID */
  organizationId: string
  /** The scenario ID */
  scenarioId: string
}

/**
 * The output for the legacy scenario delete command
 */
export interface LegacyScenarioDeleteOutput {
  /** Whether the deletion was successful */
  success: boolean
}

const MUTATION = `
mutation DeleteScenario($organizationId: ID!, $scenarioId: ID!) {
  organization(id: $organizationId) {
    deleteScenario(scenarioId: $scenarioId)
  }
}
`

/**
 * Delete a legacy scenario
 */
export class LegacyScenarioDeleteCommand extends GraphQlCommand<LegacyScenarioDeleteInput, LegacyScenarioDeleteOutput> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      query: MUTATION,
      variables: {
        organizationId: this.input.organizationId,
        scenarioId: this.input.scenarioId,
      },
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): LegacyScenarioDeleteOutput {
    const response = rawResponse as {
      data?: {
        organization?: {
          deleteScenario: boolean
        }
      }
      errors?: Array<{ message: string }>
    }

    if (response.errors && response.errors.length > 0) {
      throw new InvalidResponseException(
        response.errors.map((e) => e.message).join(", "),
        { graphql: response.errors.map((e) => e.message).join(", ") },
      )
    }

    if (response.data?.organization?.deleteScenario === undefined) {
      throw new InvalidResponseException("Invalid response from delete scenario mutation", {})
    }

    return {
      success: response.data.organization.deleteScenario,
    }
  }
}

