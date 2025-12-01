import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { tenantCache } from "../../../src/common/tenant.cache.ts"
import type {
  LegacyScenario,
  LegacyScenarioAdapterState,
  LegacyScenarioListItem,
} from "../../../src/contracts/legacy-scenario.ts"
import {
  FlowcoreClient,
  InvalidResponseException,
  LegacyScenarioAdapterFetchStateCommand,
  LegacyScenarioAdapterRestartCommand,
  LegacyScenarioDeleteCommand,
  LegacyScenarioFetchCommand,
  LegacyScenarioListCommand,
  NotFoundException,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("Legacy Scenario", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://graph.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
    tenantCache.clear()
  })
  afterAll(() => {
    fetchMocker.restore()
  })

  describe("LegacyScenarioListCommand", () => {
    it("should list legacy scenarios in an organization", async () => {
      // arrange
      const organizationId = crypto.randomUUID()
      const scenarios: LegacyScenarioListItem[] = [
        {
          id: crypto.randomUUID(),
          name: "legacy-scenario-1",
          description: "First legacy scenario",
          flowcoreUserId: crypto.randomUUID(),
          deploymentState: "DEPLOYED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastDeployed: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: "legacy-scenario-2",
          description: "Second legacy scenario",
          flowcoreUserId: crypto.randomUUID(),
          deploymentState: "NOT_DEPLOYED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetScenariosInOrganization($organizationId: ID!) {
  organization(search: { id: $organizationId }) {
    id
    scenarios {
      id
      name
      description
      flowcoreUserId
      deploymentState
      createdAt
      updatedAt
      lastDeployed
    }
  }
}
`,
          variables: { organizationId },
        })
        .respondWith(200, {
          data: {
            organization: {
              id: organizationId,
              scenarios,
            },
          },
        })

      // act
      const command = new LegacyScenarioListCommand({ organizationId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.organizationId, organizationId)
      assertEquals(response.scenarios, scenarios)
    })

    it("should return empty array when organization has no scenarios", async () => {
      // arrange
      const organizationId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetScenariosInOrganization($organizationId: ID!) {
  organization(search: { id: $organizationId }) {
    id
    scenarios {
      id
      name
      description
      flowcoreUserId
      deploymentState
      createdAt
      updatedAt
      lastDeployed
    }
  }
}
`,
          variables: { organizationId },
        })
        .respondWith(200, {
          data: {
            organization: {
              id: organizationId,
              scenarios: [],
            },
          },
        })

      // act
      const command = new LegacyScenarioListCommand({ organizationId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.organizationId, organizationId)
      assertEquals(response.scenarios, [])
    })

    it("should throw InvalidResponseException when organization is not found", async () => {
      // arrange
      const organizationId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetScenariosInOrganization($organizationId: ID!) {
  organization(search: { id: $organizationId }) {
    id
    scenarios {
      id
      name
      description
      flowcoreUserId
      deploymentState
      createdAt
      updatedAt
      lastDeployed
    }
  }
}
`,
          variables: { organizationId },
        })
        .persisted()
        .respondWith(200, {
          data: {
            organization: null,
          },
        })

      // act
      const command = new LegacyScenarioListCommand({ organizationId })
      const responsePromise = flowcoreClient.execute(command)

      // assert
      await assertRejects(
        () => responsePromise,
        InvalidResponseException,
        "Organization not found in response",
      )
    })

    it("should throw InvalidResponseException when GraphQL returns errors", async () => {
      // arrange
      const organizationId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetScenariosInOrganization($organizationId: ID!) {
  organization(search: { id: $organizationId }) {
    id
    scenarios {
      id
      name
      description
      flowcoreUserId
      deploymentState
      createdAt
      updatedAt
      lastDeployed
    }
  }
}
`,
          variables: { organizationId },
        })
        .persisted()
        .respondWith(200, {
          errors: [{ message: "Access denied" }],
        })

      // act
      const command = new LegacyScenarioListCommand({ organizationId })
      const responsePromise = flowcoreClient.execute(command)

      // assert
      await assertRejects(
        () => responsePromise,
        InvalidResponseException,
        "Access denied",
      )
    })
  })

  describe("LegacyScenarioFetchCommand", () => {
    it("should fetch a legacy scenario by id", async () => {
      // arrange
      const scenario: LegacyScenario = {
        id: crypto.randomUUID(),
        name: "legacy-scenario",
        description: "A legacy scenario",
        flowcoreUserId: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        deploymentState: "DEPLOYED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: [
          {
            id: crypto.randomUUID(),
            type: "Adapter",
            name: "test-adapter",
            description: "Test adapter",
            data: JSON.stringify({ some: "config" }),
            parents: [],
            children: [],
          },
          {
            id: crypto.randomUUID(),
            type: "DataCore",
            name: "test-datacore",
            description: "Test data core",
            parents: [],
            children: [],
          },
        ],
      }

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetScenarioById($scenarioId: ID!) {
  scenario(id: $scenarioId) {
    id
    name
    description
    flowcoreUserId
    organizationId
    deploymentState
    createdAt
    updatedAt
    nodes {
      id
      type
      name
      description
      data
      parents
      children
    }
  }
}
`,
          variables: { scenarioId: scenario.id },
        })
        .respondWith(200, {
          data: {
            scenario,
          },
        })

      // act
      const command = new LegacyScenarioFetchCommand({ scenarioId: scenario.id })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, scenario)
    })

    it("should throw NotFoundException when scenario is not found", async () => {
      // arrange
      const scenarioId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetScenarioById($scenarioId: ID!) {
  scenario(id: $scenarioId) {
    id
    name
    description
    flowcoreUserId
    organizationId
    deploymentState
    createdAt
    updatedAt
    nodes {
      id
      type
      name
      description
      data
      parents
      children
    }
  }
}
`,
          variables: { scenarioId },
        })
        .persisted()
        .respondWith(200, {
          data: {
            scenario: null,
          },
        })

      // act
      const command = new LegacyScenarioFetchCommand({ scenarioId })
      const responsePromise = flowcoreClient.execute(command)

      // assert
      await assertRejects(
        () => responsePromise,
        NotFoundException,
        `Legacy Scenario not found: ${JSON.stringify({ id: scenarioId })}`,
      )
    })
  })

  describe("LegacyScenarioDeleteCommand", () => {
    it("should delete a legacy scenario", async () => {
      // arrange
      const organizationId = crypto.randomUUID()
      const scenarioId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
mutation DeleteScenario($organizationId: ID!, $scenarioId: ID!) {
  organization(id: $organizationId) {
    deleteScenario(scenarioId: $scenarioId)
  }
}
`,
          variables: { organizationId, scenarioId },
        })
        .respondWith(200, {
          data: {
            organization: {
              deleteScenario: true,
            },
          },
        })

      // act
      const command = new LegacyScenarioDeleteCommand({ organizationId, scenarioId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.success, true)
    })

    it("should return success false when delete fails", async () => {
      // arrange
      const organizationId = crypto.randomUUID()
      const scenarioId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
mutation DeleteScenario($organizationId: ID!, $scenarioId: ID!) {
  organization(id: $organizationId) {
    deleteScenario(scenarioId: $scenarioId)
  }
}
`,
          variables: { organizationId, scenarioId },
        })
        .respondWith(200, {
          data: {
            organization: {
              deleteScenario: false,
            },
          },
        })

      // act
      const command = new LegacyScenarioDeleteCommand({ organizationId, scenarioId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.success, false)
    })

    it("should throw InvalidResponseException when GraphQL returns errors", async () => {
      // arrange
      const organizationId = crypto.randomUUID()
      const scenarioId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
mutation DeleteScenario($organizationId: ID!, $scenarioId: ID!) {
  organization(id: $organizationId) {
    deleteScenario(scenarioId: $scenarioId)
  }
}
`,
          variables: { organizationId, scenarioId },
        })
        .persisted()
        .respondWith(200, {
          errors: [{ message: "Scenario not found" }],
        })

      // act
      const command = new LegacyScenarioDeleteCommand({ organizationId, scenarioId })
      const responsePromise = flowcoreClient.execute(command)

      // assert
      await assertRejects(
        () => responsePromise,
        InvalidResponseException,
        "Scenario not found",
      )
    })
  })

  describe("LegacyScenarioAdapterFetchStateCommand", () => {
    it("should fetch adapter deployment state", async () => {
      // arrange
      const adapterId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()
      const state: LegacyScenarioAdapterState = {
        kubernetes: {
          status: "RUNNING",
        },
      }

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetAdapterDeploymentState($adapterId: ID!, $organizationId: ID!) {
  adapter(search: { id: $adapterId, organizationId: $organizationId }) {
    state {
      kubernetes {
        status
      }
    }
  }
}
`,
          variables: { adapterId, organizationId },
        })
        .respondWith(200, {
          data: {
            adapter: {
              state,
            },
          },
        })

      // act
      const command = new LegacyScenarioAdapterFetchStateCommand({ adapterId, organizationId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.state, state)
    })

    it("should throw NotFoundException when adapter is not found", async () => {
      // arrange
      const adapterId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query GetAdapterDeploymentState($adapterId: ID!, $organizationId: ID!) {
  adapter(search: { id: $adapterId, organizationId: $organizationId }) {
    state {
      kubernetes {
        status
      }
    }
  }
}
`,
          variables: { adapterId, organizationId },
        })
        .persisted()
        .respondWith(200, {
          data: {
            adapter: null,
          },
        })

      // act
      const command = new LegacyScenarioAdapterFetchStateCommand({ adapterId, organizationId })
      const responsePromise = flowcoreClient.execute(command)

      // assert
      await assertRejects(
        () => responsePromise,
        NotFoundException,
        `Legacy Scenario Adapter not found: ${JSON.stringify({ id: adapterId, organizationId })}`,
      )
    })
  })

  describe("LegacyScenarioAdapterRestartCommand", () => {
    it("should restart an adapter", async () => {
      // arrange
      const adapterId = crypto.randomUUID()
      const afterEventId = crypto.randomUUID()
      const timeBucket = "202401151030"

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
mutation RestartAdapter(
  $adapterId: ID!
  $afterEventId: String!
  $timeBucket: String!
) {
  adapter(id: $adapterId) {
    reset(input: { afterEventId: $afterEventId, timeBucket: $timeBucket })
  }
}
`,
          variables: { adapterId, afterEventId, timeBucket },
        })
        .respondWith(200, {
          data: {
            adapter: {
              reset: true,
            },
          },
        })

      // act
      const command = new LegacyScenarioAdapterRestartCommand({ adapterId, afterEventId, timeBucket })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.success, true)
    })

    it("should return success false when restart fails", async () => {
      // arrange
      const adapterId = crypto.randomUUID()
      const afterEventId = crypto.randomUUID()
      const timeBucket = "202401151030"

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
mutation RestartAdapter(
  $adapterId: ID!
  $afterEventId: String!
  $timeBucket: String!
) {
  adapter(id: $adapterId) {
    reset(input: { afterEventId: $afterEventId, timeBucket: $timeBucket })
  }
}
`,
          variables: { adapterId, afterEventId, timeBucket },
        })
        .respondWith(200, {
          data: {
            adapter: {
              reset: false,
            },
          },
        })

      // act
      const command = new LegacyScenarioAdapterRestartCommand({ adapterId, afterEventId, timeBucket })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.success, false)
    })

    it("should handle null reset response", async () => {
      // arrange
      const adapterId = crypto.randomUUID()
      const afterEventId = crypto.randomUUID()
      const timeBucket = "202401151030"

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
mutation RestartAdapter(
  $adapterId: ID!
  $afterEventId: String!
  $timeBucket: String!
) {
  adapter(id: $adapterId) {
    reset(input: { afterEventId: $afterEventId, timeBucket: $timeBucket })
  }
}
`,
          variables: { adapterId, afterEventId, timeBucket },
        })
        .respondWith(200, {
          data: {
            adapter: {
              reset: null,
            },
          },
        })

      // act
      const command = new LegacyScenarioAdapterRestartCommand({ adapterId, afterEventId, timeBucket })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.success, false)
    })

    it("should throw InvalidResponseException when GraphQL returns errors", async () => {
      // arrange
      const adapterId = crypto.randomUUID()
      const afterEventId = crypto.randomUUID()
      const timeBucket = "202401151030"

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
mutation RestartAdapter(
  $adapterId: ID!
  $afterEventId: String!
  $timeBucket: String!
) {
  adapter(id: $adapterId) {
    reset(input: { afterEventId: $afterEventId, timeBucket: $timeBucket })
  }
}
`,
          variables: { adapterId, afterEventId, timeBucket },
        })
        .persisted()
        .respondWith(200, {
          errors: [{ message: "Adapter not found" }],
        })

      // act
      const command = new LegacyScenarioAdapterRestartCommand({ adapterId, afterEventId, timeBucket })
      const responsePromise = flowcoreClient.execute(command)

      // assert
      await assertRejects(
        () => responsePromise,
        InvalidResponseException,
        "Adapter not found",
      )
    })
  })
})

