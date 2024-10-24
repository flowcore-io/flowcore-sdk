import { Value } from "@sinclair/typebox/value"
import type { Static, TSchema } from "@sinclair/typebox"
import { InvalidResponseException } from "../exceptions/invalid-response.ts"

/**
 * Helper method for parsing the response
 */
export const parseResponseHelper = <T extends TSchema>(schema: T, response: unknown): Static<T> => {
  if (!Value.Check(schema, response)) {
    const parseErrors = Value.Errors(schema, response)
    const errors: Record<string, string> = {}
    for (const error of parseErrors) {
      errors[error.path] = error.message
    }
    throw new InvalidResponseException("Invalid response", errors)
  }
  return response as Static<T>
}
