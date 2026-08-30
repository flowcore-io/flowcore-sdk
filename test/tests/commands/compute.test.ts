import { afterAll, afterEach, describe, it } from "bun:test"
import { assertEquals, assertRejects } from "@test/compat/assert"
import type { Observable } from "rxjs"
import {
  CommandError,
  type ComputeDomain,
  ComputeDomainAttachCommand,
  ComputeDomainDetachCommand,
  ComputeDomainListCommand,
  ComputeDomainVerifyCommand,
  type ComputeDomainVerifyResponse,
  type ComputeLogStreamEvent,
  type ComputeOperation,
  ComputeOperationFetchCommand,
  type ComputeRegistry,
  type ComputeRegistryDetail,
  ComputeRegistryFetchCommand,
  ComputeRegistryListCommand,
  ComputeRegistryRegisterCommand,
  ComputeRegistryRemoveCommand,
  ComputeRegistryRotateCommand,
  type ComputeWorkload,
  ComputeWorkloadCreateCommand,
  ComputeWorkloadCreateTrackedCommand,
  ComputeWorkloadDeleteCommand,
  type ComputeWorkloadDeploymentEvents,
  ComputeWorkloadEventsListCommand,
  ComputeWorkloadFetchCommand,
  ComputeWorkloadListCommand,
  ComputeWorkloadLogStreamCommand,
  type ComputeWorkloadLogs,
  ComputeWorkloadLogsFetchCommand,
  ComputeWorkloadPauseCommand,
  ComputeWorkloadResumeCommand,
  type ComputeWorkloadRevision,
  ComputeWorkloadRevisionsListCommand,
  ComputeWorkloadRollbackCommand,
  type ComputeWorkloadRun,
  ComputeWorkloadRunCommand,
  ComputeWorkloadRunsListCommand,
  ComputeWorkloadUpdateCommand,
  FlowcoreClient,
  NotFoundException,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

const COMPUTE_BASE_URL = "https://compute.api.flowcore.io"

/** Full UUIDs everywhere — never shortened, in fixtures as in production. */
const workloadId = "3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11"
const tenantId = "8a1a2f83-4a6a-4f0a-9a7b-4c9b1d2e3f40"
const domainId = "b7d2c1e0-5f4a-4c3b-8d2e-1a0b9c8d7e6f"
const registryId = "c1a2b3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
const operationId = "d9e8f7a6-b5c4-4d3e-9f2a-1b0c9d8e7f66"
const runId = "e0d1c2b3-a4f5-4e6d-8c7b-9a0f1e2d3c4b"

function makeWorkload(overrides: Partial<ComputeWorkload> = {}): ComputeWorkload {
  return {
    id: workloadId,
    tenantId,
    name: "api",
    status: "running",
    readyReplicas: 2,
    definition: {
      image: "ghcr.io/acme/api:1.2.3",
      slotTier: "small",
      kind: "service",
      replicas: 2,
      port: 8080,
      scaling: { mode: "manual" },
    },
    activeRevision: 1,
    paused: false,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:05:00.000Z",
    ...overrides,
  }
}

function makeOperation(overrides: Partial<ComputeOperation> = {}): ComputeOperation {
  return {
    operationId,
    workloadId,
    type: "workload.update",
    status: "in_progress",
    phase: "rolling_out",
    progress: {
      deployment: { desiredReplicas: 2, updatedReplicas: 1, readyReplicas: 1 },
    },
    createdAt: "2026-08-01T10:05:00.000Z",
    updatedAt: "2026-08-01T10:05:10.000Z",
    ...overrides,
  }
}

function makeDomain(overrides: Partial<ComputeDomain> = {}): ComputeDomain {
  return {
    domainId,
    workloadId,
    hostname: "api.acme.org",
    targetPort: 8080,
    status: "pending_verification",
    verification: {
      type: "cname",
      expectedTarget: "ingress.flowcore.io",
      verified: false,
    },
    tls: {
      status: "pending_issuance",
      secretName: `dom-${domainId}-tls`,
    },
    createdAt: "2026-08-01T10:00:00.000Z",
    ...overrides,
  }
}

function makeRegistry(overrides: Partial<ComputeRegistry> = {}): ComputeRegistry {
  return {
    registryId,
    name: "acme ghcr",
    serverUrl: "ghcr.io",
    username: "acme-bot",
    isDefault: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    ...overrides,
  }
}

function makeRun(overrides: Partial<ComputeWorkloadRun> = {}): ComputeWorkloadRun {
  return {
    id: runId,
    workloadId,
    tenantId,
    kind: "batch",
    name: `run-${runId}`,
    status: "running",
    operationId,
    startedAt: "2026-08-01T10:10:00.000Z",
    ...overrides,
  }
}

/** Drains an observable to an array, resolving when it completes. */
function collect<T>(observable: Observable<T>): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    const values: T[] = []
    observable.subscribe({
      next: (value) => values.push(value),
      error: reject,
      complete: () => resolve(values),
    })
  })
}

/**
 * Swaps `globalThis.fetch` for the duration of one call, so a test can serve a
 * stream that stays open — something the shared FetchMocker, which answers with
 * a complete body, cannot do. Restored even when `run` throws.
 */
async function withStubbedFetch<T>(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  run: () => Promise<T>,
): Promise<T> {
  const original = globalThis.fetch
  globalThis.fetch = handler as typeof globalThis.fetch
  try {
    return await run()
  } finally {
    globalThis.fetch = original
  }
}

/** Polls until `predicate` holds, or throws after ~1s. No live calls, no sleeps in the SUT. */
async function waitFor(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error("Timed out waiting for condition")
}

function sseResponse(body: ReadableStream<Uint8Array>): Response {
  return new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } })
}

const encoder = new TextEncoder()

describe("Compute", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const compute = fetchMocker.mock(COMPUTE_BASE_URL)

  afterEach(() => {
    fetchMocker.assert()
  })
  afterAll(() => {
    fetchMocker.restore()
  })

  // ── Workloads ──

  it("should list workloads for a tenant and unwrap the success envelope", async () => {
    // arrange
    const workload = makeWorkload()
    compute
      .get("/api/v1/workloads")
      .matchSearchParams({ tenantId })
      .respondWith(200, { success: true, workloads: [workload] })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadListCommand({ tenantId }))

    // assert
    assertEquals(response, [workload])
  })

  it("should create a workload and unwrap the success envelope", async () => {
    // arrange
    const workload = makeWorkload()
    compute
      .post("/api/v1/workloads")
      .matchBody({
        tenantId,
        name: "api",
        definition: { image: "ghcr.io/acme/api:1.2.3", slotTier: "small", replicas: 2 },
      })
      .respondWith(201, { success: true, workload })

    // act
    const response = await flowcoreClient.execute(
      new ComputeWorkloadCreateCommand({
        tenantId,
        name: "api",
        definition: { image: "ghcr.io/acme/api:1.2.3", slotTier: "small", replicas: 2 },
      }),
    )

    // assert
    assertEquals(response, workload)
  })

  it("should create a tracked workload and retain its operation id", async () => {
    const workload = makeWorkload()
    compute
      .post("/api/v1/workloads")
      .matchBody({
        tenantId,
        name: "api",
        definition: { image: "ghcr.io/acme/api:1.2.3", slotTier: "small", replicas: 2 },
      })
      .respondWith(201, { success: true, workload, operationId })

    const response = await flowcoreClient.execute(
      new ComputeWorkloadCreateTrackedCommand({
        tenantId,
        name: "api",
        definition: { image: "ghcr.io/acme/api:1.2.3", slotTier: "small", replicas: 2 },
      }),
    )

    assertEquals(response, { success: true, workload, operationId })
  })

  it("should fetch a workload and unwrap the success envelope", async () => {
    // arrange
    const workload = makeWorkload()
    compute.get(`/api/v1/workloads/${workloadId}`).respondWith(200, { success: true, workload })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadFetchCommand({ workloadId }))

    // assert
    assertEquals(response, workload)
  })

  it("should throw NotFoundException when a workload is not found", async () => {
    // arrange
    compute
      .get(`/api/v1/workloads/${workloadId}`)
      .respondWith(404, { statusCode: 404, error: "Not Found", message: `Workload ${workloadId} not found` })

    // act
    const responsePromise = flowcoreClient.execute(new ComputeWorkloadFetchCommand({ workloadId }))

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Workload not found: ${JSON.stringify({ workloadId })}`,
    )
  })

  it("should send ONLY the patch fields on update — never the path param or the wait knobs", async () => {
    // arrange
    //
    // THE `.strict()` PIN. `matchBody` requires the request body to be a
    // SUBSET of the object below, so if the command leaked `workloadId`,
    // `waitForOperation` or `operationTimeoutMs` into the JSON no mock would
    // match and this test would fail with "No mock found" — which is exactly
    // the 422 the service would answer with.
    const workload = makeWorkload({ activeRevision: 1 })
    compute
      .patch(`/api/v1/workloads/${workloadId}`)
      .matchBody({ image: "ghcr.io/acme/api:2.0.0", replicas: 3 })
      .respondWith(202, { success: true, workload, operationId })

    // act
    const response = await flowcoreClient.execute(
      new ComputeWorkloadUpdateCommand({
        workloadId,
        image: "ghcr.io/acme/api:2.0.0",
        replicas: 3,
        waitForOperation: false,
        operationTimeoutMs: 1000,
      }),
    )

    // assert
    assertEquals(response, { success: true, workload, operationId })
  })

  it("should refuse an update that changes nothing", async () => {
    // act
    const responsePromise = flowcoreClient.execute(new ComputeWorkloadUpdateCommand({ workloadId }))

    // assert
    await assertRejects(() => responsePromise, CommandError, "No fields to update")
  })

  it("should treat an early operation 404 as 'not yet' and poll until the operation succeeds", async () => {
    // arrange
    const workload = makeWorkload()
    compute
      .patch(`/api/v1/workloads/${workloadId}`)
      .matchBody({ image: "ghcr.io/acme/api:2.0.0" })
      .respondWith(202, { success: true, workload, operationId })

    // The operation row does not exist until the reconciler files its first
    // report, so the first poll is a 404 that must NOT end the wait.
    compute
      .get(`/api/v1/operations/${operationId}`)
      .respondWith(404, { statusCode: 404, error: "Not Found", message: "Operation not found" })
    compute
      .get(`/api/v1/operations/${operationId}`)
      .respondWith(200, makeOperation({ status: "in_progress", phase: "pre_sync_running" }))
    const succeeded = makeOperation({ status: "succeeded", phase: "completed" })
    compute.get(`/api/v1/operations/${operationId}`).respondWith(200, succeeded)

    // act
    const response = await flowcoreClient.execute(
      new ComputeWorkloadUpdateCommand({
        workloadId,
        image: "ghcr.io/acme/api:2.0.0",
        waitForOperation: true,
        operationPollIntervalMs: 1,
        operationTimeoutMs: 5_000,
      }),
    )

    // assert
    assertEquals(response.operation, succeeded)
    assertEquals(response.operationId, operationId)
  })

  it("should return a FAILED operation rather than throwing", async () => {
    // arrange
    const workload = makeWorkload()
    compute.post(`/api/v1/workloads/${workloadId}/rollback`).respondWith(202, { success: true, workload, operationId })
    const failed = makeOperation({
      type: "workload.rollback",
      status: "failed",
      phase: "pre_sync_failed",
      reason: "pre-sync job exited 1",
    })
    compute.get(`/api/v1/operations/${operationId}`).respondWith(200, failed)

    // act
    const response = await flowcoreClient.execute(
      new ComputeWorkloadRollbackCommand({
        workloadId,
        waitForOperation: true,
        operationPollIntervalMs: 1,
      }),
    )

    // assert
    assertEquals(response.operation, failed)
  })

  it("should NOT time out silently — an exhausted budget throws", async () => {
    // arrange
    const workload = makeWorkload()
    compute.post(`/api/v1/workloads/${workloadId}/pause`).respondWith(202, { success: true, workload, operationId })
    // ONE poll only: the sleep between polls (20ms) is longer than the whole
    // budget (5ms), so the loop runs exactly once and then gives up.
    compute
      .get(`/api/v1/operations/${operationId}`)
      .respondWith(200, makeOperation({ type: "workload.pause", status: "in_progress", phase: "pausing" }))

    // act
    const responsePromise = flowcoreClient.execute(
      new ComputeWorkloadPauseCommand({
        workloadId,
        waitForOperation: true,
        operationPollIntervalMs: 20,
        operationTimeoutMs: 5,
      }),
    )

    // assert
    await assertRejects(() => responsePromise, CommandError, "did not reach a terminal state within 5ms")
  })

  it("should roll a workload back", async () => {
    // arrange
    const workload = makeWorkload({ activeRevision: 3, rolledBackFrom: 1 })
    compute.post(`/api/v1/workloads/${workloadId}/rollback`).respondWith(202, { success: true, workload, operationId })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadRollbackCommand({ workloadId }))

    // assert
    assertEquals(response, { success: true, workload, operationId })
  })

  it("should pause a workload", async () => {
    // arrange
    const workload = makeWorkload({ status: "stopped", paused: true, readyReplicas: 0 })
    compute.post(`/api/v1/workloads/${workloadId}/pause`).respondWith(202, { success: true, workload, operationId })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadPauseCommand({ workloadId }))

    // assert
    assertEquals(response, { success: true, workload, operationId })
  })

  it("should resume a workload", async () => {
    // arrange
    const workload = makeWorkload({ paused: false })
    compute.post(`/api/v1/workloads/${workloadId}/resume`).respondWith(202, { success: true, workload, operationId })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadResumeCommand({ workloadId }))

    // assert
    assertEquals(response, { success: true, workload, operationId })
  })

  it("should delete a workload — the 202 carries an operation id and NO workload", async () => {
    // arrange
    compute.delete(`/api/v1/workloads/${workloadId}`).respondWith(202, { success: true, operationId })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadDeleteCommand({ workloadId }))

    // assert
    assertEquals(response, { success: true, operationId })
  })

  it("should request a batch run", async () => {
    // arrange
    const run = makeRun()
    compute.post(`/api/v1/workloads/${workloadId}/run`).respondWith(202, { success: true, run, runId, operationId })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadRunCommand({ workloadId }))

    // assert
    assertEquals(response, { success: true, run, runId, operationId })
  })

  it("should list run history from a BARE response with no success envelope", async () => {
    // arrange
    const run = makeRun({ status: "succeeded", completedAt: "2026-08-01T10:12:00.000Z" })
    compute
      .get(`/api/v1/workloads/${workloadId}/runs`)
      .matchSearchParams({ limit: "10", cursor: "opaque-cursor" })
      .respondWith(200, { runs: [run], nextCursor: "next-opaque-cursor" })

    // act
    const response = await flowcoreClient.execute(
      new ComputeWorkloadRunsListCommand({ workloadId, limit: 10, cursor: "opaque-cursor" }),
    )

    // assert
    assertEquals(response, { runs: [run], nextCursor: "next-opaque-cursor" })
  })

  // ── Revision history ──

  it("should list revision history, including a historical create with no outcome", async () => {
    // arrange
    //
    // THE REGRESSION THIS PINS: replay can seed revision 1 from an event that
    // predates API-minted create operations. It carries no `outcome` and no
    // `operationId`, so the reader must keep both optional.
    const revisions: ComputeWorkloadRevision[] = [
      {
        revision: 3,
        image: "ghcr.io/acme/api:3.0.0",
        slotTier: "small",
        cause: "rollback",
        isActive: false,
        rolledBackFrom: 1,
        operationId,
        outcome: "failed",
        outcomeReason: "pre-sync hook exited 1",
        createdAt: "2026-08-03T10:00:00.000Z",
      },
      {
        revision: 2,
        image: "ghcr.io/acme/api:2.0.0",
        slotTier: "small",
        cause: "update",
        isActive: true,
        operationId,
        outcome: "succeeded",
        createdAt: "2026-08-02T10:00:00.000Z",
      },
      {
        // No `outcome`, no `operationId`, no `slotTier` — a create.
        revision: 1,
        image: "ghcr.io/acme/api:1.2.3",
        cause: "created",
        isActive: false,
        createdAt: "2026-08-01T10:00:00.000Z",
      },
    ]
    compute.get(`/api/v1/workloads/${workloadId}/revisions`).respondWith(200, { revisions })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadRevisionsListCommand({ workloadId }))

    // assert
    assertEquals(response, { revisions })
    assertEquals(response.revisions[2]?.outcome, undefined)
  })

  it("should send limit and cursor as query params and round-trip nextCursor", async () => {
    // arrange
    const revision: ComputeWorkloadRevision = {
      revision: 7,
      image: "ghcr.io/acme/api:7.0.0",
      cause: "update",
      isActive: true,
      operationId,
      outcome: "pending",
      createdAt: "2026-08-07T10:00:00.000Z",
    }
    compute
      .get(`/api/v1/workloads/${workloadId}/revisions`)
      .matchSearchParams({ limit: "25", cursor: "opaque-cursor" })
      .respondWith(200, { revisions: [revision], nextCursor: "next-opaque-cursor" })

    // act
    const response = await flowcoreClient.execute(
      new ComputeWorkloadRevisionsListCommand({ workloadId, limit: 25, cursor: "opaque-cursor" }),
    )

    // assert
    assertEquals(response, { revisions: [revision], nextCursor: "next-opaque-cursor" })
  })

  it("should throw NotFoundException when a workload has no revision history to read", async () => {
    // arrange
    compute
      .get(`/api/v1/workloads/${workloadId}/revisions`)
      .respondWith(404, { statusCode: 404, error: "Not Found", message: `Workload ${workloadId} not found` })

    // act
    const responsePromise = flowcoreClient.execute(new ComputeWorkloadRevisionsListCommand({ workloadId }))

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Workload not found: ${JSON.stringify({ workloadId })}`,
    )
  })

  // ── Deployment events ──

  it("should list cluster events across more than one object kind", async () => {
    // arrange
    const events: ComputeWorkloadDeploymentEvents = {
      workloadId,
      events: [
        {
          name: "workload-3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11-abcde.17f0",
          type: "Warning",
          reason: "BackOff",
          message: "Back-off restarting failed container",
          count: 4,
          object: { kind: "Pod", name: "workload-3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11-abcde" },
          source: "kubelet",
          firstSeen: "2026-08-01T10:10:00.000Z",
          lastSeen: "2026-08-01T10:14:00.000Z",
        },
        {
          name: "workload-3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11.17ef",
          type: "Normal",
          reason: "ScalingReplicaSet",
          message: "Scaled up replica set to 2",
          count: 1,
          object: { kind: "Deployment", name: "workload-3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11" },
          source: "deployment-controller",
          lastSeen: "2026-08-01T10:09:00.000Z",
        },
        {
          // The tolerant end of the contract: no `source`, no series
          // timestamps, and an empty message are all shapes the cluster is
          // entitled to send.
          name: "pre-sync-3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11-r2.17ee",
          type: "Normal",
          reason: "Completed",
          message: "",
          count: 1,
          object: { kind: "Job", name: "pre-sync-3f5d0d3e-0f2a-4a5f-9f2c-2f0f0d7b5a11-r2" },
        },
      ],
    }
    compute.get(`/api/v1/workloads/${workloadId}/events`).respondWith(200, events)

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadEventsListCommand({ workloadId }))

    // assert
    assertEquals(response, events)
  })

  it("should accept an EMPTY events array — the cluster's TTL, not an error", async () => {
    // arrange — Kubernetes reaps events on about an hour's TTL, so a quiet
    // workload legitimately answers 200 with nothing at all.
    compute.get(`/api/v1/workloads/${workloadId}/events`).respondWith(200, { workloadId, events: [] })

    // act
    const response = await flowcoreClient.execute(new ComputeWorkloadEventsListCommand({ workloadId }))

    // assert
    assertEquals(response, { workloadId, events: [] })
  })

  it("should throw NotFoundException when a workload has no cluster events to read", async () => {
    // arrange
    compute
      .get(`/api/v1/workloads/${workloadId}/events`)
      .respondWith(404, { statusCode: 404, error: "Not Found", message: `Workload ${workloadId} not found` })

    // act
    const responsePromise = flowcoreClient.execute(new ComputeWorkloadEventsListCommand({ workloadId }))

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Workload not found: ${JSON.stringify({ workloadId })}`,
    )
  })

  it("should fetch historical logs from a BARE response with no success envelope", async () => {
    // arrange
    const logs: ComputeWorkloadLogs = {
      workloadId,
      container: "api",
      totalMatches: 1,
      logs: [
        {
          timestamp: "2026-08-01T10:11:00.000Z",
          podName: "workload-abc-1",
          container: "api",
          level: "error",
          message: "boom",
          stream: "stderr",
        },
      ],
    }
    compute
      .get(`/api/v1/workloads/${workloadId}/logs`)
      .matchSearchParams({ container: "api", limit: "50", search: "boom" })
      .respondWith(200, logs)

    // act
    const response = await flowcoreClient.execute(
      new ComputeWorkloadLogsFetchCommand({ workloadId, container: "api", limit: 50, search: "boom" }),
    )

    // assert
    assertEquals(response, logs)
  })

  // ── Domains ──

  it("should list a workload's domains and unwrap the success envelope", async () => {
    // arrange
    const domain = makeDomain()
    compute.get(`/api/v1/workloads/${workloadId}/domains`).respondWith(200, { success: true, domains: [domain] })

    // act
    const response = await flowcoreClient.execute(new ComputeDomainListCommand({ workloadId }))

    // assert
    assertEquals(response, [domain])
  })

  it("should attach a custom hostname with 202 and a BARE domain body, without leaking the path param", async () => {
    // arrange — the attach body is `.strict()` on BOTH branches of the XOR,
    // so a leaked `workloadId` would match neither and answer 422.
    const domain = makeDomain()
    compute
      .post(`/api/v1/workloads/${workloadId}/domains`)
      .matchBody({ hostname: "api.acme.org", targetPort: 8080, tls: { mode: "letsencrypt" } })
      .respondWith(202, domain)

    // act
    const response = await flowcoreClient.execute(
      new ComputeDomainAttachCommand({
        workloadId,
        hostname: "api.acme.org",
        targetPort: 8080,
        tls: { mode: "letsencrypt" },
      }),
    )

    // assert
    assertEquals(response, domain)
  })

  it("should attach a platform wildcard subdomain with 201", async () => {
    // arrange
    const domain = makeDomain({
      hostname: "acme.flowcore.app",
      status: "ready",
      verification: { type: "platform_wildcard", expectedTarget: "ingress.flowcore.io", verified: true },
      tls: { status: "issued", secretName: "compute-wildcard-tls", issuer: "letsencrypt-prod" },
    })
    compute
      .post(`/api/v1/workloads/${workloadId}/domains`)
      .matchBody({ subdomain: "acme", targetPort: 8080 })
      .respondWith(201, domain)

    // act
    const response = await flowcoreClient.execute(
      new ComputeDomainAttachCommand({ workloadId, subdomain: "acme", targetPort: 8080 }),
    )

    // assert
    assertEquals(response, domain)
  })

  it("should verify a domain and return the narrower BARE observation", async () => {
    // arrange
    const observed: ComputeDomainVerifyResponse = {
      domainId,
      hostname: "api.acme.org",
      status: "ready",
      verification: { type: "cname", expectedTarget: "ingress.flowcore.io", verified: true },
      tls: {
        status: "issued",
        secretName: `dom-${domainId}-tls`,
        issuer: "letsencrypt-prod",
        expiresAt: "2026-11-01T10:00:00.000Z",
      },
    }
    compute.post(`/api/v1/workloads/${workloadId}/domains/${domainId}/verify`).respondWith(200, observed)

    // act
    const response = await flowcoreClient.execute(new ComputeDomainVerifyCommand({ workloadId, domainId }))

    // assert
    assertEquals(response, observed)
  })

  it("should detach a domain and accept the synthetic 204 body", async () => {
    // arrange — the service sends an EMPTY body; FlowcoreClient substitutes
    // `{ status: 204 }` for it.
    compute.delete(`/api/v1/workloads/${workloadId}/domains/${domainId}`).respondWith(204)

    // act
    const response = await flowcoreClient.execute(new ComputeDomainDetachCommand({ workloadId, domainId }))

    // assert
    assertEquals(response, { status: 204 })
  })

  it("should throw NotFoundException when a domain is not found", async () => {
    // arrange
    compute
      .post(`/api/v1/workloads/${workloadId}/domains/${domainId}/verify`)
      .respondWith(404, { statusCode: 404, error: "Not Found", message: "Domain not found" })

    // act
    const responsePromise = flowcoreClient.execute(new ComputeDomainVerifyCommand({ workloadId, domainId }))

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Domain not found: ${JSON.stringify({ workloadId, domainId })}`,
    )
  })

  // ── Operations ──

  it("should fetch an operation from a BARE response with no success envelope", async () => {
    // arrange
    const operation = makeOperation({
      progress: {
        preSync: {
          name: "migrate",
          status: "succeeded",
          startedAt: "2026-08-01T10:05:01.000Z",
          completedAt: "2026-08-01T10:05:09.000Z",
        },
        deployment: { desiredReplicas: 2, updatedReplicas: 2, readyReplicas: 2 },
      },
    })
    compute.get(`/api/v1/operations/${operationId}`).respondWith(200, operation)

    // act
    const response = await flowcoreClient.execute(new ComputeOperationFetchCommand({ operationId }))

    // assert
    assertEquals(response, operation)
  })

  it("should throw NotFoundException when an operation is not found", async () => {
    // arrange
    compute
      .get(`/api/v1/operations/${operationId}`)
      .respondWith(404, { statusCode: 404, error: "Not Found", message: "Operation not found" })

    // act
    const responsePromise = flowcoreClient.execute(new ComputeOperationFetchCommand({ operationId }))

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Operation not found: ${JSON.stringify({ operationId })}`,
    )
  })

  // ── Registries ──

  it("should list registries and unwrap the success envelope", async () => {
    // arrange
    const registry = makeRegistry()
    compute
      .get("/api/v1/registries")
      .matchSearchParams({ tenantId })
      .respondWith(200, { success: true, registries: [registry] })

    // act
    const response = await flowcoreClient.execute(new ComputeRegistryListCommand({ tenantId }))

    // assert
    assertEquals(response, [registry])
  })

  it("should register a registry, sending the whole body and getting a BARE sanitized registry back", async () => {
    // arrange — this route carries its tenancy in the BODY, so there is no
    // path parameter to strip and the full input is the payload.
    const registry = makeRegistry()
    compute
      .post("/api/v1/registries")
      .matchBody({
        tenantId,
        name: "acme ghcr",
        serverUrl: "ghcr.io",
        username: "acme-bot",
        secret: "TEST_ONLY_NOT_A_REAL_SECRET",
        isDefault: true,
      })
      .respondWith(201, registry)

    // act
    const response = await flowcoreClient.execute(
      new ComputeRegistryRegisterCommand({
        tenantId,
        name: "acme ghcr",
        serverUrl: "ghcr.io",
        username: "acme-bot",
        secret: "TEST_ONLY_NOT_A_REAL_SECRET",
        isDefault: true,
      }),
    )

    // assert — no credential-bearing field exists on the read type at all.
    assertEquals(response, registry)
    assertEquals(Object.keys(response).includes("secret"), false)
  })

  it("should fetch a registry detail and unwrap the success envelope", async () => {
    // arrange
    const registry: ComputeRegistryDetail = {
      ...makeRegistry(),
      synthesisStatus: "synthesized",
      synthesisAt: "2026-08-01T10:00:05.000Z",
    }
    compute.get(`/api/v1/registries/${registryId}`).respondWith(200, { success: true, registry })

    // act
    const response = await flowcoreClient.execute(new ComputeRegistryFetchCommand({ registryId }))

    // assert
    assertEquals(response, registry)
  })

  it("should rotate a registry secret, sending ONLY the secret and never the path param", async () => {
    // arrange — the rotation body is `.strict()` and deliberately narrow, so a
    // leaked `registryId` would be a 422. `matchBody` pins that.
    const registry = makeRegistry({ updatedAt: "2026-08-02T09:00:00.000Z" })
    compute
      .patch(`/api/v1/registries/${registryId}`)
      .matchBody({ secret: "TEST_ONLY_ROTATED_SECRET" })
      .respondWith(200, registry)

    // act
    const response = await flowcoreClient.execute(
      new ComputeRegistryRotateCommand({ registryId, secret: "TEST_ONLY_ROTATED_SECRET" }),
    )

    // assert
    assertEquals(response, registry)
    assertEquals(response.updatedAt, "2026-08-02T09:00:00.000Z")
  })

  it("should remove a registry and accept the synthetic 204 body", async () => {
    // arrange
    compute.delete(`/api/v1/registries/${registryId}`).respondWith(204)

    // act
    const response = await flowcoreClient.execute(new ComputeRegistryRemoveCommand({ registryId }))

    // assert
    assertEquals(response, { status: 204 })
  })

  it("should throw NotFoundException when a registry is not found", async () => {
    // arrange
    compute
      .get(`/api/v1/registries/${registryId}`)
      .respondWith(404, { statusCode: 404, error: "Not Found", message: "Registry not found" })

    // act
    const responsePromise = flowcoreClient.execute(new ComputeRegistryFetchCommand({ registryId }))

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Registry not found: ${JSON.stringify({ registryId })}`,
    )
  })

  // ── Live log stream (SSE) ──

  it("should parse a multi-frame SSE stream into log events, in wire order", async () => {
    // arrange — a leading comment line, then three `event: log` frames.
    const frames = [
      ": stream opened",
      "",
      "event: log",
      'data: {"timestamp":"2026-08-01T10:00:00.000Z","pod":"api-0","container":"api","line":"first"}',
      "",
      "event: log",
      'data: {"timestamp":"2026-08-01T10:00:01.000Z","pod":"api-0","container":"api","line":"second"}',
      "",
      "event: log",
      'data: {"timestamp":"2026-08-01T10:00:02.000Z","pod":"api-1","container":"api","line":"third"}',
      "",
      "",
    ].join("\n")
    compute
      .get(`/api/v1/workloads/${workloadId}/logs/stream`)
      .matchSearchParams({ container: "api", tailLines: "50" })
      .respondWith(200, frames)

    // act
    const stream = await flowcoreClient.execute(
      new ComputeWorkloadLogStreamCommand({ workloadId, container: "api", tailLines: 50 }),
    )
    const events = await collect(stream.output$)

    // assert
    assertEquals(
      events.map((event) => event.line),
      ["first", "second", "third"],
    )
    assertEquals(events[0], {
      timestamp: "2026-08-01T10:00:00.000Z",
      pod: "api-0",
      container: "api",
      line: "first",
    })
    assertEquals(events[2].pod, "api-1")
  })

  it("should NOT emit heartbeat frames or comment lines as log events", async () => {
    // arrange
    const frames = [
      "event: heartbeat",
      "data: 2026-08-01T10:00:00.000Z",
      "",
      ": keep-alive",
      "",
      "event: log",
      'data: {"timestamp":"2026-08-01T10:00:01.000Z","pod":"api-0","container":"api","line":"only line"}',
      "",
      "event: heartbeat",
      "data: 2026-08-01T10:00:15.000Z",
      "",
      "",
    ].join("\n")
    compute.get(`/api/v1/workloads/${workloadId}/logs/stream`).respondWith(200, frames)

    // act
    const stream = await flowcoreClient.execute(new ComputeWorkloadLogStreamCommand({ workloadId }))
    const events = await collect(stream.output$)

    // assert — the heartbeats kept the connection alive and nothing else.
    assertEquals(events.length, 1)
    assertEquals(events[0].line, "only line")
  })

  it("should surface a mid-stream error frame as an observable error, not a silent completion", async () => {
    // arrange — the service commits a 200, streams one log line, then hits a
    // failure and writes `event: error`. Dropping that frame would complete
    // the stream normally and the caller could not tell "the logs ended" from
    // "streaming broke".
    const frames = [
      "event: log",
      'data: {"timestamp":"2026-08-01T10:00:00.000Z","pod":"api-0","container":"api","line":"before the failure"}',
      "",
      "event: error",
      'data: {"message":"pod log stream closed unexpectedly"}',
      "",
      "",
    ].join("\n")
    compute.get(`/api/v1/workloads/${workloadId}/logs/stream`).respondWith(200, frames)

    // act
    const stream = await flowcoreClient.execute(new ComputeWorkloadLogStreamCommand({ workloadId }))
    const seen: ComputeLogStreamEvent[] = []
    const failure = await new Promise<unknown>((resolve) => {
      stream.output$.subscribe({
        next: (event) => seen.push(event),
        error: (error) => resolve(error),
        complete: () => resolve(null),
      })
    })

    // assert — the lines before the failure are delivered, THEN it errors.
    assertEquals(seen.length, 1)
    assertEquals(seen[0].line, "before the failure")
    assertEquals(failure instanceof Error, true)
    assertEquals((failure as Error).message.includes("pod log stream closed unexpectedly"), true)
  })

  it("should still error when an error frame carries a payload that is not the expected JSON", async () => {
    // arrange — a mid-stream failure is exactly the moment not to add a second
    // failure mode, so an unparseable payload falls back to the raw text
    // rather than throwing inside the parser.
    const frames = ["event: error", "data: upstream exploded", "", ""].join("\n")
    compute.get(`/api/v1/workloads/${workloadId}/logs/stream`).respondWith(200, frames)

    // act
    const stream = await flowcoreClient.execute(new ComputeWorkloadLogStreamCommand({ workloadId }))
    const failure = await new Promise<unknown>((resolve) => {
      stream.output$.subscribe({ error: (error) => resolve(error), complete: () => resolve(null) })
    })

    // assert
    assertEquals(failure instanceof Error, true)
    assertEquals((failure as Error).message.includes("upstream exploded"), true)
  })

  it("should concatenate a data payload split across multiple data lines", async () => {
    // arrange — one frame whose JSON is spread over three `data:` fields. Per
    // the SSE spec they are joined with a newline, which keeps the JSON valid.
    const frames = [
      "event: log",
      'data: {"timestamp":"2026-08-01T10:00:00.000Z",',
      'data: "pod":"api-0","container":"api",',
      'data: "line":"joined across data lines"}',
      "",
      "",
    ].join("\n")
    compute.get(`/api/v1/workloads/${workloadId}/logs/stream`).respondWith(200, frames)

    // act
    const stream = await flowcoreClient.execute(new ComputeWorkloadLogStreamCommand({ workloadId }))
    const events = await collect(stream.output$)

    // assert
    assertEquals(events.length, 1)
    assertEquals(events[0].line, "joined across data lines")
    assertEquals(events[0].pod, "api-0")
  })

  it("should reassemble frames split across network chunk boundaries", async () => {
    // arrange — the frame delimiter, the field name and the JSON are all cut
    // mid-token, which is what a real socket does.
    const chunks = [
      "event: lo",
      'g\ndata: {"timestamp":"2026-08-01T10:00:00.000Z","pod":"api-0",',
      '"container":"api","line":"chunked"}\n',
      '\nevent: log\ndata: {"timestamp":"2026-08-01T10:00:01.000Z","pod":"api-0","container":"api",',
      '"line":"second chunked"}\n\n',
    ]

    // act
    const stream = await withStubbedFetch(
      () =>
        Promise.resolve(
          sseResponse(
            new ReadableStream<Uint8Array>({
              start(controller) {
                for (const chunk of chunks) {
                  controller.enqueue(encoder.encode(chunk))
                }
                controller.close()
              },
            }),
          ),
        ),
      () => flowcoreClient.execute(new ComputeWorkloadLogStreamCommand({ workloadId })),
    )
    const events = await collect(stream.output$)

    // assert
    assertEquals(
      events.map((event) => event.line),
      ["chunked", "second chunked"],
    )
  })

  it("should abort the underlying fetch when the caller disconnects", async () => {
    // arrange — a stream that emits once and then never closes, so the only
    // way out is the caller's disconnect.
    let capturedSignal: AbortSignal | undefined
    const stream = await withStubbedFetch(
      (_input, init) => {
        capturedSignal = init?.signal ?? undefined
        return Promise.resolve(
          sseResponse(
            new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(
                  encoder.encode(
                    'event: log\ndata: {"timestamp":"2026-08-01T10:00:00.000Z","pod":"api-0","container":"api","line":"live"}\n\n',
                  ),
                )
                // Deliberately never closed.
              },
            }),
          ),
        )
      },
      () => flowcoreClient.execute(new ComputeWorkloadLogStreamCommand({ workloadId })),
    )

    const received: ComputeLogStreamEvent[] = []
    let completed = false
    stream.output$.subscribe({
      next: (event) => received.push(event),
      complete: () => {
        completed = true
      },
    })
    await waitFor(() => received.length === 1)

    // assert — still open before the disconnect
    assertEquals(capturedSignal?.aborted, false)
    assertEquals(completed, false)

    // act
    stream.disconnect()

    // assert — the fetch is really aborted and the observable completes
    assertEquals(capturedSignal?.aborted, true)
    await waitFor(() => completed)
    assertEquals(received.length, 1)

    // and it is idempotent
    stream.disconnect()
  })

  it("should throw NotFoundException when the stream 404s before it opens", async () => {
    // arrange — 404/502/503 are produced BEFORE the first chunk, so the status
    // is still meaningful and can be mapped.
    compute.get(`/api/v1/workloads/${workloadId}/logs/stream`).respondWith(404, {
      statusCode: 404,
      error: "Not Found",
      message: `Workload ${workloadId} has no running pods to stream`,
    })

    // act
    const responsePromise = flowcoreClient.execute(new ComputeWorkloadLogStreamCommand({ workloadId }))

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Workload not found: ${JSON.stringify({ workloadId })}`,
    )
  })
})
