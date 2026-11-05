import { isEncryptedPayload, matchesPolicyFilters, permitsPayload } from "../../../src/commands/iam/policy-filters.ts"
import { describe, expect, it } from "bun:test"

describe("policy payload filters", () => {
  it("uses strict own-property comparisons", () => {
    expect(matchesPolicyFilters([{ path: "customer.region", operator: "equals", value: "EU" }], { customer: { region: "EU" } })).toBe(true)
    expect(matchesPolicyFilters([{ path: "count", operator: "equals", value: 1 }], { count: "1" })).toBe(false)
    expect(matchesPolicyFilters([{ path: "missing", operator: "exists", value: false }], { missing: null })).toBe(false)
    expect(matchesPolicyFilters([{ path: "missing", operator: "exists", value: false }], {})).toBe(true)
  })

  it("supports oneOf and ANDs filters within a grant", () => {
    expect(matchesPolicyFilters([
      { path: "region", operator: "oneOf", values: ["FO", "DK"] },
      { path: "active", operator: "equals", value: true },
    ], { region: "FO", active: true })).toBe(true)
  })

  it("blocks reserved traversal segments", () => {
    expect(matchesPolicyFilters([{ path: "constructor.name", operator: "equals", value: "Object" }], {})).toBe(false)
    expect(matchesPolicyFilters([{ path: "items.0", operator: "equals", value: "x" }], { items: ["x"] })).toBe(false)
  })

  it("recognizes only the canonical encrypted envelope", () => {
    expect(isEncryptedPayload({ encryptedPayload: "a.b.c" })).toBe(true)
    expect(isEncryptedPayload({ encryptedPayload: "a.b.c", visible: true })).toBe(false)
    expect(matchesPolicyFilters([{ path: "encryptedPayload", operator: "exists", value: true }], { encryptedPayload: "a.b.c" })).toBe(false)
  })

  it("ORs grants and lets an unconditional grant dominate", () => {
    const grants = [
      { policyFrn: "p1", statementId: "s1", resource: "r", filters: [{ path: "region", operator: "equals" as const, value: "FO" }] },
      { policyFrn: "p2", statementId: "s2", resource: "r" },
    ]
    expect(permitsPayload(grants, { region: "US" })).toBe(true)
  })
})
