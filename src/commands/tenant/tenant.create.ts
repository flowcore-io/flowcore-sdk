import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type Tenant, TenantSchema } from "../../contracts/tenant.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant create command
 */
export interface TenantCreateInput {
  /** The tenant slug (already normalized, lowercase, URL-safe) */
  tenantSlug: string
  /** The description of the tenant */
  description?: string
  /** The display name of the tenant */
  displayName?: string
}

/**
 * Response schema for the tenant create command
 */
const responseSchema = Type.Object({
  ...TenantSchema.properties,
  dedicated: Type.Union([
    Type.Null(),
    Type.Object({
      // parse as string to avoid SDK failures if new statuses are added
      status: Type.String(),
      configuration: Type.Object({
        domain: Type.String(),
        configurationRepoUrl: Type.String(),
        configurationRepoCredentials: Type.String(),
      }),
    }),
  ]),
  configured: Type.Boolean(),
  sensitiveDataEnabled: Type.Boolean(),
})

/**
 * Create a tenant
 */
export class TenantCreateCommand extends Command<TenantCreateInput, Tenant> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "POST"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://tenant.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/tenants`
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    const { tenantSlug, description, displayName } = this.input

    return {
      tenant_slug: tenantSlug,
      ...(description !== undefined && { description }),
      ...(displayName !== undefined && { displayName }),
    }
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Tenant {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response as Tenant
  }
}
