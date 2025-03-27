import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type Tenant, TenantSchema } from "../../contracts/tenant.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant fetch by id command
 */
export interface TenantFetchByIdInput {
  /** The id of the tenant */
  tenantId: string
  /** The name of the tenant */
  tenant?: never
}

/**
 * The input for the tenant fetch by name command
 */
export interface TenantFetchByNameInput {
  /** The name of the tenant */
  tenant: string
  /** The id of the tenant */
  tenantId?: never
}

/**
 * The input for the tenant fetch command
 */
export type TenantFetchInput = TenantFetchByIdInput | TenantFetchByNameInput

/**
 * The response schema for the tenant fetch command
 */
const responseSchema = Type.Object({
  ...TenantSchema.properties,
  dedicated: Type.Union([
    Type.Null(),
    Type.Object({
      // parse as string to prevent sdk to fail when new status are added
      status: Type.String(),
      configuration: Type.Object({
        domain: Type.String(),
        configurationRepoUrl: Type.String(),
        configurationRepoCredentials: Type.String(),
      }),
    }),
  ]),
})

/**
 * Fetch a tenant
 */
export class TenantFetchCommand extends Command<TenantFetchInput, Tenant> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
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
    if ("tenantId" in this.input) {
      return `/api/v1/tenants/by-id/${this.input.tenantId}`
    }
    return `/api/v1/tenants/by-name/${this.input.tenant}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Tenant {
    const response = parseResponseHelper(responseSchema, rawResponse)
    return response as Tenant
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        [this.input.tenantId ? "id" : "name"]: this.input.tenantId ?? this.input.tenant,
      })
    }
    throw error
  }
}
