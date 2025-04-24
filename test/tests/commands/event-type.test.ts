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
      piiMask: null,
      piiMaskParsed: null,
      piiEnabled: true,
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
      piiMask: null,
      piiMaskParsed: null,
      piiEnabled: true,
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
      flowTypeId: eventType.flowTypeId as string 
    })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, eventType)
  })

  it("should handle event type with simple PII masking", async () => {
    // arrange
    const eventType: EventType = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      flowTypeId: crypto.randomUUID(),
      name: "customer-data",
      description: "Customer data with PII masking",
      isDeleting: false,
      isTruncating: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      piiMask: {
        key: "customerId",
        schema: {
          name: true,
          email: "string",
          age: "number",
          active: "boolean"
        }
      },
      piiMaskParsed: [
        { path: "$.name", definition: { type: "string", args: [] } },
        { path: "$.email", definition: { type: "string", args: [] } },
        { path: "$.age", definition: { type: "number", args: [] } },
        { path: "$.active", definition: { type: "boolean", args: [] } }
      ],
      piiEnabled: true,
    }

    fetchMockerBuilder.get(`/api/v1/event-types/${eventType.id}`)
      .respondWith(200, eventType)

    // act
    const command = new EventTypeFetchCommand({ eventTypeId: eventType.id as string })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, eventType)
  })

  it("should handle event type with complex PII masking", async () => {
    // arrange
    const eventType: EventType = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      dataCoreId: crypto.randomUUID(),
      flowTypeId: crypto.randomUUID(),
      name: "advanced-data",
      description: "Advanced data with complex PII masking",
      isDeleting: false,
      isTruncating: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      piiMask: {
        key: "userId",
        schema: {
          name: true,
          email: "string",
          address: {
            street: {
              type: "string",
              faker: "address.streetAddress"
            },
            city: "string",
            zipCode: {
              type: "string",
              pattern: "\\d{5}"
            }
          },
          phoneNumbers: {
            type: "array",
            count: 2,
            items: "string"
          },
          preferences: {
            type: "object",
            properties: {
              theme: "string",
              notifications: "boolean"
            }
          }
        }
      },
      piiMaskParsed: [
        { path: "$.name", definition: { type: "string", args: [] } },
        { path: "$.email", definition: { type: "string", args: [] } },
        { 
          path: "$.address.street", 
          definition: { 
            type: "string", 
            faker: "address.streetAddress", 
            args: [] 
          } 
        },
        { path: "$.address.city", definition: { type: "string", args: [] } },
        { 
          path: "$.address.zipCode", 
          definition: { 
            type: "string", 
            pattern: "\\d{5}", 
            args: [] 
          } 
        },
        { 
          path: "$.phoneNumbers", 
          definition: { 
            type: "array", 
            count: 2, 
            items: "string", 
            args: [] 
          } 
        },
        { path: "$.preferences.theme", definition: { type: "string", args: [] } },
        { path: "$.preferences.notifications", definition: { type: "boolean", args: [] } }
      ],
      piiEnabled: true,
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
