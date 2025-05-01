import {
  type Static,
  type TArray,
  type TBoolean,
  type TLiteral,
  type TNull,
  type TNumber,
  type TObject,
  type TOptional,
  type TRecord,
  type TString,
  type TUnion,
  type TUnknown,
  Type,
} from "@sinclair/typebox"

// Using a different approach to avoid circular references
export type SimpleSensitiveDataType = boolean | "string" | "number" | "boolean"

export type DetailedSensitiveDataField = {
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
  items?: SimpleSensitiveDataType | DetailedSensitiveDataField | Record<string, unknown>
  properties?: Record<string, SimpleSensitiveDataType | DetailedSensitiveDataField | Record<string, unknown>>
}

// The full SensitiveDataDefinition type
export type SensitiveDataDefinition =
  | SimpleSensitiveDataType
  | DetailedSensitiveDataField
  | Record<string, SimpleSensitiveDataType | DetailedSensitiveDataField | Record<string, unknown>>

/**
 * The schema for a detailed SensitiveData field
 */
export const DetailedSensitiveDataFieldSchema: TObject<{
  type: TUnion<[TLiteral<"string">, TLiteral<"number">, TLiteral<"boolean">, TLiteral<"object">, TLiteral<"array">]>
  faker: TOptional<TString>
  args: TOptional<TArray<TUnknown>>
  length: TOptional<TNumber>
  pattern: TOptional<TString>
  redact: TOptional<
    TObject<{
      char: TString
      length: TNumber
    }>
  >
  min: TOptional<TNumber>
  max: TOptional<TNumber>
  precision: TOptional<TNumber>
  count: TOptional<TNumber>
  items: TOptional<TUnknown>
  properties: TOptional<TRecord<TString, TUnknown>>
}> = Type.Object({
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

/**
 * The schema for a SensitiveData definition
 */
export const SensitiveDataDefinitionSchema: TUnion<
  [
    TLiteral<true>,
    TUnion<[TLiteral<"string">, TLiteral<"number">, TLiteral<"boolean">]>,
    typeof DetailedSensitiveDataFieldSchema,
    TRecord<TString, TUnknown>,
  ]
> = Type.Union([
  Type.Literal(true),
  Type.Union([Type.Literal("string"), Type.Literal("number"), Type.Literal("boolean")]),
  DetailedSensitiveDataFieldSchema,
  Type.Record(Type.String(), Type.Unknown()),
])

/**
 * The schema for an event type SensitiveData mask
 */
export const EventTypeSensitiveDataMaskSchema: TObject<{
  key: TString
  schema: TRecord<TString, typeof SensitiveDataDefinitionSchema>
}> = Type.Object({
  key: Type.String(),
  schema: Type.Record(Type.String(), SensitiveDataDefinitionSchema),
})

/**
 * The schema for an event type SensitiveData mask parsed
 */
export const EventTypeSensitiveDataMaskParsedSchema: TArray<
  TObject<{
    path: TString
    definition: TObject<{
      type: TUnion<[TLiteral<"string">, TLiteral<"number">, TLiteral<"boolean">, TLiteral<"object">, TLiteral<"array">]>
      faker: TOptional<TString>
      args: TArray<TUnknown>
      length: TOptional<TNumber>
      pattern: TOptional<TString>
      min: TOptional<TNumber>
      max: TOptional<TNumber>
      precision: TOptional<TNumber>
      count: TOptional<TNumber>
      items: TOptional<TUnknown>
      properties: TOptional<TRecord<TString, TUnknown>>
      redact: TOptional<
        TObject<{
          char: TString
          length: TNumber
        }>
      >
    }>
  }>
> = Type.Array(
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
export const EventTypeSchema: TObject<{
  id: TString
  tenantId: TString
  dataCoreId: TString
  flowTypeId: TString
  name: TString
  description: TString
  isTruncating: TBoolean
  isDeleting: TBoolean
  createdAt: TString
  updatedAt: TUnion<[TString, TNull]>
  sensitiveDataMask: TOptional<TUnion<[typeof EventTypeSensitiveDataMaskSchema, TNull]>>
  sensitiveDataEnabled: TOptional<TBoolean>
}> = Type.Object({
  /** Unique identifier for the event type */
  id: Type.String(),
  /** ID of the tenant that owns this event type */
  tenantId: Type.String(),
  /** ID of the data core this event type belongs to */
  dataCoreId: Type.String(),
  /** ID of the flow type this event type belongs to */
  flowTypeId: Type.String(),
  /** Name of the event type */
  name: Type.String(),
  /** Description of the event type */
  description: Type.String(),
  /** Indicates if the event type is currently being truncated */
  isTruncating: Type.Boolean(),
  /** Indicates if the event type is currently being deleted */
  isDeleting: Type.Boolean(),
  /** Creation timestamp */
  createdAt: Type.String(),
  /** Last update timestamp */
  updatedAt: Type.Union([Type.String(), Type.Null()]),
  /** SensitiveData mask configuration */
  sensitiveDataMask: Type.Optional(Type.Union([EventTypeSensitiveDataMaskSchema, Type.Null()])),
  /** Indicates if SensitiveData handling is enabled */
  sensitiveDataEnabled: Type.Optional(Type.Boolean()),
})

/**
 * The type for an event type
 */
export type EventType = Static<typeof EventTypeSchema>

/**
 * Type for SensitiveData mask
 */
export type EventTypeSensitiveDataMask = Static<typeof EventTypeSensitiveDataMaskSchema>

/**
 * Type for parsed SensitiveData mask
 */
export type EventTypeSensitiveDataMaskParsed = Static<typeof EventTypeSensitiveDataMaskParsedSchema>
