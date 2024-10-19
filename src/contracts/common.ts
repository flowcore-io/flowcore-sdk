import { Type } from "@sinclair/typebox"

export const configurationSchema = Type.Optional(
  Type.Array(
    Type.Object({
      key: Type.Literal("DELETE_PROTECTION_ENABLED"),
      value: Type.Union([Type.Literal("true"), Type.Literal("false")]),
    }),
    { minItems: 0, maxItems: 1 },
  ),
)
