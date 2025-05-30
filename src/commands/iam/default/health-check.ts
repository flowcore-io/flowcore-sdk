import { Command } from "@flowcore/sdk";

/**
 * The health check response type
 */
export interface HealthCheckResponse {
	success: boolean;
}

/**
 * The input for the health check command
 */
export type HealthCheckInput = Record<string, never>;

/**
 * Check if the IAM service is healthy
 */
export class HealthCheckCommand extends Command<
	HealthCheckInput,
	HealthCheckResponse
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
		return "/health/";
	}

	/**
	 * Parse the response - since the API returns no body on success,
	 * we simply indicate success if we get a 200 response
	 */
	protected override parseResponse(_rawResponse: unknown): HealthCheckResponse {
		return { success: true };
	}
}
