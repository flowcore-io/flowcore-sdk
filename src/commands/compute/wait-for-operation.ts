import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import type { ComputeOperation, ComputeWorkload, ComputeWorkloadRun } from "../../contracts/compute.ts"
import { CommandError } from "../../exceptions/command-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { ComputeOperationFetchCommand } from "./compute-operation.fetch.ts"

/**
 * The default poll budget, in milliseconds (10 minutes).
 *
 * DELIBERATELY MUCH LONGER than the 25 seconds `DataCoreRequestDeleteCommand`
 * allows itself. A compute mutation is a pre-sync hook (whose own timeout
 * defaults to 300 seconds and may be set as high as 3600) followed by a
 * rolling update, so 25 seconds would time out on a perfectly healthy deploy.
 */
export const DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS = 600_000

/** The default gap between polls, in milliseconds. */
export const DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS = 1_000

/**
 * The wait options every 202-returning compute command accepts.
 */
export interface ComputeOperationWaitOptions {
  /**
   * Poll `GET /api/v1/operations/{operationId}` until the operation reaches a
   * terminal state before resolving (default: false)
   */
  waitForOperation?: boolean
  /**
   * How long to keep polling, in milliseconds
   * (default: {@link DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS}, 10 minutes)
   */
  operationTimeoutMs?: number
  /**
   * How long to sleep between polls, in milliseconds
   * (default: {@link DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS}, 1 second)
   */
  operationPollIntervalMs?: number
}

/**
 * The 202 body of PATCH, rollback, pause and resume, plus the terminal
 * operation when `waitForOperation` was set.
 */
export interface ComputeWorkloadMutationOutput {
  /** Always true */
  success: true
  /** The workload as it stands NOW — the new revision is promoted by the cluster's verdict */
  workload: ComputeWorkload
  /** The operation the cluster convergence is tracked under (full UUID) */
  operationId: string
  /** The terminal operation. Present ONLY when `waitForOperation` was set */
  operation?: ComputeOperation
}

/**
 * The 202 body of `DELETE /api/v1/workloads/{workloadId}`, plus the terminal
 * operation when `waitForOperation` was set.
 */
export interface ComputeWorkloadDeleteOutput {
  /** Always true */
  success: true
  /** The operation the teardown is tracked under (full UUID) */
  operationId: string
  /** The terminal operation. Present ONLY when `waitForOperation` was set */
  operation?: ComputeOperation
}

/**
 * The 202 body of `POST /api/v1/workloads/{workloadId}/run`, plus the
 * terminal operation when `waitForOperation` was set.
 */
export interface ComputeWorkloadRunOutput {
  /** Always true */
  success: true
  /** The run row, already listed by `GET /runs` */
  run: ComputeWorkloadRun
  /** The run id (full UUID) */
  runId: string
  /** The operation the run is tracked under (full UUID) */
  operationId: string
  /** The terminal operation. Present ONLY when `waitForOperation` was set */
  operation?: ComputeOperation
}

/**
 * Poll a compute operation until it reaches a terminal state.
 *
 * Modelled on the `processResponse` loop of `DataCoreRequestDeleteCommand`,
 * with TWO deliberate deviations from that template:
 *
 * 1. AN EARLY 404 IS "NOT YET", NOT "GONE". The compute API mints the
 *    operation id and emits the event, but the operation ROW is written by
 *    the `compute-operation.0/operation.updated.0` handler only once the
 *    in-cluster reconciler files its first progress report. Between the 202
 *    and that report the endpoint answers 404, and treating that as a
 *    terminal answer would make every wait fail on a healthy deploy. So a
 *    `NotFoundException` is swallowed and the poll continues.
 *
 * 2. THE BUDGET IS LONGER AND CONFIGURABLE, AND EXHAUSTING IT THROWS. The
 *    delete template gives itself a hardcoded 25 seconds and then returns the
 *    original response as if nothing happened. A rolling update gated on a
 *    pre-sync hook routinely runs longer than that, and silently returning
 *    "done" for an operation still in flight is worse here than it is there:
 *    the caller's next action is usually to treat the new revision as live.
 *    So the budget defaults to 10 minutes, is overridable per call, and a
 *    timeout raises a {@link CommandError} naming the last state observed.
 *
 * A FAILED operation is RETURNED, not thrown: `failed` is a terminal answer
 * to the question that was asked, and `reason` explains it. Only the absence
 * of an answer within the budget is an error.
 */
export async function waitForComputeOperation(
  client: FlowcoreClient,
  commandName: string,
  operationId: string,
  options: ComputeOperationWaitOptions,
): Promise<ComputeOperation> {
  const timeoutMs = options.operationTimeoutMs ?? DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS
  const pollIntervalMs = options.operationPollIntervalMs ?? DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS
  const start = Date.now()
  let lastSeen: ComputeOperation | undefined

  while (Date.now() - start < timeoutMs) {
    try {
      const operation = await client.execute(new ComputeOperationFetchCommand({ operationId }))
      lastSeen = operation
      if (operation.status === "succeeded" || operation.status === "failed") {
        return operation
      }
    } catch (error) {
      // Deviation 1: the operation row does not exist until the reconciler
      // files its first report, so a 404 here means "not yet".
      if (!(error instanceof NotFoundException)) {
        throw error
      }
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  // Deviation 2: never a silent timeout.
  throw new CommandError(
    commandName,
    lastSeen
      ? `Operation ${operationId} did not reach a terminal state within ${timeoutMs}ms ` +
          `(last observed status "${lastSeen.status}", phase "${lastSeen.phase}")`
      : `Operation ${operationId} did not appear within ${timeoutMs}ms — the reconciler filed no progress report`,
  )
}
