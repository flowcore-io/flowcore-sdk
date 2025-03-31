import { type Static, type TBoolean, type TObject, type TOptional, type TString, Type } from "@sinclair/typebox"

export const RoleSchema: TObject<{
  id: TString
  organizationId: TString
  name: TString
  description: TString
  flowcoreManaged: TOptional<TBoolean>
  frn: TString
}> = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  flowcoreManaged: Type.Optional(Type.Boolean()),
  frn: Type.String(),
})

export type Role = Omit<Static<typeof RoleSchema>, "organizationId"> & {
  tenantId: string
}
