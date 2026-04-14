import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import {
  DataPathwayAssignmentCompleteCommand,
  DataPathwayAssignmentExpireLeasesCommand,
  DataPathwayAssignmentFetchCommand,
  DataPathwayAssignmentHeartbeatCommand,
  DataPathwayAssignmentListCommand,
  DataPathwayAssignmentNextCommand,
  DataPathwayCapacityFetchCommand,
  DataPathwayCommandDispatchConfigUpdateCommand,
  DataPathwayCommandDispatchRestartCommand,
  DataPathwayCommandDispatchStopCommand,
  DataPathwayCommandFetchCommand,
  DataPathwayCommandPendingByPathwayCommand,
  DataPathwayCommandPendingCommand,
  DataPathwayCommandUpdateStatusByPathwayCommand,
  DataPathwayCommandUpdateStatusCommand,
  DataPathwayCreateCommand,
  DataPathwayDeliveryLogBatchCommand,
  DataPathwayDisableCommand,
  DataPathwayFetchByNameCommand,
  DataPathwayFetchCommand,
  DataPathwayListCommand,
  DataPathwayPumpStateFetchCommand,
  DataPathwayPumpStateSaveCommand,
  DataPathwayQuotaFetchCommand,
  DataPathwayQuotaListCommand,
  DataPathwayQuotaSetCommand,
  DataPathwayRestartFetchCommand,
  DataPathwayRestartRequestCommand,
  DataPathwaySlotDeregisterCommand,
  DataPathwaySlotFetchCommand,
  DataPathwaySlotHeartbeatCommand,
  DataPathwaySlotListCommand,
  DataPathwaySlotRegisterCommand,
  DataPathwayUpsertByNameCommand,
  FlowcoreClient,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("DataPathways", () => {
  const fetchMocker = new FetchMocker()
  const bearerClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const apiKeyClient = new FlowcoreClient({ apiKeyId: "key-id", apiKey: "key-secret" })
  const base = fetchMocker.mock("https://data-pathways.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  // ── Pathways ──

  it("should create a pathway", async () => {
    const id = crypto.randomUUID()
    const response = { pathwayId: id, status: "created" }

    base.put(`/api/v1/pathways/${id}`)
      .matchBody({ tenant: "t1", dataCore: "dc1", sizeClass: "small" })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayCreateCommand({ id, tenant: "t1", dataCore: "dc1", sizeClass: "small" }),
    )
    assertEquals(result, response)
  })

  it("should create a virtual pathway", async () => {
    const id = crypto.randomUUID()
    const response = { pathwayId: id, status: "created" }

    base.put(`/api/v1/pathways/${id}`)
      .matchBody({
        tenant: "t1",
        dataCore: "dc1",
        sizeClass: "small",
        type: "virtual",
        virtualConfig: {
          flowTypes: ["pathway.0", "restart.0"],
        },
      })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayCreateCommand({
        id,
        tenant: "t1",
        dataCore: "dc1",
        sizeClass: "small",
        type: "virtual",
        virtualConfig: {
          flowTypes: ["pathway.0", "restart.0"],
        },
      }),
    )
    assertEquals(result, response)
  })

  it("should fetch a virtual pathway with virtualConfig", async () => {
    const id = crypto.randomUUID()
    const pathway = {
      id,
      tenant: "t1",
      dataCore: "dc1",
      sizeClass: "small" as const,
      type: "virtual" as const,
      enabled: true,
      priority: 0,
      version: 1,
      labels: {},
      virtualConfig: {
        flowTypes: ["pathway.0"],
      },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    base.get(`/api/v1/pathways/${id}`).respondWith(200, pathway)

    const result = await bearerClient.execute(new DataPathwayFetchCommand({ id }))
    assertEquals(result, pathway)
  })

  it("should fetch a pathway", async () => {
    const id = crypto.randomUUID()
    const pathway = {
      id,
      tenant: "t1",
      dataCore: "dc1",
      sizeClass: "small" as const,
      enabled: true,
      priority: 0,
      version: 1,
      labels: {},
      config: {
        sources: [
          {
            flowType: "orders",
            eventTypes: ["order.created"],
            endpoints: [{ url: "https://example.com/webhook" }],
          },
        ],
      },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    base.get(`/api/v1/pathways/${id}`).respondWith(200, pathway)

    const result = await bearerClient.execute(new DataPathwayFetchCommand({ id }))
    assertEquals(result, pathway)
  })

  it("should list pathways", async () => {
    const response = { pathways: [], total: 0 }

    base.get("/api/v1/pathways")
      .matchSearchParams({ tenant: "t1", limit: "10" })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayListCommand({ tenant: "t1", limit: 10 }),
    )
    assertEquals(result, response)
  })

  it("should disable a pathway", async () => {
    const id = crypto.randomUUID()
    const response = { pathwayId: id, status: "disabled" }

    base.post(`/api/v1/pathways/${id}/disable`)
      .matchBody({ reason: "maintenance" })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayDisableCommand({ id, reason: "maintenance" }),
    )
    assertEquals(result, response)
  })

  // ── Slots ──

  it("should register a slot", async () => {
    const slotId = crypto.randomUUID()
    const podUnitId = crypto.randomUUID()
    const response = { slotId, status: "registered" }

    base.post("/api/v1/slots/register")
      .matchBody({ slotId, podUnitId, class: "small", version: "1.0.0" })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwaySlotRegisterCommand({ slotId, podUnitId, class: "small", version: "1.0.0" }),
    )
    assertEquals(result, response)
  })

  it("should list slots", async () => {
    const response = { slots: [], total: 0 }

    base.get("/api/v1/slots")
      .matchSearchParams({ class: "small" })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwaySlotListCommand({ class: "small" }),
    )
    assertEquals(result, response)
  })

  it("should fetch a slot", async () => {
    const id = crypto.randomUUID()
    const slot = {
      id,
      podUnitId: crypto.randomUUID(),
      class: "small" as const,
      labels: {},
      lastSeen: "2025-01-01T00:00:00Z",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    base.get(`/api/v1/slots/${id}`).respondWith(200, slot)

    const result = await apiKeyClient.execute(new DataPathwaySlotFetchCommand({ id }))
    assertEquals(result, slot)
  })

  it("should deregister a slot", async () => {
    const id = crypto.randomUUID()
    const response = { slotId: id, status: "deregistered" }

    base.post(`/api/v1/slots/${id}/deregister`)
      .matchBody({ reason: "shutdown" })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwaySlotDeregisterCommand({ id, reason: "shutdown" }),
    )
    assertEquals(result, response)
  })

  it("should send slot heartbeat", async () => {
    const id = crypto.randomUUID()
    const response = { slotId: id, status: "ok" }

    base.post(`/api/v1/slots/${id}/heartbeat`)
      .matchBody({})
      .respondWith(200, response)

    const result = await apiKeyClient.execute(new DataPathwaySlotHeartbeatCommand({ id }))
    assertEquals(result, response)
  })

  // ── Assignments ──

  it("should request next assignment", async () => {
    const slotId = crypto.randomUUID()
    const assignmentId = crypto.randomUUID()
    const pathwayId = crypto.randomUUID()
    const pumpConfig = {
      sources: [
        {
          flowType: "orders",
          eventTypes: ["order.created"],
          endpoints: [{ url: "https://example.com/webhook" }],
        },
      ],
      dataSource: { tenant: "t1", dataCore: "dc1" },
      auth: { apiKey: "key-123" },
    }
    const response = {
      assignment: {
        assignmentId,
        pathwayId,
        slotId,
        generation: 1,
        config: pumpConfig,
        leaseTTL: "2025-01-01T01:00:00Z",
        status: "active",
      },
    }

    base.post("/api/v1/assignments/next")
      .matchBody({ slotId, class: "small" })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayAssignmentNextCommand({ slotId, class: "small" }),
    )
    assertEquals(result, response)
  })

  it("should send assignment heartbeat", async () => {
    const slotId = crypto.randomUUID()
    const assignmentId = crypto.randomUUID()
    const pathwayId = crypto.randomUUID()

    base.post("/api/v1/assignments/heartbeat")
      .matchBody({ slotId, assignmentId, pathwayId, metrics: { lagSeconds: 5 } })
      .respondWith(200, {})

    const result = await apiKeyClient.execute(
      new DataPathwayAssignmentHeartbeatCommand({
        slotId,
        assignmentId,
        pathwayId,
        metrics: { lagSeconds: 5 },
      }),
    )
    assertEquals(result, null)
  })

  it("should complete an assignment", async () => {
    const slotId = crypto.randomUUID()
    const assignmentId = crypto.randomUUID()
    const pathwayId = crypto.randomUUID()

    base.post("/api/v1/assignments/complete")
      .matchBody({ slotId, assignmentId, pathwayId, outcome: "completed" })
      .respondWith(200, {})

    const result = await apiKeyClient.execute(
      new DataPathwayAssignmentCompleteCommand({
        slotId,
        assignmentId,
        pathwayId,
        outcome: "completed",
      }),
    )
    assertEquals(result, null)
  })

  it("should list assignments", async () => {
    const response = { assignments: [], total: 0 }

    base.get("/api/v1/assignments")
      .matchSearchParams({ status: "active" })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayAssignmentListCommand({ status: "active" }),
    )
    assertEquals(result, response)
  })

  it("should fetch an assignment", async () => {
    const id = crypto.randomUUID()
    const assignment = {
      id,
      pathwayId: crypto.randomUUID(),
      slotId: crypto.randomUUID(),
      generation: 1,
      leaseTTL: "2025-01-01T01:00:00Z",
      status: "active",
      config: {
        sources: [
          {
            flowType: "orders",
            eventTypes: ["order.created"],
            endpoints: [{ url: "https://example.com/webhook" }],
          },
        ],
        dataSource: { tenant: "t1", dataCore: "dc1" },
      },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    base.get(`/api/v1/assignments/${id}`).respondWith(200, assignment)

    const result = await bearerClient.execute(new DataPathwayAssignmentFetchCommand({ id }))
    assertEquals(result, assignment)
  })

  it("should expire leases", async () => {
    const response = { expired: 3 }

    base.post("/api/v1/assignments/expire-leases").respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayAssignmentExpireLeasesCommand({}),
    )
    assertEquals(result, response)
  })

  // ── Commands ──

  it("should get pending commands", async () => {
    const assignmentId = crypto.randomUUID()
    const response = { commands: [] }

    base.get(`/api/v1/assignments/${assignmentId}/commands/pending`).respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayCommandPendingCommand({ assignmentId }),
    )
    assertEquals(result, response)
  })

  it("should dispatch a restart command", async () => {
    const assignmentId = crypto.randomUUID()
    const commandId = crypto.randomUUID()
    const response = { commandId, phase: "dispatched" }

    base.post(`/api/v1/assignments/${assignmentId}/commands/datapump-restart`)
      .matchBody({ generation: 1, position: { timeBucket: "2025-01-01T00:00:00Z" } })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayCommandDispatchRestartCommand({
        assignmentId,
        generation: 1,
        position: { timeBucket: "2025-01-01T00:00:00Z" },
      }),
    )
    assertEquals(result, response)
  })

  it("should dispatch a stop command", async () => {
    const assignmentId = crypto.randomUUID()
    const commandId = crypto.randomUUID()
    const response = { commandId, phase: "dispatched" }

    base.post(`/api/v1/assignments/${assignmentId}/commands/stop`)
      .matchBody({ generation: 1, reason: "scaling down" })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayCommandDispatchStopCommand({
        assignmentId,
        generation: 1,
        reason: "scaling down",
      }),
    )
    assertEquals(result, response)
  })

  it("should update command status", async () => {
    const assignmentId = crypto.randomUUID()
    const commandId = crypto.randomUUID()
    const response = { commandId, phase: "acknowledged" }

    base.post(`/api/v1/assignments/${assignmentId}/commands/${commandId}/status`)
      .matchBody({ phase: "acknowledged" })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayCommandUpdateStatusCommand({
        assignmentId,
        commandId,
        phase: "acknowledged",
      }),
    )
    assertEquals(result, response)
  })

  // ── Restarts ──

  it("should request a restart", async () => {
    const restartRequestId = crypto.randomUUID()
    const response = {
      restartRequestId,
      acceptedTargets: ["pathway-1"],
      skippedTargets: [],
    }

    base.post("/api/v1/restarts/request")
      .matchBody({
        targets: { pathwayIds: ["pathway-1"] },
        position: { timeBucket: "2025-01-01T00:00:00Z" },
        requestedBy: "admin",
      })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayRestartRequestCommand({
        targets: { pathwayIds: ["pathway-1"] },
        position: { timeBucket: "2025-01-01T00:00:00Z" },
        requestedBy: "admin",
      }),
    )
    assertEquals(result, response)
  })

  it("should request a restart targeting virtual pathway", async () => {
    const restartRequestId = crypto.randomUUID()
    const virtualPathwayId = crypto.randomUUID()
    const response = {
      restartRequestId,
      acceptedTargets: [virtualPathwayId],
      skippedTargets: [],
    }

    base.post("/api/v1/restarts/request")
      .matchBody({
        targets: { pathwayIds: [virtualPathwayId] },
        position: { timeBucket: "2025-01-01T00:00:00Z" },
        requestedBy: "admin",
      })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayRestartRequestCommand({
        targets: { pathwayIds: [virtualPathwayId] },
        position: { timeBucket: "2025-01-01T00:00:00Z" },
        requestedBy: "admin",
      }),
    )
    assertEquals(result, response)
  })

  it("should fetch a restart request", async () => {
    const id = crypto.randomUUID()
    const restart = {
      id,
      targets: { pathwayIds: ["p1"] },
      mode: "datapumpRestart",
      position: { timeBucket: "2025-01-01T00:00:00Z" },
      status: "pending",
      requestedBy: "admin",
      reason: null,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    base.get(`/api/v1/restarts/${id}`).respondWith(200, restart)

    const result = await bearerClient.execute(new DataPathwayRestartFetchCommand({ id }))
    assertEquals(result, restart)
  })

  // ── Capacity ──

  it("should fetch capacity", async () => {
    const response = {
      slots: {
        small: { free: 5, used: 3 },
        medium: { free: 2, used: 1 },
        high: { free: 1, used: 0 },
      },
      pendingAssignments: { small: 1, medium: 0, high: 0 },
    }

    base.get("/api/v1/capacity").respondWith(200, response)

    const result = await bearerClient.execute(new DataPathwayCapacityFetchCommand({}))
    assertEquals(result, response)
  })

  // ── Quotas ──

  it("should set a quota", async () => {
    const response = { tenant: "t1", status: "set" }

    base.put("/api/v1/quotas/t1")
      .matchBody({ maxSlots: { small: 10, medium: 5, high: 2 } })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayQuotaSetCommand({
        tenant: "t1",
        maxSlots: { small: 10, medium: 5, high: 2 },
      }),
    )
    assertEquals(result, response)
  })

  it("should fetch a quota", async () => {
    const response = {
      tenant: "t1",
      maxSlots: { small: 10, medium: 5, high: 2 },
      used: { small: 3, medium: 1, high: 0 },
    }

    base.get("/api/v1/quotas/t1").respondWith(200, response)

    const result = await bearerClient.execute(new DataPathwayQuotaFetchCommand({ tenant: "t1" }))
    assertEquals(result, response)
  })

  it("should list quotas", async () => {
    const response = { quotas: [], total: 0 }

    base.get("/api/v1/quotas").respondWith(200, response)

    const result = await bearerClient.execute(new DataPathwayQuotaListCommand({}))
    assertEquals(result, response)
  })

  // ── Pump State ──

  it("should fetch pump state by pathway + flowType", async () => {
    const pathwayId = crypto.randomUUID()
    const flowType = "data.0"
    const response = {
      pathwayId,
      flowType,
      state: { timeBucket: "2025-01-01T00:00:00Z", eventId: "evt-1" },
    }

    base.get(`/api/v1/pump-states/${pathwayId}/${flowType}`).respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayPumpStateFetchCommand({ pathwayId, flowType }),
    )
    assertEquals(result, response)
  })

  it("should save pump state by pathway + flowType", async () => {
    const pathwayId = crypto.randomUUID()
    const flowType = "data.0"
    const response = { status: "saved" }

    base.post(`/api/v1/pump-states/${pathwayId}/${flowType}`)
      .matchBody({ state: { timeBucket: "2025-01-01T00:00:00Z" } })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayPumpStateSaveCommand({
        pathwayId,
        flowType,
        state: { timeBucket: "2025-01-01T00:00:00Z" },
      }),
    )
    assertEquals(result, response)
  })

  // ── Command Fetch (GET /api/v1/commands/:commandId) ──

  it("should fetch a command by id", async () => {
    const commandId = crypto.randomUUID()
    const assignmentId = crypto.randomUUID()
    const response = {
      id: commandId,
      restartRequestId: null,
      assignmentId,
      pathwayId: null,
      type: "stop",
      generation: 1,
      position: null,
      stopAt: null,
      timeoutMs: null,
      phase: "dispatched",
      reason: "test stop",
      details: null,
      config: null,
      sourceFlowTypes: null,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    base.get(`/api/v1/commands/${commandId}`).respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayCommandFetchCommand({ commandId }),
    )
    assertEquals(result, response)
  })

  // ── Commands: dispatch config update ──

  it("should dispatch config update command", async () => {
    const assignmentId = crypto.randomUUID()
    const response = { commandId: crypto.randomUUID(), phase: "dispatched" }

    base.post(`/api/v1/assignments/${assignmentId}/commands/config-update`)
      .matchBody({ generation: 1, config: { foo: "bar" } })
      .respondWith(200, response)

    const result = await bearerClient.execute(
      new DataPathwayCommandDispatchConfigUpdateCommand({
        assignmentId,
        generation: 1,
        config: { foo: "bar" },
      }),
    )
    assertEquals(result, response)
  })

  // ── Virtual pathway command polling ──

  it("should fetch pending commands by pathway", async () => {
    const pathwayId = crypto.randomUUID()
    const response = { commands: [] }

    base.get(`/api/v1/pathways/${pathwayId}/commands/pending`).respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayCommandPendingByPathwayCommand({ pathwayId }),
    )
    assertEquals(result, response)
  })

  it("should update command status by pathway", async () => {
    const pathwayId = crypto.randomUUID()
    const commandId = crypto.randomUUID()
    const response = { commandId, phase: "acknowledged" }

    base.post(`/api/v1/pathways/${pathwayId}/commands/${commandId}/status`)
      .matchBody({ phase: "acknowledged" })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayCommandUpdateStatusByPathwayCommand({
        pathwayId,
        commandId,
        phase: "acknowledged",
      }),
    )
    assertEquals(result, response)
  })

  // ── Pathway by-name ──

  it("should fetch pathway by name", async () => {
    const name = "my-pathway"
    const tenant = "test-tenant"
    const response = {
      id: crypto.randomUUID(),
      tenant,
      name,
      dataCore: "dc-1",
      sizeClass: "small" as const,
      type: "virtual" as const,
      enabled: true,
      priority: 0,
      version: 1,
      labels: {},
      config: { sources: [] },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    }

    base.get(`/api/v1/pathways/by-name/${name}`)
      .matchSearchParams({ tenant })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayFetchByNameCommand({ name, tenant }),
    )
    assertEquals(result, response)
  })

  it("should upsert pathway by name", async () => {
    const name = "my-pathway"
    const response = { pathwayId: crypto.randomUUID(), status: "created" as const }

    base.put(`/api/v1/pathways/by-name/${name}`)
      .matchBody({ tenant: "test-tenant", dataCore: "dc-1", type: "virtual" })
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayUpsertByNameCommand({
        name,
        tenant: "test-tenant",
        dataCore: "dc-1",
        type: "virtual",
      }),
    )
    assertEquals(result, response)
  })

  // ── Delivery log batch ──

  it("should upload delivery log batch", async () => {
    const pathwayId = crypto.randomUUID()
    const assignmentId = crypto.randomUUID()
    const response = { inserted: 1 }

    base.post("/api/v1/delivery-log/batch")
      .respondWith(200, response)

    const result = await apiKeyClient.execute(
      new DataPathwayDeliveryLogBatchCommand({
        entries: [{
          pathwayId,
          assignmentId,
          endpointUrl: "https://example.com/webhook",
          success: true,
        }],
      }),
    )
    assertEquals(result, response)
  })
})
