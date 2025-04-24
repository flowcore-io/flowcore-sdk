import { type Static, type TArray, type TObject, type TUnion, Type } from "@sinclair/typebox"

// Using a different approach to avoid circular references
export type SimplePiiType = boolean | "string" | "number" | "boolean"

export type DetailedPiiField = {
  type: "string" | "number" | "boolean" | "object" | "array"
  faker?: string
  args?: unknown[]
  length?: number
  pattern?: string
  redact?: {
    char: string
    length: number
  }
  min?: number
  max?: number
  precision?: number
  count?: number
  items?: SimplePiiType | DetailedPiiField | Record<string, unknown>
  properties?: Record<string, SimplePiiType | DetailedPiiField | Record<string, unknown>>
}

// The full PiiDefinition type
export type PiiDefinition =
  | SimplePiiType
  | DetailedPiiField
  | Record<string, SimplePiiType | DetailedPiiField | Record<string, unknown>>

export const DetailedPiiFieldSchema: TObject = Type.Object({
  type: Type.Union([
    Type.Literal("string"),
    Type.Literal("number"),
    Type.Literal("boolean"),
    Type.Literal("object"),
    Type.Literal("array"),
  ]),
  faker: Type.Optional(Type.String()),
  args: Type.Optional(Type.Array(Type.Unknown())),
  length: Type.Optional(Type.Number()),
  pattern: Type.Optional(Type.String()),
  redact: Type.Optional(
    Type.Object({
      char: Type.String({ minLength: 1, maxLength: 1 }),
      length: Type.Number({ minimum: 1 }),
    }),
  ),
  min: Type.Optional(Type.Number()),
  max: Type.Optional(Type.Number()),
  precision: Type.Optional(Type.Number()),
  count: Type.Optional(Type.Number()),
  items: Type.Optional(Type.Unknown()),
  properties: Type.Optional(
    Type.Record(
      Type.String(),
      Type.Unknown(),
    ),
  ),
})

export const PiiDefinitionSchema: TUnion = Type.Union([
  Type.Literal(true),
  Type.Union([Type.Literal("string"), Type.Literal("number"), Type.Literal("boolean")]),
  DetailedPiiFieldSchema,
  Type.Record(Type.String(), Type.Unknown()),
])

export const EventTypePiiMaskSchema: TObject = Type.Object({
  key: Type.String(),
  schema: Type.Record(Type.String(), PiiDefinitionSchema),
})

export const EventTypePiiMaskParsedSchema: TArray<TObject> = Type.Array(
  Type.Object({
    path: Type.String(),
    definition: Type.Object({
      type: Type.Union([
        Type.Literal("string"),
        Type.Literal("number"),
        Type.Literal("boolean"),
        Type.Literal("object"),
        Type.Literal("array"),
      ]),
      faker: Type.Optional(Type.String()),
      args: Type.Array(Type.Unknown()),
      length: Type.Optional(Type.Number()),
      pattern: Type.Optional(Type.String()),
      min: Type.Optional(Type.Number()),
      max: Type.Optional(Type.Number()),
      precision: Type.Optional(Type.Number()),
      count: Type.Optional(Type.Number()),
      items: Type.Optional(Type.Unknown()),
      properties: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      redact: Type.Optional(
        Type.Object({
          char: Type.String(),
          length: Type.Number(),
        }),
      ),
    }),
  }),
)

/**
 * The schema for an event type
 */
export const EventTypeSchema: TObject = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  flowTypeId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  isTruncating: Type.Boolean(),
  isDeleting: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()]),
  piiMask: Type.Union([EventTypePiiMaskSchema, Type.Null()]),
  piiMaskParsed: Type.Union([EventTypePiiMaskParsedSchema, Type.Null()]),
  piiEnabled: Type.Boolean(),
})

/**
 * The type for an event type
 */
export type EventType = Static<typeof EventTypeSchema>

/**
 * Type for PII mask
 */
export type EventTypePiiMask = Static<typeof EventTypePiiMaskSchema>

/**
 * Type for parsed PII mask
 */
export type EventTypePiiMaskParsed = Static<typeof EventTypePiiMaskParsedSchema>
