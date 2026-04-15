import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, describe, it } from "@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { PolicyValidateCommand } from "../../../../src/commands/iam/policies/validate-policy.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("PolicyValidateCommand", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  it("should return { valid: true } on a well-formed payload", async () => {
    // arrange
    const organizationId = crypto.randomUUID()
    const input = {
      organizationId,
      policyDocuments: [
        {
          statementId: "stmt1",
          resource: "frn::my-tenant:*",
          action: ["read", "write"],
        },
      ],
    }

    fetchMockerBuilder.post("/api/v1/policies/validate")
      .matchBody(input)
      .matchHeaders({
        "authorization": "Bearer BEARER_TOKEN",
        "content-type": "application/json",
      })
      .respondWith(200, { valid: true })

    // act
    const command = new PolicyValidateCommand(input)
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response.valid, true)
  })

  it("should forward an optional cross-tenant principal verbatim", async () => {
    // arrange
    const organizationId = crypto.randomUUID()
    const input = {
      organizationId,
      policyDocuments: [
        {
          statementId: "1",
          resource: "frn::my-tenant:event-type/b61e0fb1-3bf2-470e-97b6-3aeefb38b1be",
          action: "read",
        },
      ],
      principal: "frn::other-tenant:role/ddbcd838-7b05-4868-96ae-7bdc9a05067c",
    }

    fetchMockerBuilder.post("/api/v1/policies/validate")
      .matchBody(input)
      .respondWith(200, { valid: true })

    // act
    const command = new PolicyValidateCommand(input)
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response.valid, true)
  })

  it("should accept the bare '*' wildcard resource", async () => {
    // arrange
    const organizationId = crypto.randomUUID()
    const input = {
      organizationId,
      policyDocuments: [
        {
          statementId: "1",
          resource: "*",
          action: "*",
        },
      ],
    }

    fetchMockerBuilder.post("/api/v1/policies/validate")
      .matchBody(input)
      .respondWith(200, { valid: true })

    // act
    const command = new PolicyValidateCommand(input)
    const response = await flowcoreClient.execute(command)

    // assert
    assertEquals(response.valid, true)
  })

  it("should reject a payload whose resource id is not a UUID (422)", async () => {
    // arrange
    const organizationId = crypto.randomUUID()
    const input = {
      organizationId,
      policyDocuments: [
        {
          statementId: "1",
          resource: "frn::my-tenant:role/not-a-uuid",
          action: "read",
        },
      ],
    }

    fetchMockerBuilder.post("/api/v1/policies/validate")
      .matchBody(input)
      .respondWith(422, {
        code: "UNPROCESSABLE_CONTENT",
        message:
          'Invalid policy resource FRN "frn::my-tenant:role/not-a-uuid": resource id "not-a-uuid" must be a UUID',
        status: 422,
      })

    // act & assert
    const command = new PolicyValidateCommand(input)
    await assertRejects(
      () => flowcoreClient.execute(command),
      Error,
      "PolicyValidateCommand failed with 422:",
    )
  })

  it("should reject a cross-tenant resource FRN (422)", async () => {
    // arrange
    const organizationId = crypto.randomUUID()
    const input = {
      organizationId,
      policyDocuments: [
        {
          statementId: "1",
          resource: "frn::other-tenant:*",
          action: "*",
        },
      ],
    }

    fetchMockerBuilder.post("/api/v1/policies/validate")
      .matchBody(input)
      .respondWith(422, {
        code: "UNPROCESSABLE_CONTENT",
        message:
          'Invalid policy resource FRN "frn::other-tenant:*": tenant "other-tenant" does not match the policy\'s tenant "my-tenant"',
        status: 422,
      })

    // act & assert
    const command = new PolicyValidateCommand(input)
    await assertRejects(
      () => flowcoreClient.execute(command),
      Error,
      "PolicyValidateCommand failed with 422:",
    )
  })

  it("should surface a 404 when the organization does not exist", async () => {
    // arrange
    const input = {
      organizationId: "00000000-0000-0000-0000-000000000000",
      policyDocuments: [
        {
          statementId: "1",
          resource: "*",
          action: "read",
        },
      ],
    }

    fetchMockerBuilder.post("/api/v1/policies/validate")
      .matchBody(input)
      .respondWith(404, {
        code: "NOT_FOUND",
        message: "Organization not found 00000000-0000-0000-0000-000000000000",
        status: 404,
      })

    // act & assert
    const command = new PolicyValidateCommand(input)
    await assertRejects(
      () => flowcoreClient.execute(command),
      Error,
      "PolicyValidateCommand failed with 404:",
    )
  })
})
