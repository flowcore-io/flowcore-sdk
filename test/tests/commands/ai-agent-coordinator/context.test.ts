import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import {
  type AddContextItem,
  type ContextItem,
  ContextAddItemCommand,
  ContextRemoveItemCommand,
  FlowcoreClient,
} from "../../../../src/mod.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("AiAgentCoordinator Context Commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://ai-coordinator.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
  })
  afterAll(() => {
    fetchMocker.restore()
  })

  describe("ContextAddItemCommand", () => {
    it("should add items to conversation context", async () => {
      // arrange
      const conversationId = "conv_ctx_1"
      const itemsToAdd: AddContextItem[] = [{ type: "dataCore", id: "dc_1" }]
      const expectedContext: ContextItem[] = [
        { type: "tenant", id: "t1", name: "Tenant 1", description: "Desc 1" },
        { type: "dataCore", id: "dc_1", name: "Data Core 1", description: "DC Desc 1" }, // Assuming API returns full item
      ]
      const responsePayload = { context: expectedContext }

      fetchMockerBuilder.post(`/api/v1/conversations/${conversationId}/context/add`)
        .matchBody({ items: itemsToAdd })
        .respondWith(200, responsePayload)

      // act
      const command = new ContextAddItemCommand({ conversationId, items: itemsToAdd })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, responsePayload)
    })
  })

  describe("ContextRemoveItemCommand", () => {
    it("should remove an item from conversation context", async () => {
      // arrange
      const conversationId = "conv_ctx_2"
      const itemIdToRemove = "dc_1"
      const expectedContext: ContextItem[] = [
        { type: "tenant", id: "t1", name: "Tenant 1", description: "Desc 1" },
      ]
      const responsePayload = { context: expectedContext }

      fetchMockerBuilder.post(`/api/v1/conversations/${conversationId}/context/remove`)
        .matchBody({ itemId: itemIdToRemove })
        .respondWith(200, responsePayload)

      // act
      const command = new ContextRemoveItemCommand({ conversationId, itemId: itemIdToRemove })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, responsePayload)
    })
  })
}) 