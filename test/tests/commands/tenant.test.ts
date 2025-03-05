import { assertEquals } from "@std/assert"
import { afterAll, afterEach, describe, it } from "jsr:@std/testing/bdd"
import {
  FlowcoreClient,
  type Tenant,
  TenantTranslateNameToIdCommand
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
})
