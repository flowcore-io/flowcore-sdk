import { Command, parseResponseHelper } from "@flowcore/sdk";
import { Type } from "@sinclair/typebox";

/**
 * The schema for a role-key association
 */
export const RoleKeyAssociationSchema = Type.Object({
	roleId: Type.String(),
	organizationId: Type.String(),
	keyId: Type.String(),
});

/**
 * The schema for a role-user association
 */
export const RoleUserAssociationSchema = Type.Object({
	roleId: Type.String(),
	organizationId: Type.String(),
	userId: Type.String(),
});

/**
 * The schema for role associations
 */
export const RoleAssociationsSchema = Type.Object({
	keys: Type.Array(RoleKeyAssociationSchema),
	users: Type.Array(RoleUserAssociationSchema),
});

/**
 * The role-key association type
 */
export type RoleKeyAssociation = {
	roleId: string;
	organizationId: string;
	keyId: string;
};

/**
 * The role-user association type
 */
export type RoleUserAssociation = {
	roleId: string;
	organizationId: string;
	userId: string;
};

/**
 * The role associations type
 */
export type RoleAssociations = {
	keys: RoleKeyAssociation[];
	users: RoleUserAssociation[];
};

/**
 * The input for the role associations command
 */
export interface RoleAssociationsInput {
	/** The role id */
	roleId: string;
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
		return `/api/v1/role-associations/${this.input.roleId}`;
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): RoleAssociations {
		return parseResponseHelper(RoleAssociationsSchema, rawResponse);
	}
}
