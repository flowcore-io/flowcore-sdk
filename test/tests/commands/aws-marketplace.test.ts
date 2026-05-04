import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, afterEach, describe, it } from "@std/testing/bdd"
import {
  AwsMarketplaceCustomerResolveCommand,
  AwsMarketplaceLinkCreateCommand,
  AwsMarketplaceLinkDeleteCommand,
  AwsMarketplaceLinkFetchCommand,
  AwsMarketplaceLinkListCommand,
  CommandError,
  FlowcoreClient,
} from "../../../src/mod.ts"
import { FetchMocker } from "../../fixtures/fetch.fixture.ts"

describe("AWS Marketplace", () => {
  const fetchMocker = new FetchMocker()
  const bearerClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const apiKeyClient = new FlowcoreClient({ apiKey: "fc_keyid_secret" })
  const fetchMockerBuilder = fetchMocker.mock("https://subscription-2.api.flowcore.io")

  afterEach(() => {
    fetchMocker.assert()
  })
  afterAll(() => fetchMocker.restore())

  it("should resolve an AWS Marketplace customer", async () => {
    const responseBody = {
      success: true,
      customer: {
        customerId: "customer-id",
        productCode: "product-code",
        accountId: "account-id",
        metadata: "metadata",
        productMode: "basic",
      },
    }

    fetchMockerBuilder.post("/api/v1/aws-marketplace/customers/resolve")
      .matchBody({ registrationToken: "registration-token" })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new AwsMarketplaceCustomerResolveCommand({ registrationToken: "registration-token" }),
    )

    assertEquals(response, responseBody)
  })

  it("should create an AWS Marketplace link", async () => {
    const tenantId = crypto.randomUUID()
    const linkingId = crypto.randomUUID()
    const responseBody = {
      success: true,
      linkingId,
      status: "linked" as const,
    }

    fetchMockerBuilder.post("/api/v1/aws-marketplace/links")
      .matchBody({
        registrationToken: "registration-token",
        tenant: "tenant-slug",
        tenantId,
        productProperties: {
          dedicatedClusterType: "managed",
        },
        licenseKey: "license-key",
      })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new AwsMarketplaceLinkCreateCommand({
        registrationToken: "registration-token",
        tenant: "tenant-slug",
        tenantId,
        productProperties: {
          dedicatedClusterType: "managed",
        },
        licenseKey: "license-key",
      }),
    )

    assertEquals(response, responseBody)
  })

  it("should list AWS Marketplace links", async () => {
    const link = buildAwsMarketplaceLink()
    const responseBody = {
      success: true,
      links: [link],
    }

    fetchMockerBuilder.get("/api/v1/aws-marketplace/links")
      .matchSearchParams({
        tenant: link.tenant ?? "",
        tenantId: link.tenantId,
        awsCustomerId: link.awsCustomerId,
        awsProductCode: link.awsProductCode,
      })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new AwsMarketplaceLinkListCommand({
        tenant: link.tenant ?? undefined,
        tenantId: link.tenantId,
        awsCustomerId: link.awsCustomerId,
        awsProductCode: link.awsProductCode,
      }),
    )

    assertEquals(response, responseBody)
  })

  it("should fetch an AWS Marketplace link", async () => {
    const link = buildAwsMarketplaceLink()
    const responseBody = {
      success: true,
      link,
    }

    fetchMockerBuilder.get(`/api/v1/aws-marketplace/links/${link.linkingId}`).respondWith(200, responseBody)

    const response = await bearerClient.execute(new AwsMarketplaceLinkFetchCommand({ linkingId: link.linkingId }))

    assertEquals(response, responseBody)
  })

  it("should delete an AWS Marketplace link", async () => {
    const linkingId = crypto.randomUUID()
    const responseBody = {
      success: true,
      linkingId,
      status: "unlinked" as const,
    }

    fetchMockerBuilder.delete(`/api/v1/aws-marketplace/links/${linkingId}`)
      .matchSearchParams({ reason: "requested" })
      .respondWith(200, responseBody)

    const response = await bearerClient.execute(
      new AwsMarketplaceLinkDeleteCommand({ linkingId, reason: "requested" }),
    )

    assertEquals(response, responseBody)
  })

  it("should not allow apiKey mode for AWS Marketplace link commands", async () => {
    await assertRejects(
      () =>
        apiKeyClient.execute(
          new AwsMarketplaceLinkFetchCommand({ linkingId: crypto.randomUUID() }),
        ),
      CommandError,
      'Not allowed in "apiKey" mode',
    )
  })
})

function buildAwsMarketplaceLink() {
  return {
    linkingId: crypto.randomUUID(),
    awsCustomerId: "customer-id",
    awsProductCode: "product-code",
    awsAccountId: "account-id",
    tenant: "tenant-slug",
    tenantId: crypto.randomUUID(),
    contactInfo: "user@example.com",
    productProperties: {
      dedicatedClusterType: "managed",
    },
    linkedAt: new Date().toISOString(),
  }
}
