import { type Static, type TBoolean, type TObject, type TOptional, type TString, Type } from "@sinclair/typebox"

export const RoleSchema: TObject<{
  id: TString
  organizationId: TString
  name: TString
  description: TOptional<TString>
  flowcoreManaged: TOptional<TBoolean>
  frn: TOptional<TString>
}> = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  flowcoreManaged: Type.Optional(Type.Boolean()),
  frn: Type.Optional(Type.String()),
})

export type Role = Omit<Static<typeof RoleSchema>, "organizationId"> & {
  tenantId: string
}
