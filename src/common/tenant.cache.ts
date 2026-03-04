import { LocalCache } from "../utils/local-cache.ts"

type DedicatedTenant = {
  isDedicated: boolean
  instance: {
    status: string
    domain: string
  } | null
}

export const tenantCache = new LocalCache<DedicatedTenant>(60 * 1000)
