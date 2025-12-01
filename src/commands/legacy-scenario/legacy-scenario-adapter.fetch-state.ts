import { GraphQlCommand } from "../../common/command-graphql.ts"
import { type LegacyScenarioAdapterState, LegacyScenarioAdapterStateSchema } from "../../contracts/legacy-scenario.ts"
import { InvalidResponseException } from "../../exceptions/invalid-response.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for fetching legacy scenario adapter state
 */
export interface LegacyScenarioAdapterFetchStateInput {
  /** The adapter ID */
  adapterId: string
  /** The organization ID */
  organizationId: string
}

/**
 * The output for fetching legacy scenario adapter state
 */
export interface LegacyScenarioAdapterFetchStateOutput {
  /** The adapter state */
  state: LegacyScenarioAdapterState
}

const QUERY = `
query GetAdapterDeploymentState($adapterId: ID!, $organizationId: ID!) {
  adapter(search: { id: $adapterId, organizationId: $organizationId }) {
    state {
      kubernetes {
        status
      }
    }
  }
}
`

/**
 * Fetch the deployment state of a legacy scenario adapter
 */
export class LegacyScenarioAdapterFetchStateCommand extends GraphQlCommand<
  LegacyScenarioAdapterFetchStateInput,
  LegacyScenarioAdapterFetchStateOutput
> {
  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      query: QUERY,
      variables: {
        adapterId: this.input.adapterId,
        organizationId: this.input.organizationId,
      },
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): LegacyScenarioAdapterFetchStateOutput {
    const response = rawResponse as {
      data?: {
        adapter?: {
          state: LegacyScenarioAdapterState
        } | null
      }
      errors?: Array<{ message: string }>
    }

    if (response.errors && response.errors.length > 0) {
      throw new InvalidResponseException(
        response.errors.map((e) => e.message).join(", "),
        { graphql: response.errors.map((e) => e.message).join(", ") },
      )
    }

    if (!response.data?.adapter) {
      throw new NotFoundException("Legacy Scenario Adapter", {
        id: this.input.adapterId,
        organizationId: this.input.organizationId,
      })
    }

    const state = parseResponseHelper(LegacyScenarioAdapterStateSchema, response.data.adapter.state)

    return { state }
  }
}

