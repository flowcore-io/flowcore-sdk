import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { assertEquals, assertObjectMatch, assertRejects } from "@std/assert"
import { ClientError, Command, CommandError, FlowcoreClient } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

class TestCommandBearerOnly extends Command<{ test: string }, { test: string }> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

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

class TestCommandApiKeyOnly extends Command<{ test: string }, { test: string }> {
  protected override allowedModes: ("apiKey" | "bearer")[] = ["apiKey"]

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

describe("FlowcoreCommand", () => {
  const fetchMocker = new FetchMocker()
  const fetchMockerBuilder = fetchMocker.mock("https://test-command.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  it("should not allow apiKey mode", async () => {
    // arrange
    const flowcoreClient = new FlowcoreClient({ apiKey: "apiKey", apiKeyId: "apiKeyId" })

    // act
    const command = new TestCommandBearerOnly({ test: "test" })

    // assert
    await assertRejects(() => flowcoreClient.execute(command), CommandError, 'Not allowed in "apiKey" mode')
  })

  it("should not allow bearer mode", async () => {
    // arrange
    const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "bearerToken" })

    // act
    const command = new TestCommandApiKeyOnly({ test: "test" })

    // assert
    await assertRejects(() => flowcoreClient.execute(command), CommandError, 'Not allowed in "bearer" mode')
  })
})
