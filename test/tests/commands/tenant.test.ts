import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import {
  FlowcoreClient,
  NotFoundException,
  type Tenant,
  type TenantInstance,
  TenantInstanceFetchCommand,
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

  it("should fetch tenant instance by name", async () => {
    const instance: TenantInstance = {
      isDedicated: true,
      instance: { status: "ready", domain: "test.flowcore.io" },
    }

    fetchMockerBuilder.get(`/api/v1/tenants/by-name/test/instance`)
      .respondWith(200, instance)

    const command = new TenantInstanceFetchCommand({ tenant: "test" })
    const response = await flowcoreClient.execute(command)

    assertEquals(response, instance)
  })

  it("should fetch tenant instance by id", async () => {
    const tenantId = crypto.randomUUID()
    const instance: TenantInstance = {
      isDedicated: true,
      instance: { status: "ready", domain: "test.flowcore.io" },
    }

    fetchMockerBuilder.get(`/api/v1/tenants/by-id/${tenantId}/instance`)
      .respondWith(200, instance)

    const command = new TenantInstanceFetchCommand({ tenantId })
    const response = await flowcoreClient.execute(command)

    assertEquals(response, instance)
  })

  it("should return non-dedicated instance", async () => {
    const instance: TenantInstance = {
      isDedicated: false,
      instance: null,
    }

    fetchMockerBuilder.get(`/api/v1/tenants/by-name/test/instance`)
      .respondWith(200, instance)

    const command = new TenantInstanceFetchCommand({ tenant: "test" })
    const response = await flowcoreClient.execute(command)

    assertEquals(response, instance)
  })

  it("should throw NotFoundException for missing tenant instance", async () => {
    fetchMockerBuilder.get(`/api/v1/tenants/by-name/missing/instance`)
      .respondWith(404, { message: "Tenant not found" })

    const command = new TenantInstanceFetchCommand({ tenant: "missing" })

    await assertRejects(
      () => flowcoreClient.execute(command),
      NotFoundException,
      `Tenant not found: ${JSON.stringify({ name: "missing" })}`,
    )
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
