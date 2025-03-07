import { type Static, type TBoolean, type TObject, type TString, Type } from "@sinclair/typebox"

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
