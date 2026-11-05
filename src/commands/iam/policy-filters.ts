import { type Static, Type } from "@sinclair/typebox"

export const PolicyFilterValueSchema = Type.Union([
  Type.String({ maxLength: 512 }),
  Type.Number(),
  Type.Boolean(),
  Type.Null(),
])

const PolicyFilterPathSchema = Type.String({
  minLength: 1,
  maxLength: 256,
  pattern: "^[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+){0,7}$",
})

export const PolicyFilterSchema = Type.Union([
  Type.Object({ path: PolicyFilterPathSchema, operator: Type.Literal("equals"), value: PolicyFilterValueSchema }, { additionalProperties: false }),
  Type.Object({ path: PolicyFilterPathSchema, operator: Type.Literal("oneOf"), values: Type.Array(PolicyFilterValueSchema, { minItems: 1, maxItems: 20 }) }, { additionalProperties: false }),
  Type.Object({ path: PolicyFilterPathSchema, operator: Type.Literal("exists"), value: Type.Boolean() }, { additionalProperties: false }),
])

export type PolicyFilterValue = Static<typeof PolicyFilterValueSchema>
export type PolicyFilter = Static<typeof PolicyFilterSchema>

const RESERVED_PATH_SEGMENTS = new Set(["__proto__", "prototype", "constructor"])

function ownPath(payload: unknown, path: string): { exists: boolean; value?: unknown } {
  let current = payload
  for (const segment of path.split(".")) {
    if (RESERVED_PATH_SEGMENTS.has(segment) || typeof current !== "object" || current === null || Array.isArray(current)) {
      return { exists: false }
    }
    if (!Object.hasOwn(current, segment)) return { exists: false }
    current = (current as Record<string, unknown>)[segment]
  }
  return { exists: true, value: current }
}

export function isEncryptedPayload(payload: unknown): boolean {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return false
  if (!Object.hasOwn(payload, "encryptedPayload")) return false
  const keys = Object.keys(payload)
  const value = (payload as Record<string, unknown>).encryptedPayload
  return keys.length === 1 && typeof value === "string" && value.split(".").length === 3
}

export function matchesPolicyFilters(filters: readonly PolicyFilter[], payload: unknown): boolean {
  if (isEncryptedPayload(payload)) return false
  return filters.every((filter) => {
    const resolved = ownPath(payload, filter.path)
    if (filter.operator === "exists") return resolved.exists === filter.value
    if (!resolved.exists) return false
    if (filter.operator === "equals") return resolved.value === filter.value
    return filter.values.some((value) => resolved.value === value)
  })
}

export type EntitlementGrant = {
  policyFrn: string
  statementId: string
  resource: string
  filters?: PolicyFilter[]
}

export function permitsPayload(grants: readonly EntitlementGrant[], payload: unknown): boolean {
  return grants.some((grant) => grant.filters === undefined || matchesPolicyFilters(grant.filters, payload))
}
