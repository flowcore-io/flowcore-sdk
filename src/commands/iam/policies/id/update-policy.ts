import { Command, parseResponseHelper } from "@flowcore/sdk";
import {
	type Policy,
	PolicySchema,
	type PolicyStatement,
} from "../create-policy";

/**
 * The input for the policy update command
 */
export interface PolicyUpdateInput {
	/** The policy id */
	policyId: string;
	/** The organization id */
	organizationId: string;
	/** The name of the policy */
	name: string;
	/** The version of the policy */
	version: string;
	/** The policy documents */
	policyDocuments: PolicyStatement[];
	/** The description of the policy */
	description?: string;
	/** The principal role that can access the resource */
	principal?: string;
	/** Whether the policy is managed by Flowcore */
	flowcoreManaged?: boolean;
}

/**
 * Update a policy by ID
 */
export class PolicyUpdateCommand extends Command<PolicyUpdateInput, Policy> {
	/**
	 * Whether the command should retry on failure
	 */
	protected override retryOnFailure = false;

	/**
	 * Get the method
	 */
	protected override getMethod(): string {
		return "PATCH";
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
	 * Get the body
	 */
	protected override getBody(): Record<string, unknown> {
		const { policyId, ...rest } = this.input;
		return {
			...rest,
			flowcoreManaged: rest.flowcoreManaged ?? false,
		};
	}

	/**
	 * Parse the response
	 */
	protected override parseResponse(rawResponse: unknown): Policy {
		return parseResponseHelper(PolicySchema, rawResponse);
	}
}
