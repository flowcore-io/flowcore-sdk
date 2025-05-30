import { Command, parseResponseHelper } from "@flowcore/sdk";
import { type Role, RoleSchema } from "../create-role.ts";

/**
 * The input for the role get command
 */
export interface RoleGetInput {
	/** The role id */
	roleId: string;
}

/**
 * Get a role by ID
 */
export class RoleGetCommand extends Command<RoleGetInput, Role> {
	/**
	 * Whether the command should retry on failure
	 */
	protected override retryOnFailure = false;

	/**
	 * Get the method
	 */
	protected override getMethod(): string {
		return "GET";
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
		return `/api/v1/roles/${this.input.roleId}`;
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): Role {
		return parseResponseHelper(RoleSchema, rawResponse);
	}
}
