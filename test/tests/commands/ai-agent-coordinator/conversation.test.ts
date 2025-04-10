import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import {
  type Conversation,
  type ConversationMetadata,
  ConversationDeleteCommand,
  ConversationGetCommand,
  ConversationListCommand,
  FlowcoreClient,
  NotFoundException,
} from "../../../../src/mod.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("AiAgentCoordinator Conversation Commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://ai-coordinator.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
  })
  afterAll(() => {
    fetchMocker.restore()
  })

  describe("ConversationListCommand", () => {
    it("should list conversations", async () => {
      // arrange
      const conversations: ConversationMetadata[] = [
        { id: "conv_1", title: "Test 1", lastUpdated: new Date().toISOString() },
        { id: "conv_2", title: "Test 2", lastUpdated: new Date().toISOString() },
      ]
      fetchMockerBuilder.get(`/api/v1/conversations`)
        .respondWith(200, { conversations })

      // act
      const command = new ConversationListCommand()
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, conversations)
    })
  })

  describe("ConversationGetCommand", () => {
    it("should fetch a conversation by id", async () => {
      // arrange
      const conversation: Conversation = {
        id: "conv_123",
        title: "Test Convo",
        lastUpdated: new Date().toISOString(),
        context: [{ type: "tenant", id: "t1", name: "Tenant 1", description: "Desc 1" }],
        messages: [{ id: "msg_1", role: "user", content: "Hi", timestamp: new Date().toISOString() }],
      }

      fetchMockerBuilder.get(`/api/v1/conversations/${conversation.id}`)
        .respondWith(200, conversation as unknown as Record<string, unknown>)

      // act
      const command = new ConversationGetCommand({ conversationId: conversation.id })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, conversation)
    })

    it("should throw NotFoundException when conversation is not found", async () => {
      const conversationId = "conv_not_found"
      // arrange
      fetchMockerBuilder.get(`/api/v1/conversations/${conversationId}`)
        .respondWith(404, { message: "Conversation not found" } as unknown as Record<string, unknown>)

      // act
      const command = new ConversationGetCommand({ conversationId })
      const responsePromise = flowcoreClient.execute(command)

      // assert
      await assertRejects(
        () => responsePromise,
        NotFoundException,
        `Conversation not found: ${JSON.stringify({ conversationId })}`,
      )
    })
  })

  describe("ConversationDeleteCommand", () => {
    it("should delete a conversation by id", async () => {
      // arrange
      const conversationId = "conv_to_delete"
      const deleteResponse = { message: "Conversation deleted successfully." }

      fetchMockerBuilder.delete(`/api/v1/conversations/${conversationId}`)
        .respondWith(200, deleteResponse)

      // act
      const command = new ConversationDeleteCommand({ conversationId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, deleteResponse)
    })
  })
}) 