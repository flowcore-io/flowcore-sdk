import {
  type Static,
  type TBoolean,
  type TNull,
  type TObject,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * The schema for a flow type
 */
export const FlowTypeSchema: TObject<{
  id: TString
  tenantId: TString
  dataCoreId: TString
  name: TString
  description: TString
  isDeleting: TBoolean
}> = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  isDeleting: Type.Boolean(),
})

/**
 * The type for a flow type
 */
export type FlowType = Static<typeof FlowTypeSchema>

/**
 * The schema for a flow type v0
 */
export const FlowTypeV0Schema: TObject<{
  id: TString
  aggregator: TString
  description: TUnion<[TString, TNull]>
  deleting: TBoolean
}> = Type.Object({
  id: Type.String(),
  aggregator: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  deleting: Type.Boolean(),
})

/**
 * The type for a flow type v0
 */
export type FlowTypeV0 = Static<typeof FlowTypeV0Schema>

/**
 * Convert a flow type v0 to a flow type
 */
export const flowTypeV0ToFlowType = (
  flowTypeV0: FlowTypeV0,
  organizationId: string,
  dataCoreId: string,
): FlowType => {
  return {
    id: flowTypeV0.id,
    tenantId: organizationId,
    dataCoreId,
    name: flowTypeV0.aggregator,
    description: flowTypeV0.description ?? "",
    isDeleting: flowTypeV0.deleting,
  }
}
