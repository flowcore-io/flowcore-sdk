import type { Tenant } from "../contracts/tenant.ts"
import { LocalCache } from "../utils/local-cache.ts"

export const tenantCache = new LocalCache<Tenant>(60 * 1000)
