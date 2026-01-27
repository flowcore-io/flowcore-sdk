import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import { FlowcoreClient, UserInitializeInKeycloakCommand, UserInviteToTenantCommand } from "../../../src/mod.ts"
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

  describe("UserInviteToTenantCommand", () => {
    it("should POST /api/users/invitations and return invitation response", async () => {
      // arrange
      const requestBody = {
        tenantName: "example-tenant",
        userEmail: "user@example.com",
      }
      const responseData = {
        success: true,
        tenantName: requestBody.tenantName,
        invitedEmail: requestBody.userEmail,
      }

      fetchMockerBuilder.post("/api/users/invitations")
        .matchHeaders({
          Authorization: "Bearer BEARER_TOKEN",
          "Content-Type": "application/json",
        })
        .matchBody(requestBody)
        .respondWith(200, responseData)

      // act
      const command = new UserInviteToTenantCommand(requestBody)
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, responseData)
    })
  })
})
