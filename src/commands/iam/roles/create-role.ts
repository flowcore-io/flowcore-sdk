import { Command, parseResponseHelper } from "@flowcore/sdk";
import { type Static, Type } from "@sinclair/typebox";

/**
 * The schema for a role
 */
export const RoleSchema = Type.Object({
	id: Type.String(),
	organizationId: Type.String(),
	name: Type.String(),
	description: Type.Optional(Type.String()),
	flowcoreManaged: Type.Optional(Type.Boolean({ default: false })),
	archived: Type.Boolean(),
});

/**
 * The Role type
 */
export type Role = Static<typeof RoleSchema>;

/**
 * The input for the role create command
 */
export interface RoleCreateInput {
	/** The organization id */
	organizationId: string;
	/** The name of the role */
	name: string;
	/** The description of the role */
	description?: string;
	/** Whether the role is managed by Flowcore */
	flowcoreManaged?: boolean;
}

/**
 * Create a role
 */
export class RoleCreateCommand extends Command<RoleCreateInput, Role> {
	/**
	 * Whether the command should retry on failure
	 */
	protected override retryOnFailure = false;

	/**
	 * Get the method
	 */
	protected override getMethod(): string {
		return "POST";
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
		return "/api/v1/roles/";
	}

	/**
	 * Get the body
	 */
	protected override getBody(): Record<string, unknown> {
		return {
			...this.input,
			flowcoreManaged: this.input.flowcoreManaged ?? false,
		};
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): Role {
		return parseResponseHelper(RoleSchema, rawResponse);
	}
}
