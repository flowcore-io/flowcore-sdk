import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { type EventType, EventTypeFetchCommand, FlowcoreClient, NotFoundException } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("EventType", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://event-type-2.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  it("should fetch an event type by id", async () => {
    // arrange
    const eventType: EventType = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      flowTypeId: crypto.randomUUID(),
      name: "test",
      description: "test",
      isDeleting: false,
      isTruncating: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sensitiveDataMask: null,
      sensitiveDataEnabled: true,
    }

    fetchMockerBuilder.get(`/api/v1/event-types/${eventType.id}`)
      .respondWith(200, eventType)

    // act
    const command = new EventTypeFetchCommand({ eventTypeId: eventType.id as string })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, eventType)
  })

  it("should fetch an event type by flow type and name", async () => {
    // arrange
    const eventType: EventType = {
      id: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      flowTypeId: crypto.randomUUID(),
      name: "test",
      description: "test",
      isDeleting: false,
      isTruncating: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sensitiveDataMask: null,
      sensitiveDataEnabled: true,
    }

    fetchMockerBuilder.get(`/api/v1/event-types`)
      .matchSearchParams({
        name: eventType.name as string,
        flowTypeId: eventType.flowTypeId as string,
      })
      .respondWith(200, [eventType])

    // act
    const command = new EventTypeFetchCommand({
      eventType: eventType.name as string,
      flowTypeId: eventType.flowTypeId as string,
    })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, eventType)
  })

  it("should handle event type with simple sensitive data masking", async () => {
    // arrange
    const eventType: EventType = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      flowTypeId: crypto.randomUUID(),
      name: "customer-data",
      description: "Customer data with sensitive data masking",
      isDeleting: false,
      isTruncating: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sensitiveDataMask: {
        key: "customerId",
        schema: {
          name: true,
          email: "string",
          age: "number",
          active: "boolean",
        },
      },
      sensitiveDataEnabled: true,
    }

    fetchMockerBuilder.get(`/api/v1/event-types/${eventType.id}`)
      .respondWith(200, eventType)

    // act
    const command = new EventTypeFetchCommand({ eventTypeId: eventType.id as string })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, eventType)
  })

  it("should handle event type with complex sensitive data masking", async () => {
    // arrange
    const eventType: EventType = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      flowTypeId: crypto.randomUUID(),
      name: "advanced-data",
      description: "Advanced data with complex sensitive data masking",
      isDeleting: false,
      isTruncating: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sensitiveDataMask: {
        key: "userId",
        schema: {
          name: true,
          email: "string",
          address: {
            street: {
              type: "string",
              faker: "address.streetAddress",
            },
            city: "string",
            zipCode: {
              type: "string",
              pattern: "\\d{5}",
            },
          },
          phoneNumbers: {
            type: "array",
            count: 2,
            items: "string",
          },
          preferences: {
            type: "object",
            properties: {
              theme: "string",
              notifications: "boolean",
            },
          },
        },
      },
      sensitiveDataEnabled: true,
    }

    fetchMockerBuilder.get(`/api/v1/event-types/${eventType.id}`)
      .respondWith(200, eventType)

    // act
    const command = new EventTypeFetchCommand({ eventTypeId: eventType.id as string })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, eventType)
  })

  it("should throw NotFoundException when event type is not found by id", async () => {
    const eventTypeId = crypto.randomUUID()
    // arrange
    fetchMockerBuilder.get(`/api/v1/event-types/${eventTypeId}`)
      .respondWith(404, { message: "Event type not found" })

    // act
    const command = new EventTypeFetchCommand({ eventTypeId })
    const responsPromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsPromise,
      NotFoundException,
      `EventType not found: ${JSON.stringify({ id: eventTypeId })}`,
    )
  })

  it("should throw NotFoundException when event type is not found by flow type and name", async () => {
    const flowTypeId = crypto.randomUUID()
    const name = "test"

    // arrange
    fetchMockerBuilder.get(`/api/v1/event-types`)
      .matchSearchParams({
        name,
        flowTypeId,
      })
      .respondWith(200, [])

    // act
    const command = new EventTypeFetchCommand({ eventType: name, flowTypeId })
    const responsPromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(
      () => responsPromise,
      NotFoundException,
      `EventType not found: ${JSON.stringify({ name })}`,
    )
  })
})
