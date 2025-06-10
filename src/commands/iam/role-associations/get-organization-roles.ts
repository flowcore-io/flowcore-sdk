import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"
import type { Role } from "../roles/create-role.ts"

/**
 * The input for the organization roles command
 */
export interface OrganizationRolesInput {
  /** The organization id */
  organizationId: string
}

// More flexible schema for API responses that might have missing archived field
const FlexibleRoleSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  flowcoreManaged: Type.Boolean(),
  archived: Type.Optional(Type.Boolean()),
  frn: Type.String(),
  createdAt: Type.Optional(Type.String()),
  updatedAt: Type.Optional(Type.String()),
})

/**
 * Fetch roles for an organization
 */
export class OrganizationRolesCommand extends Command<
  OrganizationRolesInput,
  Role[]
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = true

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
    return `/api/v1/role-associations/organization/${this.input.organizationId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Role[] {
    // Use the flexible schema to parse the response
    const flexibleRoles = parseResponseHelper(
      Type.Array(FlexibleRoleSchema),
      rawResponse,
    )

    // Convert to the expected Role type by ensuring archived is a boolean
    return flexibleRoles.map((role) => ({
      ...role,
      archived: role.archived !== undefined ? role.archived : false,
    }))
  }
}
