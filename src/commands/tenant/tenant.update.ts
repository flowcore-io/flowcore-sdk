import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type Tenant, TenantSchema } from "../../contracts/tenant.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { CommandError } from "../../exceptions/command-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the tenant update command
 */
export interface TenantUpdateInput {
  /** The id of the tenant to update */
  tenantId: string
  /** The description of the tenant */
  description?: string
  /** The display name of the tenant */
  displayName?: string
  /** The website URL of the tenant */
  website?: string
}

/**
 * The response schema for the tenant update command
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
  configured: Type.Boolean(),
  sensitiveDataEnabled: Type.Boolean(),
})

/**
 * Update a tenant
 */
export class TenantUpdateCommand extends Command<TenantUpdateInput, Tenant> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "PATCH"
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
    return `/api/v1/tenants/${this.input.tenantId}`
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    const { tenantId: _tenantId, ...payload } = this.input

    // Check if there are any fields to update
    const updateFields = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined),
    )

    if (Object.keys(updateFields).length === 0) {
      throw new CommandError(this.constructor.name, "No fields to update")
    }

    return updateFields
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
      throw new NotFoundException("Tenant", { id: this.input.tenantId })
    }
    throw error
  }
}
