import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type, type TObject, type TString, type Static, type TArray } from "@sinclair/typebox"

/**
 * The schema for a role-key association
 */
export const RoleKeyAssociationSchema: TObject<{
  roleId: TString
  organizationId: TString
  keyId: TString
}> = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String(),
})

/**
 * The schema for a role-user association
 */
export const RoleUserAssociationSchema: TObject<{
  roleId: TString
  organizationId: TString
  userId: TString
}> = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
})

/**
 * The schema for role associations
 */
export const RoleAssociationsSchema: TObject<{
  keys: TArray<typeof RoleKeyAssociationSchema>
  users: TArray<typeof RoleUserAssociationSchema>
}> = Type.Object({
  keys: Type.Array(RoleKeyAssociationSchema),
  users: Type.Array(RoleUserAssociationSchema),
})

/**
 * The role-key association type
 */
export type RoleKeyAssociation = Static<typeof RoleKeyAssociationSchema>

/**
 * The role-user association type
 */
export type RoleUserAssociation = Static<typeof RoleUserAssociationSchema>

/**
 * The role associations type
 */
export type RoleAssociations = Static<typeof RoleAssociationsSchema>

/**
 * The input for the role associations command
 */
export interface RoleAssociationsInput {
  /** The role id */
  roleId: string
}

/**
 * Fetch associations for a role
 */
export class RoleAssociationsCommand extends Command<
  RoleAssociationsInput,
  RoleAssociations
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
    return `/api/v1/role-associations/${this.input.roleId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): RoleAssociations {
    return parseResponseHelper(RoleAssociationsSchema, rawResponse)
  }
}
