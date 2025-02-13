import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import { assertRejects } from "@std/assert"
import { Command, CommandError, FlowcoreClient, InvalidResponseException } from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"
import { parseResponseHelper } from "../../../src/utils/parse-response-helper.ts"
import { Type } from "@sinclair/typebox"

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

class TestCommandInvalidResponse extends Command<{ test: string }, { test: string }> {
  getBaseUrl() {
    return "https://test-command.api.flowcore.io"
  }

  override getMethod() {
    return "GET"
  }

  override getPath() {
    return "/test"
  }

  parseResponse(rawResponse: unknown) {
    const response = parseResponseHelper(Type.Object({ test: Type.String() }), rawResponse)
    return response
  }
}

describe("FlowcoreCommand", () => {
  const fetchMocker = new FetchMocker()

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

  it("should fail with invalid response", async () => {
    // arrange
    const flowcoreClient = new FlowcoreClient({ apiKey: "apiKey", apiKeyId: "apiKeyId" })
    fetchMocker.mock("https://test-command.api.flowcore.io").get("/test").respondWith(200, {
      foo: "bar",
    })

    // act
    const command = new TestCommandInvalidResponse({ test: "test" })

    // assert
    await assertRejects(
      () => flowcoreClient.execute(command),
      InvalidResponseException,
      'Invalid response: {"/test":"Expected string"}',
    )
  })
})
