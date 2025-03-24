import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { FlowcoreClient, type FlowType, FlowTypeFetchCommand, NotFoundException } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("FlowType", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://flow-type-2.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  it("should fetch a flow type by id", async () => {
    // arrange
    const flowType: FlowType = {
      id: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      name: "test",
      description: "test",
      isDeleting: false,
    }

    fetchMockerBuilder.get(`/api/v1/flow-types/${flowType.id}`)
      .respondWith(200, flowType)

    // act
    const command = new FlowTypeFetchCommand({ flowTypeId: flowType.id })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, flowType)
  })

  it("should fetch a flow type by data core and name", async () => {
    // arrange
    const flowType: FlowType = {
      id: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      name: "test",
      description: "test",
      isDeleting: false,
    }

    fetchMockerBuilder.get(`/api/v1/flow-types`)
      .matchSearchParams({
        name: flowType.name,
        dataCoreId: flowType.dataCoreId,
      })
      .respondWith(200, [flowType])

    // act
    const command = new FlowTypeFetchCommand({ flowType: flowType.name, dataCoreId: flowType.dataCoreId })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, flowType)
  })

  it("should throw NotFoundException when flow type is not found by id", async () => {
    const flowTypeId = crypto.randomUUID()
    // arrange
    fetchMockerBuilder.get(`/api/v1/flow-types/${flowTypeId}`)
      .respondWith(404, { message: "Flow type not found" })

    // act
    const command = new FlowTypeFetchCommand({ flowTypeId })
    const responsPromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsPromise,
      NotFoundException,
      `FlowType not found: ${JSON.stringify({ id: flowTypeId })}`,
    )
  })

  it("should throw NotFoundException when flow type is not found by tenant and name", async () => {
    const dataCoreId = crypto.randomUUID()
    const name = "test"

    // arrange
    fetchMockerBuilder.get(`/api/v1/flow-types`)
      .matchSearchParams({
        name,
        dataCoreId,
      })
      .respondWith(200, [])

    // act
    const command = new FlowTypeFetchCommand({ flowType: name, dataCoreId })
    const responsPromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsPromise,
      NotFoundException,
      `FlowType not found: ${JSON.stringify({ name })}`,
    )
  })
})
