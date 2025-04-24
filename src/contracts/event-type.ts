import {
  type Static,
  type TArray,
  type TObject,
  type TUnion,
  Type
} from "@sinclair/typebox"

// Forward declaration for recursive types
export type PiiDefinition = boolean | string | DetailedPiiField | Record<string, any>
export type DetailedPiiField = {
  type: "string" | "number" | "boolean" | "object" | "array"
  faker?: string
  args?: any[]
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
  items?: PiiDefinition
  properties?: Record<string, PiiDefinition>
}

export const DetailedPiiFieldSchema: TObject = Type.Object({
  type: Type.Union([
    Type.Literal("string"),
    Type.Literal("number"),
    Type.Literal("boolean"),
    Type.Literal("object"),
    Type.Literal("array"),
  ]),
  faker: Type.Optional(Type.String()),
  args: Type.Optional(Type.Array(Type.Any())),
  length: Type.Optional(Type.Number()),
  pattern: Type.Optional(Type.String()),
  redact: Type.Optional(
    Type.Object({
      char: Type.String({ minLength: 1, maxLength: 1 }),
      length: Type.Number({ minimum: 1 }),
    })
  ),
  min: Type.Optional(Type.Number()),
  max: Type.Optional(Type.Number()),
  precision: Type.Optional(Type.Number()),
  count: Type.Optional(Type.Number()),
  items: Type.Optional(Type.Any()),
  properties: Type.Optional(
    Type.Record(
      Type.String(),
      Type.Any()
    )
  ),
})

export const PiiDefinitionSchema: TUnion = Type.Union([
  Type.Literal(true),
  Type.Union([Type.Literal("string"), Type.Literal("number"), Type.Literal("boolean")]),
  DetailedPiiFieldSchema,
  Type.Record(Type.String(), Type.Any()),
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
      args: Type.Array(Type.Any()),
      length: Type.Optional(Type.Number()),
      pattern: Type.Optional(Type.String()),
      min: Type.Optional(Type.Number()),
      max: Type.Optional(Type.Number()),
      precision: Type.Optional(Type.Number()),
      count: Type.Optional(Type.Number()),
      items: Type.Optional(Type.Any()),
      properties: Type.Optional(Type.Record(Type.String(), Type.Any())),
      redact: Type.Optional(
        Type.Object({
          char: Type.String(),
          length: Type.Number(),
        })
      ),
    }),
  })
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
