import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import { FlowcoreClient, UserInitializeInKeycloakCommand } from "../../../src/mod.ts"
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
})
