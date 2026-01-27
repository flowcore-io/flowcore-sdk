import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import {
  FlowcoreClient,
  UserDeleteCommand,
  UserInitializeInKeycloakCommand,
  UserInviteToTenantCommand,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("User", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://user-2.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
  })
  afterAll(() => {
    fetchMocker.restore()
  })

  describe("UserInitializeInKeycloakCommand", () => {
    it("should POST /api/users with an empty body and return user", async () => {
      // arrange
      const userData = {
        id: "user123",
        username: "user123",
        email: "user123@example.com",
        firstName: "User",
        lastName: "Test",
      }

      fetchMockerBuilder.post("/api/users")
        .matchHeaders({
          Authorization: "Bearer BEARER_TOKEN",
          "Content-Type": "application/json",
        })
        .matchBody({})
        .respondWith(200, userData)

      // act
      const command = new UserInitializeInKeycloakCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, userData)
    })

    it("should return the user response", async () => {
      // arrange
      const userData = {
        id: "user123",
        username: "user123",
        email: "user123@example.com",
        firstName: "User",
        lastName: "Test",
      }

      fetchMockerBuilder.post("/api/users")
        .matchHeaders({
          Authorization: "Bearer BEARER_TOKEN",
          "Content-Type": "application/json",
        })
        .matchBody({})
        .respondWith(200, userData)

      // act
      const command = new UserInitializeInKeycloakCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, userData)
    })
  })

  describe("UserDeleteCommand", () => {
    it("should DELETE /api/users with an empty body and return id", async () => {
      // arrange
      const responseData = { id: "user123" }

      fetchMockerBuilder.delete("/api/users")
        .matchHeaders({
          Authorization: "Bearer BEARER_TOKEN",
          "Content-Type": "application/json",
        })
        .matchBody({})
        .respondWith(200, responseData)

      // act
      const command = new UserDeleteCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, responseData)
    })
  })

  describe("UserInviteToTenantCommand", () => {
    it("should POST /api/users/invitations and return invitation response", async () => {
      // arrange
      const responseData = {
        success: true,
        tenantName: "acme",
        invitedEmail: "invitee@example.com",
      }

      fetchMockerBuilder.post("/api/users/invitations")
        .matchHeaders({
          Authorization: "Bearer BEARER_TOKEN",
          "Content-Type": "application/json",
        })
        .matchBody({
          tenantName: "acme",
          userEmail: "invitee@example.com",
        })
        .respondWith(200, responseData)

      // act
      const command = new UserInviteToTenantCommand({
        tenantName: "acme",
        userEmail: "invitee@example.com",
      })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, responseData)
    })
  })
})
