import { Command, parseResponseHelper } from "@flowcore/sdk";
import { UserPolicyLinkSchema, type UserPolicyLink } from "./link-user-policy.ts";

/**
 * The input for the unlink user policy command
 */
export interface UnlinkUserPolicyInput {
	/** The user id */
	userId: string;
	/** The policy id */
	policyId: string;
}

/**
 * Unlink a policy from a user
 */
export class UnlinkUserPolicyCommand extends Command<
	UnlinkUserPolicyInput,
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
