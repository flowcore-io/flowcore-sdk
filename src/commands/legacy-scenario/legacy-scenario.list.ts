import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command-graphql.ts"
import { type LegacyScenarioListItem, LegacyScenarioListItemSchema } from "../../contracts/legacy-scenario.ts"
import { InvalidResponseException } from "../../exceptions/invalid-response.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the legacy scenario list command
 */
export interface LegacyScenarioListInput {
  /** The organization ID */
  organizationId: string
}

/**
 * The output for the legacy scenario list command
 */
export interface LegacyScenarioListOutput {
  /** The organization ID */
  organizationId: string
  /** The scenarios in the organization */
  scenarios: LegacyScenarioListItem[]
}

const LegacyScenarioListOutputSchema = Type.Object({
  organizationId: Type.String(),
  scenarios: Type.Array(LegacyScenarioListItemSchema),
})

const QUERY = `
query GetScenariosInOrganization($organizationId: ID!) {
  organization(search: { id: $organizationId }) {
    id
    scenarios {
      id
      name
      description
      flowcoreUserId
      deploymentState
      createdAt
      updatedAt
      lastDeployed
    }
  }
}
`

/**
 * List all legacy scenarios in an organization
 */
export class LegacyScenarioListCommand extends GraphQlCommand<LegacyScenarioListInput, LegacyScenarioListOutput> {
  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      query: QUERY,
      variables: {
        organizationId: this.input.organizationId,
      },
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): LegacyScenarioListOutput {
    const response = rawResponse as {
      data?: {
        organization?: {
          id: string
          scenarios: LegacyScenarioListItem[]
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

    if (!response.data?.organization) {
      throw new InvalidResponseException("Organization not found in response", {})
    }

    const output = {
      organizationId: response.data.organization.id,
      scenarios: response.data.organization.scenarios ?? [],
    }

    return parseResponseHelper(LegacyScenarioListOutputSchema, output)
  }
}

