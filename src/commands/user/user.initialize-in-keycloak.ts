import { GraphQlCommand } from "../../common/command-graphql.ts"
import { InvalidResponseException } from "../../exceptions/invalid-response.ts"

/**
 * The input for initializing user in Keycloak
 * No input parameters needed - checks current authenticated user
 */
export type UserInitializeInKeycloakInput = Record<PropertyKey, never>

/**
 * The output for initializing user in Keycloak
 */
export interface UserInitializeInKeycloakOutput {
  /** Whether the user is initialized */
  isInitialized: boolean
  /** User data if available */
  me?: unknown
}

const QUERY = `
query UserIsInitializedIfDoesNotExist {
  me
}
`

/**
 * Initialize user in Keycloak - checks if user exists and is initialized
 */
export class UserInitializeInKeycloakCommand extends GraphQlCommand<
  UserInitializeInKeycloakInput,
  UserInitializeInKeycloakOutput
> {
  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    return {
      query: QUERY,
      variables: {},
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): UserInitializeInKeycloakOutput {
    const response = rawResponse as {
      data?: {
        me?: unknown
      }
      errors?: Array<{ message: string }>
    }

    if (response.errors && response.errors.length > 0) {
      throw new InvalidResponseException(
        response.errors.map((e) => e.message).join(", "),
        { graphql: response.errors.map((e) => e.message).join(", ") },
      )
    }

    // If me exists and is not null i.e. flowcore_user_id is not null, user is initialized
    const isInitialized = response.data?.me !== null && response.data?.me !== undefined

    return {
      isInitialized,
      me: response.data?.me,
    }
  }
}
