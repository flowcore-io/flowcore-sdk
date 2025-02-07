import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { assertEquals, assertObjectMatch, assertRejects } from "@std/assert"
import { ClientError, Command, FlowcoreClient } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

class TestCommand extends Command<{ test: string }, { test: string }> {
  getBaseUrl() {
    return "https://test-command.api.flowcore.io"
  }

  override getMethod() {
    return "GET"
  }

  override getPath() {
    return "/test"
  }

  parseResponse(response: unknown) {
    return response as { test: string }
  }
}

class TestCommandNoRetry extends TestCommand {
  protected override retryOnFailure: boolean = false
}

describe("FlowcoreClient", () => {
  const fetchMocker = new FetchMocker()
  const fetchMockerBuilder = fetchMocker.mock("https://test-command.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  it("should add bearer token to request", async () => {
    // arrange
    const bearerToken = "BEARER_TOKEN"
    const flowcoreClient = new FlowcoreClient({ getBearerToken: () => bearerToken })
    fetchMockerBuilder.get("/test")
      .matchHeaders({
        "Authorization": `Bearer ${bearerToken}`,
      })
      .respondWith(200, { test: "test" })

    // act
    const command = new TestCommand({ test: "test" })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, { test: "test" })

    assertObjectMatch({ foo: "bar", bar: { foo: "bar", bar: "foo" } }, { foo: "bar", bar: { foo: "bar" } })
  })

  it("should add apiKeyId and apiKey to request", async () => {
    // arrange
    const apiKeyId = "API_KEY_ID"
    const apiKey = "API_KEY"
    const flowcoreClient = new FlowcoreClient({ apiKey, apiKeyId })
    fetchMockerBuilder.get("/test")
      .matchHeaders({
        "Authorization": `ApiKey ${apiKeyId}:${apiKey}`,
      })
      .respondWith(200, { test: "test" })

    // act
    const command = new TestCommand({ test: "test" })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, { test: "test" })

    assertObjectMatch({ foo: "bar", bar: { foo: "bar", bar: "foo" } }, { foo: "bar", bar: { foo: "bar" } })
  })

  it("should retry request", async () => {
    // arrange
    const flowcoreClient = new FlowcoreClient({
      getBearerToken: () => "BEARER_TOKEN",
      retry: {
        delay: 1,
        maxRetries: 3,
      },
    })
    fetchMockerBuilder.get("/test")
      .respondWith(500, { error: "test" })
    fetchMockerBuilder.get("/test")
      .respondWith(500, { error: "test" })
    fetchMockerBuilder.get("/test")
      .respondWith(500, { error: "test" })
    fetchMockerBuilder.get("/test")
      .respondWith(200, { test: "test" })

    // act
    const command = new TestCommand({ test: "test" })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response, { test: "test" })
  })

  it("should not retry request if retryOnFailure is false", async () => {
    // arrange
    const flowcoreClient = new FlowcoreClient({
      getBearerToken: () => "BEARER_TOKEN",
      retry: {
        delay: 1,
        maxRetries: 3,
      },
    })
    fetchMockerBuilder.get("/test")
      .respondWith(500, { error: "test" })

    // act
    const command = new TestCommandNoRetry({ test: "test" })
    const responsePromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(() => responsePromise, ClientError)
  })

  it("should not retry request if max retries is set to 0", async () => {
    // arrange
    const flowcoreClient = new FlowcoreClient({
      getBearerToken: () => "BEARER_TOKEN",
      retry: {
        delay: 1,
        maxRetries: 0,
      },
    })
    fetchMockerBuilder.get("/test")
      .respondWith(500, { error: "test" })

    // act
    const command = new TestCommand({ test: "test" })
    const responsePromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(() => responsePromise, ClientError)
  })

  it("should not retry on non retryable status code", async () => {
    // arrange
    const flowcoreClient = new FlowcoreClient({
      getBearerToken: () => "BEARER_TOKEN",
      retry: {
        delay: 1,
        maxRetries: 3,
      },
    })
    fetchMockerBuilder.get("/test")
      .respondWith(400, { error: "test" })

    // act
    const command = new TestCommand({ test: "test" })
    const responsePromise = flowcoreClient.execute(command)

    // assert
    await assertRejects(() => responsePromise, ClientError)
  })
})
