import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { assertEquals, assertRejects } from "@std/assert"
import { type DataCore, DataCoreFetchCommand, FlowcoreClient, NotFoundException } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("DataCore", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://data-core-2.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  it("should fetch a data core by id", async () => {
    // arrange
    const dataCore: DataCore = {
      id: crypto.randomUUID(),
      name: "test",
      tenantId: crypto.randomUUID(),
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

  it("should fetch a data core by tenant and name", async () => {
    // arrange
    const dataCore: DataCore = {
      id: crypto.randomUUID(),
      name: "test",
      tenantId: crypto.randomUUID(),
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

  it("should throw NotFoundException when data core is not found by tenant and name", async () => {
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
      `DataCore not found: ${JSON.stringify({ name })}`,
    )
  })
})
