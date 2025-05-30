import { Command, parseResponseHelper } from "@flowcore/sdk";
import { Type } from "@sinclair/typebox";

/**
 * The input for the policy archive command
 */
export interface PolicyArchiveInput {
	/** The policy id */
	policyId: string;
}

/**
 * The schema for the archive policy response
 */
export const ArchivePolicyResponseSchema = Type.Object({
	message: Type.String(),
});

/**
 * The archive policy response type
 */
export interface ArchivePolicyResponse {
	message: string;
}

/**
 * Archive a policy by ID
 */
export class PolicyArchiveCommand extends Command<
	PolicyArchiveInput,
	ArchivePolicyResponse
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
		return `/api/v1/policies/${this.input.policyId}`;
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(
		rawResponse: unknown,
	): ArchivePolicyResponse {
		return parseResponseHelper(ArchivePolicyResponseSchema, rawResponse);
	}
}
