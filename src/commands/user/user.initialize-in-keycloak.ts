import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface UserInitializeInKeycloakMe {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
}

/**
 * The input for initializing user in Keycloak
 * No input parameters needed - checks current authenticated user
 */
export type UserInitializeInKeycloakInput = Record<PropertyKey, never>

/**
 * The output for initializing user in Keycloak
 * (matches the REST API response)
 */
export type UserInitializeInKeycloakOutput = UserInitializeInKeycloakMe

const responseSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
})

/**
 * Finalize user initialization by setting Flowcore User ID in Keycloak.
 *
 * Calls `POST /api/users` on the user service with an empty JSON body.
 * Requires a bearer token.
 */
export class UserInitializeInKeycloakCommand extends Command<
  UserInitializeInKeycloakInput,
  UserInitializeInKeycloakOutput
> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Get the base URL for the request
   */
  protected override getBaseUrl(): string {
    return "https://user-2.api.flowcore.io"
  }

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "POST"
  }

  /**
   * Get the path for the request
   */
  protected override getPath(): string {
    return "/api/users"
  }

  /**
   * Get the body for the request (must be an empty JSON object)
   */
  protected override getBody(): Record<string, unknown> {
    return {
      // intentionally empty
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): UserInitializeInKeycloakOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }
}
