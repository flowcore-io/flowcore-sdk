import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { tenantCache } from "../../../src/common/tenant.cache.ts"
import type { Scenario } from "../../../src/contracts/scenario.ts"
import {
  FlowcoreClient,
  NotFoundException,
  ScenarioCreateCommand,
  ScenarioDeleteCommand,
  ScenarioFetchCommand,
  ScenarioListCommand,
  ScenarioUpdateCommand
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("Scenario", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://scenario-2.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
    tenantCache.clear()
  })
  afterAll(() => {
    fetchMocker.restore()
  })

  it("should fetch a scenario by id", async () => {
    // arrange
    const scenario: Scenario = {
      id: crypto.randomUUID(),
      name: "test-scenario",
      tenantId: crypto.randomUUID(),
      displayName: "Test Scenario",
      description: "Test scenario description",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fetchMockerBuilder.get(`/api/v1/scenarios/${scenario.id}`)
      .respondWith(200, scenario)

    // act
    const command = new ScenarioFetchCommand({ scenarioId: scenario.id })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, scenario)
  })

  it("should fetch a scenario by tenantId and name", async () => {
    // arrange
    const scenario: Scenario = {
      id: crypto.randomUUID(),
      name: "test-scenario",
      tenantId: crypto.randomUUID(),
      displayName: "Test Scenario",
      description: "Test scenario description",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fetchMockerBuilder.get(`/api/v1/scenarios/tenant/${scenario.tenantId}/name/${scenario.name}`)
      .persisted()
      .respondWith(200, scenario)

    // act
    const command = new ScenarioFetchCommand({ tenantId: scenario.tenantId, name: scenario.name })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, scenario)
  })

  it("should throw NotFoundException when scenario is not found by id", async () => {
    const scenarioId = crypto.randomUUID()
    // arrange
    fetchMockerBuilder.get(`/api/v1/scenarios/${scenarioId}`)
      .persisted()
      .respondWith(404, { message: "Scenario not found" })

    // act
    const command = new ScenarioFetchCommand({ scenarioId })
    const responsePromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Scenario not found: ${JSON.stringify({ id: scenarioId })}`,
    )
  })

  it("should throw NotFoundException when scenario is not found by name and tenantId", async () => {
    const tenantId = crypto.randomUUID()
    const name = "test-scenario"
    // arrange
    fetchMockerBuilder.get(`/api/v1/scenarios/tenant/${tenantId}/name/${name}`)
      .persisted()
      .respondWith(404, { message: "Scenario not found" })

    // act
    const command = new ScenarioFetchCommand({ tenantId, name })
    const responsePromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsePromise,
      NotFoundException,
      `Scenario not found: ${JSON.stringify({ name, tenantId })}`,
    )
  })

  it("should create a scenario", async () => {
    // arrange
    const tenantId = crypto.randomUUID()
    const input = {
      tenantId,
      name: "test-scenario",
      description: "Test scenario description",
      displayName: "Test Scenario",
    }
    
    const scenario: Scenario = {
      id: crypto.randomUUID(),
      tenantId,
      name: input.name,
      description: input.description,
      displayName: input.displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fetchMockerBuilder.post(`/api/v1/scenarios`)
      .matchBody(input)
      .persisted()
      .respondWith(201, scenario)

    // act
    const command = new ScenarioCreateCommand(input)
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, scenario)
  })

  it("should update a scenario", async () => {
    // arrange
    const scenarioId = crypto.randomUUID()
    const tenantId = crypto.randomUUID()
    const input = {
      scenarioId,
      description: "Updated description",
      displayName: "Updated Display Name",
    }
    
    const scenario: Scenario = {
      id: scenarioId,
      tenantId,
      name: "test-scenario",
      description: input.description,
      displayName: input.displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fetchMockerBuilder.patch(`/api/v1/scenarios/${scenarioId}`)
      .matchBody({
        description: input.description,
        displayName: input.displayName,
      })
      .respondWith(200, scenario)

    // act
    const command = new ScenarioUpdateCommand(input)
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, scenario)
  })

  it("should delete a scenario", async () => {
    // arrange
    const scenarioId = crypto.randomUUID()

    fetchMockerBuilder.delete(`/api/v1/scenarios/${scenarioId}`)
      .persisted()
      .respondWith(200, { success: true })

    // act
    const command = new ScenarioDeleteCommand({ scenarioId })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, { success: true })
  })

  it("should list scenarios for a tenant", async () => {
    // arrange
    const tenantId = crypto.randomUUID()
    const scenarios: Scenario[] = [
      {
        id: crypto.randomUUID(),
        tenantId,
        name: "scenario-1",
        displayName: "Scenario 1",
        description: "First test scenario",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        tenantId,
        name: "scenario-2",
        displayName: "Scenario 2",
        description: "Second test scenario",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const listOutput = {
      id: tenantId,
      scenarios,
    }

    fetchMockerBuilder.get(`/api/v1/scenarios/tenant/${tenantId}`)
      .persisted()
      .respondWith(200, listOutput)

    // act
    const command = new ScenarioListCommand({ tenantId })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, listOutput)
  })

  it("should partially update a scenario with only description", async () => {
    // arrange
    const scenarioId = crypto.randomUUID()
    const tenantId = crypto.randomUUID()
    const input = {
      scenarioId,
      description: "Updated description only",
    }
    
    const originalScenario: Scenario = {
      id: scenarioId,
      tenantId,
      name: "test-scenario",
      displayName: "Original Display Name",
      description: "Original description",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    const updatedScenario: Scenario = {
      id: scenarioId,
      tenantId,
      name: "test-scenario",
      displayName: "Original Display Name", // This should remain unchanged
      description: input.description, // Only this should be updated
      createdAt: originalScenario.createdAt,
      updatedAt: new Date().toISOString(), // This would be updated
    }

    fetchMockerBuilder.patch(`/api/v1/scenarios/${scenarioId}`)
      .matchBody({
        description: input.description,
      })
      .respondWith(200, updatedScenario)

    // act
    const command = new ScenarioUpdateCommand(input)
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, updatedScenario)
    assertEquals(response.description, input.description)
    assertEquals(response.displayName, originalScenario.displayName) // Verify other fields remain unchanged
  })
})

