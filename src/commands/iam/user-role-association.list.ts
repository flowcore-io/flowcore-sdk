import { Command } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Role, RoleSchema } from "../../contracts/iam.ts"

/**
 * The input for the user role associations list command
 */
export interface UserRoleAssociationListInput {
  /** the user id */
  userId: string
  /** the tenant id */
  tenantId?: string
}

/**
 * Fetch all user role associations
 */
export class UserRoleAssociationListCommand extends Command<UserRoleAssociationListInput, Role[]> {
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
    const queryParams = new URLSearchParams()
    this.input.tenantId && queryParams.set("organizationId", this.input.tenantId)
    return `/api/v1/role-associations/user/${this.input.userId}?${queryParams.toString()}`
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
