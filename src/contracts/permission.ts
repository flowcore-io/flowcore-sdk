import { type Static, Type } from "@sinclair/typebox"

/**
 * The schema for a permission
 */
export const PermissionSchema = Type.Object({
  tenant: Type.String(),
  type: Type.String(),
  id: Type.String(),
  action: Type.Array(
    Type.Union([
      Type.Literal("read"),
      Type.Literal("write"),
      Type.Literal("ingest"),
      Type.Literal("fetch"),
      Type.Literal("*"),
    ]),
  ),
})

/**
 * The type for a permission
 */
export type Permission = Static<typeof PermissionSchema>
