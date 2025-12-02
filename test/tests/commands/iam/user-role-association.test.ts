import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, describe, it } from "@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { LinkUserRoleCommand } from "../../../../src/commands/iam/role-associations/link-user-role.ts"
import { UnlinkUserRoleCommand } from "../../../../src/commands/iam/role-associations/unlink-user-role.ts"
import { UserRolesCommand } from "../../../../src/commands/iam/role-associations/get-user-roles.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("UserRoleAssociation commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  describe("LinkUserRoleCommand", () => {
    it("should create a user role association", async () => {
      // arrange
      const userId = crypto.randomUUID()
      const roleId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()

      const mockResponse = {
        roleId,
        organizationId,
        userId,
      }

      fetchMockerBuilder.post(`/api/v1/role-associations/user/${userId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(201, mockResponse)

      // act
      const command = new LinkUserRoleCommand({
        userId,
        roleId,
      })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, {
        roleId,
        organizationId,
        userId,
      })
    })

    it("should handle 400 bad request error", async () => {
      // arrange
      const userId = crypto.randomUUID()
      const roleId = crypto.randomUUID()

      fetchMockerBuilder.post(`/api/v1/role-associations/user/${userId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(400, { error: "Invalid role ID" })

      // act & assert
      const command = new LinkUserRoleCommand({
        userId,
        roleId,
      })

      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "LinkUserRoleCommand failed with 400:",
      )
    })
  })

  describe("UserRolesCommand", () => {
    it("should list user role associations", async () => {
      // arrange
      const userId = crypto.randomUUID()
      const tenantId = crypto.randomUUID()
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
          archived: false,
        },
        {
          id: crypto.randomUUID(),
          name: "User",
          description: "Regular user role",
          organizationId: organizationId2,
          flowcoreManaged: false,
          archived: false,
        },
      ]

      fetchMockerBuilder.get(`/api/v1/role-associations/user/${userId}/`)
        .matchSearchParams({
          organizationId: tenantId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserRolesCommand({ userId, organizationId: tenantId })
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

    it("should list user role associations without tenantId", async () => {
      // arrange
      const userId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()

      const mockResponse = [
        {
          id: crypto.randomUUID(),
          name: "GlobalAdmin",
          description: "Global administrator role",
          organizationId,
          flowcoreManaged: true,
          archived: false,
        },
      ]

      fetchMockerBuilder.get(`/api/v1/role-associations/user/${userId}/`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserRolesCommand({ userId })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.length, 1)
      assertEquals(response[0].name, "GlobalAdmin")
      assertEquals(response[0].organizationId, organizationId)
      assertEquals(response[0].flowcoreManaged, true)
    })

    it("should return empty array when no associations exist", async () => {
      // arrange
      const userId = crypto.randomUUID()

      fetchMockerBuilder.get(`/api/v1/role-associations/user/${userId}/`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, [])

      // act
      const command = new UserRolesCommand({ userId })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response, [])
    })
  })

  describe("UnlinkUserRoleCommand", () => {
    it("should delete a user role association", async () => {
      // arrange
      const userId = crypto.randomUUID()
      const roleId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()

      const mockResponse = {
        roleId,
        organizationId,
        userId,
      }

      fetchMockerBuilder.delete(`/api/v1/role-associations/user/${userId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UnlinkUserRoleCommand({
        userId,
        roleId,
      })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, {
        roleId,
        organizationId,
        userId,
      })
    })

    it("should handle 404 not found error", async () => {
      // arrange
      const userId = crypto.randomUUID()
      const roleId = crypto.randomUUID()

      fetchMockerBuilder.delete(`/api/v1/role-associations/user/${userId}/`)
        .matchBody({
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(404, { error: "Association not found" })

      // act & assert
      const command = new UnlinkUserRoleCommand({
        userId,
        roleId,
      })

      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "UnlinkUserRoleCommand failed with 404:",
      )
    })
  })
})
