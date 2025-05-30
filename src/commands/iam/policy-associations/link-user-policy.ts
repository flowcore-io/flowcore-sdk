import { Command, parseResponseHelper } from "@flowcore/sdk";
import { Type } from "@sinclair/typebox";

/**
 * The schema for a user policy link response
 */
export const UserPolicyLinkSchema = Type.Object({
	policyId: Type.String(),
	organizationId: Type.String(),
	userId: Type.String(),
});

/**
 * The user policy link response type
 */
export interface UserPolicyLink {
	policyId: string;
	organizationId: string;
	userId: string;
}

/**
 * The input for the link user policy command
 */
export interface LinkUserPolicyInput {
	/** The user id */
	userId: string;
	/** The policy id */
	policyId: string;
}

/**
 * Link a policy to a user
 */
export class LinkUserPolicyCommand extends Command<
	LinkUserPolicyInput,
	UserPolicyLink
> {
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
		return `/api/v1/policy-associations/user/${this.input.userId}/`;
	}

	/**
	 * Get the body
	 */
	protected override getBody(): Record<string, unknown> {
		return {
			policyId: this.input.policyId,
		};
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): UserPolicyLink {
		return parseResponseHelper(UserPolicyLinkSchema, rawResponse);
	}
}
