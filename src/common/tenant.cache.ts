import { LocalCache } from "../utils/local-cache.ts"

type DedicatedTenant = {
  isDedicated: boolean
  dedicated: {
    status: "ready" | "degraded" | "offline"
    configuration: { domain: string }
  } | null
}

export const tenantCache = new LocalCache<DedicatedTenant>(60 * 1000)
