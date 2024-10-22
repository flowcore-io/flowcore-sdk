import { Value } from "@sinclair/typebox/value"
import type { Static, TSchema } from "@sinclair/typebox"

export const parseResponse = <T extends TSchema>(schema: T, response: unknown): Static<T> => {
  if (!Value.Check(schema, response)) {
    const errors = Value.Errors(schema, response)
    for (const error of errors) {
      console.debug("invalid response", error.path, error.message)
    }
    throw new Error("Invalid response")
  }
  return response as Static<T>
}
