import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { FlowcoreClient, IngestBatchCommand, IngestEventCommand } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("Ingestion", () => {
  const fetchMocker = new FetchMocker()
  const apiKey = "test-api-key" 
  const apiKeyId = "test-key-id"
  const expectedAuthHeader = apiKey // Just use the API key directly, not the ApiKey format
  const flowcoreClient = new FlowcoreClient({ 
    apiKeyId, 
    apiKey
  })
  
  // Clear after each test and restore after all tests
  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  describe("IngestEventCommand", () => {
    it("should ingest a single event with correct path and headers", async () => {
      // arrange
      const tenantName = "test-tenant"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const eventData = { key: "value", number: 123 }
      
      const mockWebhookUrl = "https://webhook.api.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      fetchMockerBuilder.post(`/event/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchBody(eventData)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader
        })
        .respondWith(200, { eventId: "test-event-id", success: true })
      
      // act
      const command = new IngestEventCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        eventData
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventId: "test-event-id", success: true })
    })
    
    it("should handle Flowcore tenant with special URL", async () => {
      // arrange
      const tenantName = "flowcore"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const eventData = { key: "value" }
      
      const mockWebhookUrl = "https://flowcore.webhook.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      fetchMockerBuilder.post(`/event/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchBody(eventData)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader
        })
        .respondWith(200, { eventId: "test-event-id", success: true })
      
      // act
      const command = new IngestEventCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        eventData
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventId: "test-event-id", success: true })
    })
    
    it("should include metadata and time headers when provided", async () => {
      // arrange
      const tenantName = "test-tenant"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const eventData = { key: "value" }
      const metadata = { source: "test-source", version: "1.0" }
      const eventTime = "2023-01-01T12:00:00Z"
      const validTime = "2023-01-01T12:00:00Z"
      
      const mockWebhookUrl = "https://webhook.api.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      fetchMockerBuilder.post(`/event/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader,
          "x-flowcore-metadata-json": JSON.stringify(metadata),
          "x-flowcore-event-time": eventTime,
          "x-flowcore-valid-time": validTime
        })
        .respondWith(200, { eventId: "test-event-id", success: true })
      
      // act
      const command = new IngestEventCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        eventData,
        metadata,
        eventTime,
        validTime
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventId: "test-event-id", success: true })
    })
    
    it("should add TTL metadata when provided", async () => {
      // arrange
      const tenantName = "test-tenant"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const eventData = { key: "value" }
      const metadata = { source: "test-source" }
      const ttl = "7d"
      
      const mockWebhookUrl = "https://webhook.api.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      // Expect metadata to contain the ttl flag
      const expectedMetadata = { 
        ...metadata,
        "ttl-on/stored-event": "true"
      }
      
      fetchMockerBuilder.post(`/event/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader,
          "x-flowcore-metadata-json": JSON.stringify(expectedMetadata)
        })
        .respondWith(200, { eventId: "test-event-id", success: true })
      
      // act
      const command = new IngestEventCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        eventData,
        metadata,
        ttl
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventId: "test-event-id", success: true })
    })
    
    it("should add ephemeral metadata when provided", async () => {
      // arrange
      const tenantName = "test-tenant"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const eventData = { key: "value" }
      const metadata = { source: "test-source" }
      const isEphemeral = true
      
      const mockWebhookUrl = "https://webhook.api.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      // Expect metadata to contain the ephemeral flag
      const expectedMetadata = { 
        ...metadata,
        "do-not-archive-on/stored-event": "true"
      }
      
      fetchMockerBuilder.post(`/event/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader,
          "x-flowcore-metadata-json": JSON.stringify(expectedMetadata)
        })
        .respondWith(200, { eventId: "test-event-id", success: true })
      
      // act
      const command = new IngestEventCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        eventData,
        metadata,
        isEphemeral
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventId: "test-event-id", success: true })
    })
  })
  
  describe("IngestBatchCommand", () => {
    it("should ingest multiple events with correct path and headers", async () => {
      // arrange
      const tenantName = "test-tenant"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const events = [
        { id: "1", name: "Event 1" },
        { id: "2", name: "Event 2" }
      ]
      
      const mockWebhookUrl = "https://webhook.api.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      fetchMockerBuilder.post(`/events/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchBody(events)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader
        })
        .respondWith(200, { eventIds: ["id-1", "id-2"], success: true })
      
      // act
      const command = new IngestBatchCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        events
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventIds: ["id-1", "id-2"], success: true })
    })
    
    it("should include metadata and time headers when provided in batch", async () => {
      // arrange
      const tenantName = "test-tenant"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const events = [{ id: "1" }, { id: "2" }]
      const metadata = { source: "test-source", version: "1.0" }
      const eventTime = "2023-01-01T12:00:00Z"
      const validTime = "2023-01-01T12:00:00Z"
      
      const mockWebhookUrl = "https://webhook.api.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      fetchMockerBuilder.post(`/events/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader,
          "x-flowcore-metadata-json": JSON.stringify(metadata),
          "x-flowcore-event-time": eventTime,
          "x-flowcore-valid-time": validTime
        })
        .respondWith(200, { eventIds: ["id-1", "id-2"], success: true })
      
      // act
      const command = new IngestBatchCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        events,
        metadata,
        eventTime,
        validTime
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventIds: ["id-1", "id-2"], success: true })
    })
    
    it("should add TTL and ephemeral metadata in batch when provided", async () => {
      // arrange
      const tenantName = "test-tenant"
      const dataCoreId = "test-data-core"
      const flowTypeName = "test-flow-type"
      const eventTypeName = "test-event-type"
      const events = [{ id: "1" }, { id: "2" }]
      const metadata = { source: "test-source" }
      const ttl = "7d"
      const isEphemeral = true
      
      const mockWebhookUrl = "https://webhook.api.flowcore.io"
      const fetchMockerBuilder = fetchMocker.mock(mockWebhookUrl)
      
      // Expect metadata to contain both flags
      const expectedMetadata = { 
        ...metadata,
        "ttl-on/stored-event": "true",
        "do-not-archive-on/stored-event": "true"
      }
      
      fetchMockerBuilder.post(`/events/${tenantName}/${dataCoreId}/${flowTypeName}/${eventTypeName}`)
        .matchHeaders({
          "Content-Type": "application/json",
          "Authorization": expectedAuthHeader,
          "x-flowcore-metadata-json": JSON.stringify(expectedMetadata)
        })
        .respondWith(200, { eventIds: ["id-1", "id-2"], success: true })
      
      // act
      const command = new IngestBatchCommand({
        tenantName,
        dataCoreId,
        flowTypeName,
        eventTypeName,
        events,
        metadata,
        ttl,
        isEphemeral
      })
      
      const response = await flowcoreClient.execute(command)
      
      // assert
      assertEquals(response, { eventIds: ["id-1", "id-2"], success: true })
    })
  })
}) 