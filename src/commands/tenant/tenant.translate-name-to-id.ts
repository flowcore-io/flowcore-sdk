import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import type { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"


/**
 * The input for the tenant translate name to id command
 */
export interface TenantTranslateNameToIdInput {
  /** The name of the tenant */
  tenant: string
}

/**
 * The schema for the tenant translate name to id command
 */
export const TenantTranslateNameToIdSchema: TObject<{
  id: TString
  name: TString
}> = Type.Object({
  id: Type.String(),
  name: Type.String(),
})

export type TenantTranslateNameToId = Static<typeof TenantTranslateNameToIdSchema>

/**
 * Translate a tenant name to an tenant id
 */
export class TenantTranslateNameToIdCommand extends Command<TenantTranslateNameToIdInput, TenantTranslateNameToId> {
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
    return `/api/v1/tenants/translate-name-to-id/${this.input.tenant}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantTranslateNameToId {
    const response = parseResponseHelper(TenantTranslateNameToIdSchema, rawResponse)
    return response
  }

  /**
   * Handle the client error
   */
  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        tenant: this.input.tenant,
      })
    }
    throw error
  }
}
