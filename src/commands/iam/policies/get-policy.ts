import { Command, parseResponseHelper } from "@flowcore/sdk";
import { Type } from "@sinclair/typebox";
import { PolicySchema, type Policy } from "./create-policy.ts"; // Reuse the Policy type definition

/**
 * The input for the policy list command
 */
export interface PolicyListInput {
	/** The organization id */
	organizationId?: string;
}

/**
 * List policies
 */
export class PolicyListCommand extends Command<PolicyListInput, Policy[]> {
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
		return "/api/v1/policies/";
	}

	/**
	 * Get the query parameters
	 */
	protected getQueryParams(): Record<string, string> {
		const params: Record<string, string> = {};
		if (this.input.organizationId) {
			params.organizationId = this.input.organizationId;
		}
		return params;
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): Policy[] {
		return parseResponseHelper(Type.Array(PolicySchema), rawResponse);
	}
}

/**
 * The input for the policy get command
 */
export interface PolicyGetInput {
	/** The policy id */
	policyId: string;
}

/**
 * Get a policy by ID
 */
export class PolicyGetCommand extends Command<PolicyGetInput, Policy> {
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
		return `/api/v1/policies/${this.input.policyId}`;
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): Policy {
		return parseResponseHelper(PolicySchema, rawResponse);
	}
}
