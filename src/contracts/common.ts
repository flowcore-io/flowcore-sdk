import { type TArray, type TLiteral, type TObject, type TOptional, type TUnion, Type } from "@sinclair/typebox"

export const configurationSchema: TOptional<
  TArray<
    TObject<{
      key: TLiteral<"DELETE_PROTECTION_ENABLED">
      value: TUnion<[TLiteral<"true">, TLiteral<"false">]>
    }>
  >
> = Type.Optional(
  Type.Array(
    Type.Object({
      key: Type.Literal("DELETE_PROTECTION_ENABLED"),
      value: Type.Union([Type.Literal("true"), Type.Literal("false")]),
    }),
    { minItems: 0, maxItems: 1 },
  ),
)
