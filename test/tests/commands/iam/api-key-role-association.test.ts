import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, describe, it } from "jsr:@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { LinkKeyRoleCommand } from "../../../../src/commands/iam/role-associations/link-key-role.ts"
import { UnlinkKeyRoleCommand } from "../../../../src/commands/iam/role-associations/unlink-key-role.ts"
import { KeyRolesCommand } from "../../../../src/commands/iam/role-associations/get-key-roles.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("ApiKeyRoleAssociation commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  describe("LinkKeyRoleCommand", () => {
    it("should create an api key role association", async () => {
      // arrange
      const apiKeyId = crypto.randomUUID()
      const roleId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()

      const mockResponse = {
        roleId,
        organizationId,
        keyId: apiKeyId,
      }

      fetchMockerBuilder.post(`/api/v1/role-associations/key/${apiKeyId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(201, mockResponse)

      // act
      const command = new LinkKeyRoleCommand({
        keyId: apiKeyId,
        roleId,
      })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, {
        roleId,
        organizationId,
        keyId: apiKeyId,
      })
    })

    it("should handle 400 bad request error", async () => {
      // arrange
      const apiKeyId = crypto.randomUUID()
      const roleId = crypto.randomUUID()

      fetchMockerBuilder.post(`/api/v1/role-associations/key/${apiKeyId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(400, { error: "Invalid role ID" })

      // act & assert
      const command = new LinkKeyRoleCommand({
        keyId: apiKeyId,
        roleId,
      })

      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "LinkKeyRoleCommand failed with 400:",
      )
    })
  })

  describe("KeyRolesCommand", () => {
    it("should list api key role associations", async () => {
      // arrange
      const apiKeyId = crypto.randomUUID()
      const organizationId1 = crypto.randomUUID()
      const organizationId2 = crypto.randomUUID()

      // Mock response matches the RoleSchema structure (before transformation)
      const mockResponse = [
        {
          id: crypto.randomUUID(),
          name: "Admin",
          description: "Administrator role",
          organizationId: organizationId1,
          flowcoreManaged: false,
        },
        {
          id: crypto.randomUUID(),
          name: "User",
          description: "Regular user role",
          organizationId: organizationId2,
          flowcoreManaged: false,
        },
      ]

      fetchMockerBuilder.get(`/api/v1/role-associations/key/${apiKeyId}/`)
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new KeyRolesCommand({ keyId: apiKeyId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 2)
      assertEquals(response[0].name, "Admin")
      assertEquals(response[1].name, "User")
      // Verify organizationId is transformed to tenantId
      assertEquals(response[0].organizationId, organizationId1)
      assertEquals(response[1].organizationId, organizationId2)
      // flowcoreManaged property exists
      assertEquals(response[0].flowcoreManaged, false)
    })

    it("should return empty array when no associations exist", async () => {
      // arrange
      const apiKeyId = crypto.randomUUID()

      fetchMockerBuilder.get(`/api/v1/role-associations/key/${apiKeyId}/`)
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, [])

      // act
      const command = new KeyRolesCommand({ keyId: apiKeyId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, [])
    })
  })

  describe("UnlinkKeyRoleCommand", () => {
    it("should delete an api key role association", async () => {
      // arrange
      const apiKeyId = crypto.randomUUID()
      const roleId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()

      const mockResponse = {
        roleId,
        organizationId,
        keyId: apiKeyId,
      }

      fetchMockerBuilder.delete(`/api/v1/role-associations/key/${apiKeyId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UnlinkKeyRoleCommand({
        keyId: apiKeyId,
        roleId,
      })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, {
        roleId,
        organizationId,
        keyId: apiKeyId,
      })
    })

    it("should handle 404 not found error", async () => {
      // arrange
      const apiKeyId = crypto.randomUUID()
      const roleId = crypto.randomUUID()

      fetchMockerBuilder.delete(`/api/v1/role-associations/key/${apiKeyId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(404, { error: "Association not found" })

      // act & assert
      const command = new UnlinkKeyRoleCommand({
        keyId: apiKeyId,
        roleId,
      })

      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "UnlinkKeyRoleCommand failed with 404:",
      )
    })
  })
})
