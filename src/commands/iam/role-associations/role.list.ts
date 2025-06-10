import { Command } from "../../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { type Role, RoleSchema } from "../../../contracts/iam.ts"

/**
 * The input for the role list command
 */
export interface RoleListInput {
  /** the tenant id */
  tenantId: string
  /** the role name */
  name?: string
}

/**
 * Fetch all roles for a tenant
 */
export class RoleListCommand extends Command<RoleListInput, Role[]> {
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
    const query = new URLSearchParams()
    if (this.input.name) {
      query.set("name", this.input.name)
    }
    return `/api/v1/role-associations/organization/${this.input.tenantId}?${query.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Role[] {
    const response = parseResponseHelper(Type.Array(RoleSchema), rawResponse)
    return response.map((role) => ({
      ...role,
      tenantId: role.organizationId,
    }))
  }
}
