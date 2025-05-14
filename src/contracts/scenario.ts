import { type Static, type TObject, type TOptional, type TString, Type } from "@sinclair/typebox"

/**
 * The schema for an event type
 */
export const ScenarioSchema: TObject<{
  id: TString
  tenantId: TString
  name: TString
  displayName: TOptional<TString>
  description: TOptional<TString>
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  /** Unique identifier for the event type */
  id: Type.String(),
  /** ID of the tenant that owns this event type */
  tenantId: Type.String(),
  /** Name of the event type */
  name: Type.String(),
  /** Display name of the event type */
  displayName: Type.Optional(Type.String()),
  /** Description of the event type */
  description: Type.Optional(Type.String()),
  /** Creation timestamp */
  createdAt: Type.String(),
  /** Last update timestamp */
  updatedAt: Type.String(),
})

/**
 * The type for an event type
 */
export type Scenario = Static<typeof ScenarioSchema>
