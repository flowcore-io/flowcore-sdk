import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, describe, it } from "jsr:@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { PolicyCreateCommand } from "../../../../src/commands/iam/policies/create-policy.ts"
import { PolicyListCommand } from "../../../../src/commands/iam/policies/get-policy.ts"
import { PolicyGetCommand } from "../../../../src/commands/iam/policies/id/get-policy.ts"
import { PolicyUpdateCommand } from "../../../../src/commands/iam/policies/id/update-policy.ts"
import { PolicyArchiveCommand } from "../../../../src/commands/iam/policies/id/archive-policy.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("Policy commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  describe("PolicyCreateCommand", () => {
    it("should create a policy", async () => {
      // arrange
      const organizationId = crypto.randomUUID()
      const policyId = crypto.randomUUID()
      const input = {
        organizationId,
        name: "TestPolicy",
        version: "1.0.0",
        policyDocuments: [
          {
            statementId: "stmt1",
            resource: "frn:datacore:*",
            action: ["read", "write"],
          },
          {
            resource: "frn:role:*",
            action: "read",
          },
        ],
        description: "Test policy description",
        principal: "arn:role:admin",
      }

      const mockResponse = {
        id: policyId,
        organizationId,
        name: "TestPolicy",
        version: "1.0.0",
        policyDocuments: [
          {
            statementId: "stmt1",
            resource: "frn:datacore:*",
            action: ["read", "write"],
          },
          {
            resource: "frn:role:*",
            action: "read",
          },
        ],
        description: "Test policy description",
        principal: "arn:role:admin",
        flowcoreManaged: false,
        frn: `frn:policy:${policyId}`,
      }

      fetchMockerBuilder.post("/api/v1/policies/")
        .matchBody({
          ...input,
          flowcoreManaged: false,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(201, mockResponse)

      // act
      const command = new PolicyCreateCommand(input)
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.id, policyId)
      assertEquals(response.name, "TestPolicy")
      assertEquals(response.version, "1.0.0")
      assertEquals(response.organizationId, organizationId)
      assertEquals(response.flowcoreManaged, false)
      assertEquals(response.policyDocuments.length, 2)
      assertEquals(response.policyDocuments[0].statementId, "stmt1")
      assertEquals(response.policyDocuments[1].resource, "frn:role:*")
    })

    it("should create a policy with flowcoreManaged=true", async () => {
      // arrange
      const organizationId = crypto.randomUUID()
      const input = {
        organizationId,
        name: "SystemPolicy",
        version: "1.0.0",
        policyDocuments: [
          {
            resource: "frn:system:*",
            action: ["*"],
          },
        ],
        flowcoreManaged: true,
      }

      const mockResponse = {
        id: crypto.randomUUID(),
        organizationId,
        name: "SystemPolicy",
        version: "1.0.0",
        policyDocuments: input.policyDocuments,
        flowcoreManaged: true,
        frn: "frn:policy:system",
      }

      fetchMockerBuilder.post("/api/v1/policies/")
        .matchBody({
          ...input,
          flowcoreManaged: true,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(201, mockResponse)

      // act
      const command = new PolicyCreateCommand(input)
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.flowcoreManaged, true)
      assertEquals(response.name, "SystemPolicy")
    })

    it("should handle 400 bad request error", async () => {
      // arrange
      const input = {
        organizationId: "invalid-id",
        name: "",
        version: "1.0.0",
        policyDocuments: [],
      }

      fetchMockerBuilder.post("/api/v1/policies/")
        .matchBody({
          ...input,
          flowcoreManaged: false,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(400, { error: "Invalid policy data" })

      // act & assert
      const command = new PolicyCreateCommand(input)
      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "PolicyCreateCommand failed with 400:"
      )
    })
  })

  describe("PolicyListCommand", () => {
    it("should list all policies", async () => {
      // arrange
      const organizationId1 = crypto.randomUUID()
      const organizationId2 = crypto.randomUUID()
      const mockResponse = [
        {
          id: crypto.randomUUID(),
          organizationId: organizationId1,
          name: "AdminPolicy",
          version: "1.0.0",
          policyDocuments: [
            {
              resource: "frn:*",
              action: ["*"],
            },
          ],
          flowcoreManaged: false,
          frn: "frn:policy:admin",
        },
        {
          id: crypto.randomUUID(),
          organizationId: organizationId2,
          name: "ReadOnlyPolicy",
          version: "1.0.0",
          policyDocuments: [
            {
              resource: "frn:datacore:*",
              action: ["read"],
            },
          ],
          flowcoreManaged: true,
          frn: "frn:policy:readonly",
        },
      ]

      fetchMockerBuilder.get("/api/v1/policies/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new PolicyListCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 2)
      assertEquals(response[0].name, "AdminPolicy")
      assertEquals(response[0].flowcoreManaged, false)
      assertEquals(response[1].name, "ReadOnlyPolicy")
      assertEquals(response[1].flowcoreManaged, true)
    })

    it("should list policies filtered by organizationId", async () => {
      // arrange
      const organizationId = crypto.randomUUID()
      const mockResponse = [
        {
          id: crypto.randomUUID(),
          organizationId,
          name: "OrgPolicy",
          version: "1.0.0",
          policyDocuments: [
            {
              resource: "frn:datacore:*",
              action: ["read", "write"],
            },
          ],
          flowcoreManaged: false,
          frn: "frn:policy:org",
        },
      ]

      fetchMockerBuilder.get("/api/v1/policies/")
        .matchSearchParams({
          organizationId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new PolicyListCommand({ organizationId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 1)
      assertEquals(response[0].organizationId, organizationId)
      assertEquals(response[0].name, "OrgPolicy")
    })

    it("should return empty array when no policies exist", async () => {
      // arrange
      fetchMockerBuilder.get("/api/v1/policies/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, [])

      // act
      const command = new PolicyListCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, [])
    })
  })

  describe("PolicyGetCommand (by ID)", () => {
    it("should get a policy by ID using object constructor", async () => {
      // arrange
      const policyId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()
      const mockResponse = {
        id: policyId,
        organizationId,
        name: "GetTestPolicy",
        version: "2.0.0",
        policyDocuments: [
          {
            statementId: "main",
            resource: "frn:datacore:test",
            action: ["read"],
          },
        ],
        description: "Policy for testing get operation",
        flowcoreManaged: false,
        frn: `frn:policy:${policyId}`,
      }

      fetchMockerBuilder.get(`/api/v1/policies/${policyId}`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new PolicyGetCommand({ policyId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.id, policyId)
      assertEquals(response.name, "GetTestPolicy")
      assertEquals(response.version, "2.0.0")
      assertEquals(response.description, "Policy for testing get operation")
    })

    it("should get a policy by ID using string constructor", async () => {
      // arrange
      const policyId = crypto.randomUUID()
      const mockResponse = {
        id: policyId,
        organizationId: crypto.randomUUID(),
        name: "StringConstructorPolicy",
        version: "1.0.0",
        policyDocuments: [],
        flowcoreManaged: true,
        frn: `frn:policy:${policyId}`,
      }

      fetchMockerBuilder.get(`/api/v1/policies/${policyId}`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .persisted()
        .respondWith(200, mockResponse)

      // act
      const command = new PolicyGetCommand(policyId)
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.id, policyId)
      assertEquals(response.name, "StringConstructorPolicy")
      assertEquals(response.flowcoreManaged, true)
    })

    it("should handle 404 not found error", async () => {
      // arrange
      const policyId = crypto.randomUUID()

      fetchMockerBuilder.get(`/api/v1/policies/${policyId}`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(404, { error: "Policy not found" })

      // act & assert
      const command = new PolicyGetCommand(policyId)
      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "PolicyGetCommand failed with 404:"
      )
    })
  })

  describe("PolicyUpdateCommand", () => {
    it("should update a policy", async () => {
      // arrange
      const policyId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()
      const input = {
        policyId,
        organizationId,
        name: "UpdatedPolicy",
        version: "2.0.0",
        policyDocuments: [
          {
            statementId: "updated",
            resource: "frn:datacore:updated",
            action: ["read", "write", "delete"],
          },
        ],
        description: "Updated policy description",
        principal: "arn:role:updated-admin",
      }

      const mockResponse = {
        ...input,
        id: policyId,
        flowcoreManaged: false,
        frn: `frn:policy:${policyId}`,
      }

      fetchMockerBuilder.patch(`/api/v1/policies/${policyId}`)
        .matchBody({
          ...input,
          flowcoreManaged: false,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new PolicyUpdateCommand(input)
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.id, policyId)
      assertEquals(response.name, "UpdatedPolicy")
      assertEquals(response.version, "2.0.0")
      assertEquals(response.description, "Updated policy description")
      assertEquals(response.flowcoreManaged, false)
    })

    it("should handle 403 forbidden error", async () => {
      // arrange
      const policyId = crypto.randomUUID()
      const input = {
        policyId,
        organizationId: crypto.randomUUID(),
        name: "ForbiddenUpdate",
        version: "1.0.0",
        policyDocuments: [],
      }

      fetchMockerBuilder.patch(`/api/v1/policies/${policyId}`)
        .matchBody({
          ...input,
          flowcoreManaged: false,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(403, { error: "Insufficient permissions" })

      // act & assert
      const command = new PolicyUpdateCommand(input)
      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "PolicyUpdateCommand failed with 403:"
      )
    })
  })

  describe("PolicyArchiveCommand", () => {
    it("should archive a policy", async () => {
      // arrange
      const policyId = crypto.randomUUID()
      const mockResponse = {
        message: "Policy archived successfully",
      }

      fetchMockerBuilder.delete(`/api/v1/policies/${policyId}`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new PolicyArchiveCommand({ policyId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.message, "Policy archived successfully")
    })

    it("should handle 404 not found error when archiving", async () => {
      // arrange
      const policyId = crypto.randomUUID()

      fetchMockerBuilder.delete(`/api/v1/policies/${policyId}`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(404, { error: "Policy not found" })

      // act & assert
      const command = new PolicyArchiveCommand({ policyId })
      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "PolicyArchiveCommand failed with 404:"
      )
    })
  })
}) 