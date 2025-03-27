import { Type } from "@sinclair/typebox"
import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import type { Tenant } from "../../../src/contracts/tenant.ts"
import { Command, CommandError, FlowcoreClient, InvalidResponseException } from "../../../src/mod.ts"
import { parseResponseHelper } from "../../../src/utils/parse-response-helper.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("FlowcoreCommand", () => {
  const fetchMocker = new FetchMocker()
  const fetchMockerBuilderTenant = fetchMocker.mock("https://tenant.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  it("should not allow apiKey mode", async () => {
    // arrange
    using flowcoreClient = new FlowcoreClient({ apiKey: "apiKey", apiKeyId: "apiKeyId" })

    // act
    const command = new TestCommandBearerOnly({ test: "test" })

    // assert
    await assertRejects(() => flowcoreClient.execute(command), CommandError, 'Not allowed in "apiKey" mode')

    flowcoreClient.close()
  })

  it("should not allow bearer mode", async () => {
    // arrange
    using flowcoreClient = new FlowcoreClient({ getBearerToken: () => "bearerToken" })

    // act
    const command = new TestCommandApiKeyOnly({ test: "test" })

    // assert
    await assertRejects(() => flowcoreClient.execute(command), CommandError, 'Not allowed in "bearer" mode')

    flowcoreClient.close()
  })

  it("should fail with invalid response", async () => {
    // arrange
    using flowcoreClient = new FlowcoreClient({ apiKey: "apiKey", apiKeyId: "apiKeyId" })
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

    flowcoreClient.close()
  })

  it("should load tenant and not use dedicated subdomain", async () => {
    // arrange
    using flowcoreClient = new FlowcoreClient({ apiKey: "apiKey", apiKeyId: "apiKeyId" })

    // act
    const command = new CommandWithDedicatedSubdomain({ tenant: "test" })

    fetchMockerBuilderTenant.get("/api/v1/tenants/by-name/test")
      .respondWith(
        200,
        {
          id: "test",
          name: "test",
          displayName: "test",
          description: "test",
          websiteUrl: "https://test.com",
          isDedicated: false,
          dedicated: null,
        } satisfies Tenant,
      )

    fetchMocker.mock("https://test-command.api.flowcore.io").get("/test").respondWith(200, {
      test: "test",
    })

    // assert
    const response = await flowcoreClient.execute(command)

    assertEquals(response, { test: "test" })
  })

  it("should load tenant and use dedicated subdomain", async () => {
    // arrange
    using flowcoreClient = new FlowcoreClient({ apiKey: "apiKey", apiKeyId: "apiKeyId" })

    // act
    const command = new CommandWithDedicatedSubdomain({ tenant: "test" })

    fetchMockerBuilderTenant.get("/api/v1/tenants/by-name/test")
      .respondWith(
        200,
        {
          id: "test",
          name: "test",
          displayName: "test",
          description: "test",
          websiteUrl: "https://test.com",
          isDedicated: true,
          dedicated: {
            configuration: {
              domain: "dedicated.test.com",
              configurationRepoUrl: "https://github.com/test/test",
              configurationRepoCredentials: "test",
            },
            status: "ready",
          },
        } satisfies Tenant,
      )

    fetchMocker.mock("https://test.dedicated.test.com").get("/test").respondWith(200, {
      test: "test",
    })

    // assert
    const response = await flowcoreClient.execute(command)

    assertEquals(response, { test: "test" })
  })
})

// Commands

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

class CommandWithDedicatedSubdomain extends Command<{ tenant: string }, { test: string }> {
  protected override dedicatedSubdomain: string = "test"

  override getMethod() {
    return "GET"
  }

  override getPath() {
    return "/test"
  }

  getBaseUrl() {
    return "https://test-command.api.flowcore.io"
  }

  parseResponse(rawResponse: unknown) {
    const response = parseResponseHelper(Type.Object({ test: Type.String() }), rawResponse)
    return response
  }
}
