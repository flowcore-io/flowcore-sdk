import { type Static, type TObject, type TRecord, type TString, type TUnknown, Type } from "@sinclair/typebox"

/**
 * The schema for an event
 */
export const FlowcoreEventSchema: TObject<{
  eventId: TString
  timeBucket: TString
  tenant: TString
  dataCoreId: TString
  flowType: TString
  eventType: TString
  metadata: TRecord<TString, TUnknown>
  payload: TRecord<TString, TUnknown>
  validTime: TString
}> = Type.Object({
  eventId: Type.String(),
  timeBucket: Type.String(),
  tenant: Type.String(),
  dataCoreId: Type.String(),
  flowType: Type.String(),
  eventType: Type.String(),
  metadata: Type.Record(Type.String(), Type.Unknown()),
  payload: Type.Record(Type.String(), Type.Unknown()),
  validTime: Type.String(),
})

/**
 * The type for an event
 */
export type FlowcoreEvent = Static<typeof FlowcoreEventSchema>

/**
 * The input for the ingest event command
 */
export interface IngestEventInput<T extends unknown> {
  /** the tenant name */
  tenantName: string
  /** the data core id */
  dataCoreId: string
  /** the flow type name */
  flowTypeName: string
  /** the event type name */
  eventTypeName: string
  /** the event data */
  eventData: T
  /** the event id */
  metadata?: Record<string, string>
  /** ttl (This accepts d, h, m, s. The maximum value is 7 days, this can be increased for higher subscription levels.) */
  ttl?: string
  /** indicate if this event is emphemral (default false) */
  isEphemeral?: boolean
  /** valid time of the event */
  validTime?: string
  /** event time of the event, overrides what time bucket this event is stored in */
  eventTime?: string
  /** flowcore managed event */
  flowcoreManaged?: boolean
}
