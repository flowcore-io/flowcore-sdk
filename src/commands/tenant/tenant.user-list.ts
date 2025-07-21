import { CustomCommand } from "../../common/command-custom.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import type { TenantUser } from "../../contracts/tenant.ts"
import { TenantUserManagedRolesCommand } from "../iam/tenant/user-managed-roles.ts"
import { TenantUserListInnerCommand } from "./tenant.user-list-inner.ts"

/**
 * The input for the tenant users command
 */
export interface TenantUserListInput {
  /** the tenant id */
  tenantId: string
}

/**
 * The output for the tenant user list command
 */
export interface TenantUserListOutput extends TenantUser {
  managedRoles: string[]
}

/**
 * List tenants users
 */
export class TenantUserListCommand extends CustomCommand<TenantUserListInput, TenantUserListOutput[]> {
  /**
   * Custom execute method
   */
  protected override async customExecute(client: FlowcoreClient): Promise<TenantUserListOutput[]> {
    const usersCommand = new TenantUserListInnerCommand({
      tenantId: this.input.tenantId,
    })
    const tenantUserManagedRolesCommand = new TenantUserManagedRolesCommand({
      tenantId: this.input.tenantId,
    })

    const [users, tenantUserManagedRoles] = await Promise.all([
      client.execute(usersCommand),
      client.execute(tenantUserManagedRolesCommand),
    ])

    return users.map((user) => ({
      ...user,
      managedRoles: tenantUserManagedRoles[user.id] || [],
    }))
  }
}
