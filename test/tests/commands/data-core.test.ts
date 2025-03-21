import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { assertEquals, assertRejects } from "@std/assert"
import {
  type DataCore,
  DataCoreDeleteRequestCommand,
  DataCoreFetchCommand,
  FlowcoreClient,
  NotFoundException,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("DataCore", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilderGraphql = fetchMocker.mock("https://graph.api.flowcore.io")
  const fetchMockerBuilder = fetchMocker.mock("https://data-core-2.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => {
    fetchMocker.restore()
    flowcoreClient.clearDedicatedTenantCache()
  })

  it("should fetch a data core by id", async () => {
    // arrange
    const dataCore: DataCore = {
      id: crypto.randomUUID(),
      name: "test",
      tenantId: crypto.randomUUID(),
      tenant: "test",
      description: "test",
      accessControl: "public",
      deleteProtection: false,
      isDeleting: false,
    }

    fetchMockerBuilder.get(`/api/v1/data-cores/${dataCore.id}`)
      .respondWith(200, dataCore)

    // act
    const command = new DataCoreFetchCommand({ dataCoreId: dataCore.id })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, dataCore)
  })

  it("should fetch a data core by tenantId and name", async () => {
    // arrange
    const dataCore: DataCore = {
      id: crypto.randomUUID(),
      name: "test",
      tenantId: crypto.randomUUID(),
      tenant: "test",
      description: "test",
      accessControl: "public",
      deleteProtection: false,
      isDeleting: false,
    }

    fetchMockerBuilder.get(`/api/v1/data-cores`)
      .matchSearchParams({
        name: dataCore.name,
        tenantId: dataCore.tenantId,
      })
      .respondWith(200, [dataCore])

    // act
    const command = new DataCoreFetchCommand({ dataCore: dataCore.name, tenantId: dataCore.tenantId })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, dataCore)
  })

  it("should fetch a data core by tenant and name", async () => {
    // arrange
    const dataCore: DataCore = {
      id: crypto.randomUUID(),
      name: "test",
      tenantId: crypto.randomUUID(),
      tenant: "test",
      description: "test",
      accessControl: "public",
      deleteProtection: false,
      isDeleting: false,
    }

    fetchMockerBuilder.get(`/api/v1/data-cores`)
      .matchSearchParams({
        name: dataCore.name,
        tenant: dataCore.tenant,
      })
      .respondWith(200, [dataCore])

    // act
    const command = new DataCoreFetchCommand({ dataCore: dataCore.name, tenant: dataCore.tenant })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, dataCore)
  })

  it("should throw NotFoundException when data core is not found by id", async () => {
    const dataCoreId = crypto.randomUUID()
    // arrange
    fetchMockerBuilder.get(`/api/v1/data-cores/${dataCoreId}`)
      .respondWith(404, { message: "Data core not found" })

    // act
    const command = new DataCoreFetchCommand({ dataCoreId })
    const responsPromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsPromise,
      NotFoundException,
      `DataCore not found: ${JSON.stringify({ id: dataCoreId })}`,
    )
  })

  it("should throw NotFoundException when data core is not found by tenantId and name", async () => {
    const tenantId = crypto.randomUUID()
    const name = "test"

    // arrange
    fetchMockerBuilder.get(`/api/v1/data-cores`)
      .matchSearchParams({
        name,
        tenantId,
      })
      .respondWith(200, [])

    // act
    const command = new DataCoreFetchCommand({ dataCore: name, tenantId })
    const responsPromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsPromise,
      NotFoundException,
      `DataCore not found: ${JSON.stringify({ name, tenantId })}`,
    )
  })

  it("should throw NotFoundException when data core is not found by tenant and name", async () => {
    const tenant = "test"
    const name = "test"

    // arrange
    fetchMockerBuilder.get(`/api/v1/data-cores`)
      .matchSearchParams({
        name,
        tenant,
      })
      .respondWith(200, [])

    // act
    const command = new DataCoreFetchCommand({ dataCore: name, tenant })
    const responsPromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsPromise,
      NotFoundException,
      `DataCore not found: ${JSON.stringify({ name, tenant })}`,
    )
  })

  it("should request deletion of a data core and wait for deletion", async () => {
    // arrange
    const dataCore: DataCore = {
      id: crypto.randomUUID(),
      name: "test",
      tenantId: crypto.randomUUID(),
      tenant: "test",
      description: "test",
      accessControl: "public",
      deleteProtection: false,
      isDeleting: false,
    }

    fetchMockerBuilderGraphql.post("/graphql")
      .respondWith(200, {
        data: {
          datacore: {
            requestDelete: {
              deleting: true,
            },
          },
        },
      })
    fetchMockerBuilder.get(`/api/v1/data-cores/${dataCore.id}/exists`)
      .respondWith(200, { exists: true })
    fetchMockerBuilder.get(`/api/v1/data-cores/${dataCore.id}/exists`)
      .respondWith(200, { exists: false })

    // act
    const command = new DataCoreDeleteRequestCommand({ dataCoreId: dataCore.id, waitForDelete: true })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, true)
  })

  it("should request deletion of a data core and not wait for deletion", async () => {
    // arrange
    const dataCore: DataCore = {
      id: crypto.randomUUID(),
      name: "test",
      tenantId: crypto.randomUUID(),
      tenant: "test",
      description: "test",
      accessControl: "public",
      deleteProtection: false,
      isDeleting: false,
    }

    fetchMockerBuilderGraphql.post("/graphql")
      .respondWith(200, {
        data: {
          datacore: {
            requestDelete: {
              deleting: true,
            },
          },
        },
      })

    // act
    const command = new DataCoreDeleteRequestCommand({ dataCoreId: dataCore.id, waitForDelete: false })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, true)
  })
})
