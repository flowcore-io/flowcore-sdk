import { type Static, type TNull, type TObject, type TString, type TUnion, Type } from "@sinclair/typebox"

/**
 * The schema for a flow type
 */
export const FlowTypeSchema: TObject<{
  id: TString
  organizationId: TString
  dataCoreId: TString
  name: TString
  description: TString
}> = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  dataCoreId: Type.String(),
  name: Type.String(),
  description: Type.String(),
})
export type FlowType = Static<typeof FlowTypeSchema>

/**
 * The schema for a flow type v0
 */
export const FlowTypeV0Schema: TObject<{
  id: TString
  aggregator: TString
  description: TUnion<[TString, TNull]>
}> = Type.Object({
  id: Type.String(),
  aggregator: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
})
export type FlowTypeV0 = Static<typeof FlowTypeV0Schema>

export const flowTypeV0ToFlowType = (
  flowTypeV0: FlowTypeV0,
  organizationId: string,
  dataCoreId: string,
): FlowType => {
  return {
    id: flowTypeV0.id,
    organizationId,
    dataCoreId,
    name: flowTypeV0.aggregator,
    description: flowTypeV0.description ?? "",
  }
}
