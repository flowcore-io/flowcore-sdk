import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { Static, TObject, TString } from "@sinclair/typebox"

/**
 * The input for deleting the current authenticated user
 * No input parameters needed - checks current authenticated user
 */
export type UserDeleteInput = Record<PropertyKey, never>

/**
 * The output for deleting the current authenticated user
 */
export type UserDeleteOutput = Static<typeof responseSchema>

const responseSchema: TObject<{
  id: TString
}> = Type.Object({
  id: Type.String(),
})

/**
 * Delete current authenticated user
 */
export class UserDeleteCommand extends Command<
  UserDeleteInput,
  UserDeleteOutput
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
    return "DELETE"
  }

  /**
   * Get the path for the request
   */
  protected override getPath(): string {
    return `/api/users/`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): UserDeleteOutput {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response
  }
}
