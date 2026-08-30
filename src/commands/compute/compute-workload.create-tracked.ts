import { Command } from "../../common/command.ts"
import { type ComputeWorkloadCreateResponse, ComputeWorkloadCreateResponseSchema } from "../../contracts/compute.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import type { ComputeWorkloadCreateInput } from "./compute-workload.create.ts"

/**
 * Create a workload and retain the operation that carries it to the cluster.
 *
 * The original create command keeps returning only the workload for backward
 * compatibility. New integrations should use this command so they can poll
 * cluster convergence from the API-minted `operationId`.
 */
export class ComputeWorkloadCreateTrackedCommand extends Command<
  ComputeWorkloadCreateInput,
  ComputeWorkloadCreateResponse
> {
  protected override retryOnFailure: boolean = false

  protected override getMethod(): string {
    return "POST"
  }

  protected override getBaseUrl(): string {
    return "https://compute.api.flowcore.io"
  }

  protected override getPath(): string {
    return "/api/v1/workloads"
  }

  protected override parseResponse(rawResponse: unknown): ComputeWorkloadCreateResponse {
    return parseResponseHelper(ComputeWorkloadCreateResponseSchema, rawResponse)
  }
}
