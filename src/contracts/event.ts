import { type Static, type TObject, type TRecord, type TString, type TUnknown, Type } from "@sinclair/typebox"

/**
 * The schema for an event
 */
export const FlowcoreEventSchema: TObject<{
  eventId: TString
  timeBucket: TString
  eventType: TString
  aggregator: TString
  dataCore: TString
  metadata: TRecord<TString, TUnknown>
  payload: TRecord<TString, TUnknown>
  validTime: TString
}> = Type.Object({
  eventId: Type.String(),
  timeBucket: Type.String(),
  eventType: Type.String(),
  aggregator: Type.String(),
  dataCore: Type.String(),
  metadata: Type.Record(Type.String(), Type.Unknown()),
  payload: Type.Record(Type.String(), Type.Unknown()),
  validTime: Type.String(),
})

/**
 * The type for an event
 */
export type FlowcoreEvent = Static<typeof FlowcoreEventSchema>
