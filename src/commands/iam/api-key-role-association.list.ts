import { Command } from "../../common/command.ts"
import { Type } from "@sinclair/typebox"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Role, RoleSchema } from "../../contracts/iam.ts"

/**
 * The input for the api key role association list command
 */
export interface ApiKeyRoleAssociationListInput {
  /** the api key id */
  apiKeyId: string
}

/**
 * Fetch all user role associations
 */
export class ApiKeyRoleAssociationListCommand extends Command<ApiKeyRoleAssociationListInput, Role[]> {
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
    return `/api/v1/role-associations/key/${this.input.apiKeyId}`
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
