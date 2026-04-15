import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import {
  ApiKeyFetchCommand,
  ApiKeyValidateCommand,
  ApiKeyValidateWithTenantIdCommand,
  FlowcoreClient,
  NotFoundException,
  SecretFetchCommand,
  ServiceAccountCreateCommand,
  ServiceAccountDeleteCommand,
  ServiceAccountEditCommand,
  ServiceAccountFetchCommand,
  ServiceAccountListCommand,
  ServiceAccountRotateSecretCommand,
  VariableFetchCommand,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("Tenant Store", () => {
  const fetchMocker = new FetchMocker()
  const bearerClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const apiKeyClient = new FlowcoreClient({ apiKey: "fc_keyid_secret" })
  const fetchMockerBuilder = fetchMocker.mock("https://tenant-store.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
  })
  afterAll(() => fetchMocker.restore())

  it("should fetch an api key", async () => {
    const apiKey = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      name: "deploy",
      description: "deploy key",
      maskedApiKey: "fc_***",
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    }

    fetchMockerBuilder.get(`/api/v1/api-keys/${apiKey.id}`).respondWith(200, apiKey)

    const response = await bearerClient.execute(new ApiKeyFetchCommand({ apiKeyId: apiKey.id }))

    assertEquals(response, apiKey)
  })

  it("should throw not found when api key is missing", async () => {
    const apiKeyId = crypto.randomUUID()
    fetchMockerBuilder.get(`/api/v1/api-keys/${apiKeyId}`).respondWith(404, { message: "ApiKey not found" })

    await assertRejects(
      () => bearerClient.execute(new ApiKeyFetchCommand({ apiKeyId })),
      NotFoundException,
      `ApiKey not found: ${JSON.stringify({ id: apiKeyId })}`,
    )
  })

  it("should validate an api key", async () => {
    const responseBody = {
      valid: true,
      apiKeyId: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
    }

    fetchMockerBuilder.post("/api/v1/api-keys/validate")
      .matchBody({ apiKey: "fc_keyid_secret" })
      .respondWith(200, responseBody)

    const response = await apiKeyClient.execute(new ApiKeyValidateCommand({ apiKey: "fc_keyid_secret" }))

    assertEquals(response, responseBody)
  })

  it("should validate an api key with tenant id", async () => {
    const responseBody = {
      valid: true,
      apiKeyId: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
    }

    fetchMockerBuilder.post("/api/v1/api-keys/validate-with-tenant-id")
      .matchBody({
        apiKey: "legacy-key",
        tenantId: responseBody.tenantId,
      })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new ApiKeyValidateWithTenantIdCommand({
        apiKey: "legacy-key",
        tenantId: responseBody.tenantId,
      }),
    )

    assertEquals(response, responseBody)
  })

  it("should fetch a secret", async () => {
    const secret = {
      tenantId: crypto.randomUUID(),
      key: "MY_SECRET",
      description: "secret",
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }

    fetchMockerBuilder.get(`/api/v1/tenants/${secret.tenantId}/secrets/${secret.key}`).respondWith(200, secret)

    const response = await bearerClient.execute(new SecretFetchCommand({ tenantId: secret.tenantId, key: secret.key }))

    assertEquals(response, secret)
  })

  it("should throw not found when secret is missing", async () => {
    const tenantId = crypto.randomUUID()
    const key = "MISSING_SECRET"
    fetchMockerBuilder.get(`/api/v1/tenants/${tenantId}/secrets/${key}`).respondWith(404, {
      message: "Secret not found",
    })

    await assertRejects(
      () => bearerClient.execute(new SecretFetchCommand({ tenantId, key })),
      NotFoundException,
      `Secret not found: ${JSON.stringify({ tenantId, key })}`,
    )
  })

  it("should fetch a variable", async () => {
    const variable = {
      tenantId: crypto.randomUUID(),
      key: "MY_VARIABLE",
      description: "variable",
      value: "value",
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }

    fetchMockerBuilder.get(`/api/v1/tenants/${variable.tenantId}/variables/${variable.key}`).respondWith(200, variable)

    const response = await bearerClient.execute(
      new VariableFetchCommand({ tenantId: variable.tenantId, key: variable.key }),
    )

    assertEquals(response, variable)
  })

  it("should throw not found when variable is missing", async () => {
    const tenantId = crypto.randomUUID()
    const key = "MISSING_VARIABLE"
    fetchMockerBuilder.get(`/api/v1/tenants/${tenantId}/variables/${key}`).respondWith(404, {
      message: "Variable not found",
    })

    await assertRejects(
      () => bearerClient.execute(new VariableFetchCommand({ tenantId, key })),
      NotFoundException,
      `Variable not found: ${JSON.stringify({ tenantId, key })}`,
    )
  })

  it("should create a service account", async () => {
    const responseBody = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      name: "deploy-bot",
      description: "deploy bot",
      linkedUserId: crypto.randomUUID(),
      clientId: "service-account-client",
      isAdmin: false,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      lastRotatedAt: null,
      clientSecret: "secret",
    }

    fetchMockerBuilder.post("/api/v1/service-accounts")
      .matchBody({
        tenantId: responseBody.tenantId,
        name: responseBody.name,
        description: responseBody.description,
        isAdmin: false,
      })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new ServiceAccountCreateCommand({
        tenantId: responseBody.tenantId,
        name: responseBody.name,
        description: responseBody.description,
        isAdmin: false,
      }),
    )

    assertEquals(response, responseBody)
  })

  it("should list service accounts", async () => {
    const tenantId = crypto.randomUUID()
    const responseBody = [{
      id: crypto.randomUUID(),
      tenantId,
      name: "deploy-bot",
      description: "",
      linkedUserId: crypto.randomUUID(),
      clientId: "service-account-client",
      isAdmin: false,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      lastRotatedAt: null,
    }]

    fetchMockerBuilder.get("/api/v1/service-accounts")
      .matchSearchParams({ tenantId })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(new ServiceAccountListCommand({ tenantId }))

    assertEquals(response, responseBody)
  })

  it("should fetch a service account", async () => {
    const serviceAccount = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      name: "deploy-bot",
      description: "",
      linkedUserId: crypto.randomUUID(),
      clientId: "service-account-client",
      isAdmin: false,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      lastRotatedAt: null,
    }

    fetchMockerBuilder.get(`/api/v1/service-accounts/${serviceAccount.id}`).respondWith(200, serviceAccount)

    const response = await bearerClient.execute(
      new ServiceAccountFetchCommand({ serviceAccountId: serviceAccount.id }),
    )

    assertEquals(response, serviceAccount)
  })

  it("should throw not found when service account is missing", async () => {
    const serviceAccountId = crypto.randomUUID()
    fetchMockerBuilder.get(`/api/v1/service-accounts/${serviceAccountId}`).respondWith(404, {
      message: "ServiceAccount not found",
    })

    await assertRejects(
      () => bearerClient.execute(new ServiceAccountFetchCommand({ serviceAccountId })),
      NotFoundException,
      `ServiceAccount not found: ${JSON.stringify({ id: serviceAccountId })}`,
    )
  })

  it("should edit a service account", async () => {
    const responseBody = {
      id: crypto.randomUUID(),
      tenantId: crypto.randomUUID(),
      name: "deploy-bot",
      description: "updated",
      linkedUserId: crypto.randomUUID(),
      clientId: "service-account-client",
      isAdmin: false,
      enabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRotatedAt: null,
    }

    fetchMockerBuilder.patch(`/api/v1/service-accounts/${responseBody.id}`)
      .matchBody({
        description: responseBody.description,
        enabled: responseBody.enabled,
      })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new ServiceAccountEditCommand({
        serviceAccountId: responseBody.id,
        description: responseBody.description,
        enabled: responseBody.enabled,
      }),
    )

    assertEquals(response, responseBody)
  })

  it("should rotate a service account secret", async () => {
    const responseBody = {
      id: crypto.randomUUID(),
      clientId: "service-account-client",
      clientSecret: "rotated-secret",
    }

    fetchMockerBuilder.post(`/api/v1/service-accounts/${responseBody.id}/rotate-secret`).respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new ServiceAccountRotateSecretCommand({ serviceAccountId: responseBody.id }),
    )

    assertEquals(response, responseBody)
  })

  it("should delete a service account", async () => {
    const serviceAccountId = crypto.randomUUID()
    fetchMockerBuilder.delete(`/api/v1/service-accounts/${serviceAccountId}`).respondWith(200, { success: true })

    const response = await bearerClient.execute(new ServiceAccountDeleteCommand({ serviceAccountId }))

    assertEquals(response, true)
  })
})
