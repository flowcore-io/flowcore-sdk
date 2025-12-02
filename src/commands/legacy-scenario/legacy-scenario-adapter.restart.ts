import { GraphQlCommand } from "../../common/command-graphql.ts"
import { InvalidResponseException } from "../../exceptions/invalid-response.ts"

/**
 * The input for restarting a legacy scenario adapter
 */
export interface LegacyScenarioAdapterRestartInput {
  /** The adapter ID */
  adapterId: string
  /**
   * The event ID to restart from.
   * This should be a UUID v1 generated from the restart timestamp (milliseconds).
   */
  afterEventId: string
  /**
   * The time bucket to restart from.
   * Format: YYYYMMDDHHmm (year, month, day, hour, minute)
   */
  timeBucket: string
}

/**
 * The output for restarting a legacy scenario adapter
 */
export interface LegacyScenarioAdapterRestartOutput {
  /** Whether the restart was initiated successfully */
  success: boolean
}

const MUTATION = `
mutation RestartAdapter(
  $adapterId: ID!
  $afterEventId: String!
  $timeBucket: String!
) {
  adapter(id: $adapterId) {
    reset(input: { afterEventId: $afterEventId, timeBucket: $timeBucket })
  }
}
`

/**
 * Restart a legacy scenario adapter from a specific point in time
 */
export class LegacyScenarioAdapterRestartCommand extends GraphQlCommand<
  LegacyScenarioAdapterRestartInput,
  LegacyScenarioAdapterRestartOutput
> {
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
        adapterId: this.input.adapterId,
        afterEventId: this.input.afterEventId,
        timeBucket: this.input.timeBucket,
      },
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): LegacyScenarioAdapterRestartOutput {
    const response = rawResponse as {
      data?: {
        adapter?: {
          reset: boolean | null
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

    if (response.data?.adapter?.reset === undefined) {
      throw new InvalidResponseException("Invalid response from restart adapter mutation", {})
    }

    return {
      success: response.data.adapter.reset ?? false,
    }
  }
}
