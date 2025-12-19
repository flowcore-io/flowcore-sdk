import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import { FlowcoreClient, UserInitializeInKeycloakCommand } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("User", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://graph.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
  })
  afterAll(() => {
    fetchMocker.restore()
  })

  describe("UserInitializeInKeycloakCommand", () => {
    it("should return initialized true when user exists", async () => {
      // arrange
      const userData = { id: "user123" }

      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query UserIsInitializedIfDoesNotExist {
  me {
    id
  }
}
`,
          variables: {},
        })
        .respondWith(200, {
          data: {
            me: userData,
          },
        })

      // act
      const command = new UserInitializeInKeycloakCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.isInitialized, true)
      assertEquals(response.me, userData)
    })

    it("should return initialized false when user does not exist", async () => {
      // arrange
      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query UserIsInitializedIfDoesNotExist {
  me {
    id
  }
}
`,
          variables: {},
        })
        .respondWith(200, {
          data: {
            me: null,
          },
        })

      // act
      const command = new UserInitializeInKeycloakCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.isInitialized, false)
      assertEquals(response.me, null)
    })

    it("should handle undefined me response", async () => {
      // arrange
      fetchMockerBuilder.post("/graphql")
        .matchBody({
          query: `
query UserIsInitializedIfDoesNotExist {
  me {
    id
  }
}
`,
          variables: {},
        })
        .respondWith(200, {
          data: {},
        })

      // act
      const command = new UserInitializeInKeycloakCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.isInitialized, false)
      assertEquals(response.me, undefined)
    })
  })
})
