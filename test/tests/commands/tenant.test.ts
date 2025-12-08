import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import {
  FlowcoreClient,
  NotFoundException,
  type Tenant,
  type TenantPreview,
  TenantPreviewCommand,
  TenantTranslateNameToIdCommand,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("Tenant", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://tenant.api.flowcore.io")

  afterEach(() => fetchMocker.assert())
  afterAll(() => fetchMocker.restore())

  it("should translate a tenant name to an tenant id", async () => {
    // arrange
    const tenant: Tenant = {
      id: crypto.randomUUID(),
      name: "test",
      displayName: "test",
      description: "test",
      websiteUrl: "https://test.com",
      isDedicated: false,
      dedicated: null,
    }

    fetchMockerBuilder.get(`/api/v1/tenants/translate-name-to-id/test`)
      .respondWith(200, tenant)

    // act
    const command = new TenantTranslateNameToIdCommand({ tenant: "test" })
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals({
      id: response.id,
      name: response.name,
    }, {
      id: tenant.id,
      name: tenant.name,
    })
  })

  it("should return a tenant preview", async () => {
    const preview: TenantPreview = {
      displayName: "Example Tenant",
      websiteUrl: "https://example.com",
      description: "An example tenant",
    }

    fetchMockerBuilder.get(`/api/v1/tenants/preview/example`)
      .respondWith(200, preview)

    const command = new TenantPreviewCommand({ name: "example" })
    const response = await flowcoreClient.execute(command)

    assertEquals(response, preview)
  })

  it("should throw NotFoundException when preview tenant is not found", async () => {
    fetchMockerBuilder.get(`/api/v1/tenants/preview/missing`)
      .respondWith(404, { message: "Tenant not found" })

    const command = new TenantPreviewCommand({ name: "missing" })

    await assertRejects(
      () => flowcoreClient.execute(command),
      NotFoundException,
      `Tenant not found: ${JSON.stringify({ name: "missing" })}`,
    )
  })
})
