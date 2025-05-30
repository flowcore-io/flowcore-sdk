import { Command, parseResponseHelper } from "@flowcore/sdk";
import { UserRoleLinkSchema, type UserRoleLink } from "./link-user-role.ts";

/**
 * The input for the unlink user role command
 */
export interface UnlinkUserRoleInput {
	/** The user id */
	userId: string;
	/** The role id */
	roleId: string;
}

/**
 * Unlink a role from a user
 */
export class UnlinkUserRoleCommand extends Command<
	UnlinkUserRoleInput,
	UserRoleLink
> {
	/**
	 * Whether the command should retry on failure
	 */
	protected override retryOnFailure = false;

	/**
	 * Get the method
	 */
	protected override getMethod(): string {
		return "DELETE";
	}

	/**
	 * Get the base url
	 */
	protected override getBaseUrl(): string {
		return "https://iam.api.flowcore.io";
	}

	/**
	 * Get the path
	 */
	protected override getPath(): string {
		return `/api/v1/role-associations/user/${this.input.userId}/`;
	}

	/**
	 * Get the body
	 */
	protected override getBody(): Record<string, unknown> {
		return {
			roleId: this.input.roleId,
		};
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): UserRoleLink {
		return parseResponseHelper(UserRoleLinkSchema, rawResponse);
	}
}
