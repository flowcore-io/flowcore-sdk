import { type Static, Type } from "@sinclair/typebox"
import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"

/**
 * The input for the tenant user managed roles command
 */
interface TenantUserManagedRolesInput {
  tenantId: string
}

/**
 * The schema for the tenant user managed roles command
 */
const TenantUserManagedRolesSchema = Type.Record(Type.String(), Type.Array(Type.String()))

/**
 * The output for the tenant user managed roles command
 */
type TenantUserManagedRolesOutput = Static<typeof TenantUserManagedRolesSchema>

/**
 * List tenants user managed roles
 */
export class TenantUserManagedRolesCommand extends Command<TenantUserManagedRolesInput, TenantUserManagedRolesOutput> {
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
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/tenants/${this.input.tenantId}/user-managed-roles`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): TenantUserManagedRolesOutput {
    const response = parseResponseHelper(TenantUserManagedRolesSchema, rawResponse)
    return response
  }
}
