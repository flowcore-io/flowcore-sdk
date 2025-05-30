import { assertEquals, assertRejects } from "@std/assert"
import { afterAll, describe, it } from "jsr:@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { UserRoleAssociationCreateCommand } from "../../../../src/commands/iam/user-role-association.create.ts"
import { UserRoleAssociationDeleteCommand } from "../../../../src/commands/iam/user-role-association.delete.ts"
import { UserRoleAssociationListCommand } from "../../../../src/commands/iam/user-role-association.list.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("UserRoleAssociation commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  describe("UserRoleAssociationCreateCommand", () => {
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

      fetchMockerBuilder.post(`/api/v1/role-associations/user/${userId}`)
        .matchBody({
          userId,
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(201, mockResponse)

      // act
      const command = new UserRoleAssociationCreateCommand({
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

      fetchMockerBuilder.post(`/api/v1/role-associations/user/${userId}`)
        .matchBody({
          userId,
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(400, { error: "Invalid role ID" })

      // act & assert
      const command = new UserRoleAssociationCreateCommand({
        userId,
        roleId,
      })
      
      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "UserRoleAssociationCreateCommand failed with 400:"
      )
    })
  })

  describe("UserRoleAssociationListCommand", () => {
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
        },
        {
          id: crypto.randomUUID(),
          name: "User",
          description: "Regular user role",
          organizationId: organizationId2,
          flowcoreManaged: false,
        },
      ]

      fetchMockerBuilder.get(`/api/v1/role-associations/user/${userId}`)
        .matchSearchParams({
          organizationId: tenantId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserRoleAssociationListCommand({ userId, tenantId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 2)
      assertEquals(response[0].name, "Admin")
      assertEquals(response[1].name, "User")
      // Verify organizationId is transformed to tenantId
      assertEquals(response[0].tenantId, organizationId1)
      assertEquals(response[1].tenantId, organizationId2)
      // flowcoreManaged property exists
      assertEquals(response[0].flowcoreManaged, false)
    })

    it("should list user role associations without tenantId", async () => {
      // Create fresh instances for this test
      const fetchMocker = new FetchMocker()
      const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
      const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")
      
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
        },
      ]

      fetchMockerBuilder.get(`/api/v1/role-associations/user/${userId}?`)
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserRoleAssociationListCommand({ userId })
      const response = await flowcoreClient.execute(command, true) // Use direct: true

      // assert
      assertEquals(response.length, 1)
      assertEquals(response[0].name, "GlobalAdmin")
      assertEquals(response[0].tenantId, organizationId)
      assertEquals(response[0].flowcoreManaged, true)
      
      // Clean up
      fetchMocker.restore()
    })

    it("should return empty array when no associations exist", async () => {
      // Create fresh instances for this test
      const fetchMocker = new FetchMocker()
      const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
      const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")
      
      // arrange
      const userId = crypto.randomUUID()

      fetchMockerBuilder.get(`/api/v1/role-associations/user/${userId}?`)
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, [])

      // act
      const command = new UserRoleAssociationListCommand({ userId })
      const response = await flowcoreClient.execute(command, true) // Use direct: true

      // assert
      assertEquals(response, [])
      
      // Clean up
      fetchMocker.restore()
    })
  })

  describe("UserRoleAssociationDeleteCommand", () => {
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

      fetchMockerBuilder.delete(`/api/v1/role-associations/user/${userId}`)
        .matchBody({
          userId,
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserRoleAssociationDeleteCommand({
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

      fetchMockerBuilder.delete(`/api/v1/role-associations/user/${userId}`)
        .matchBody({
          userId,
          roleId,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
          "content-type": "application/json",
        })
        .respondWith(404, { error: "Association not found" })

      // act & assert
      const command = new UserRoleAssociationDeleteCommand({
        userId,
        roleId,
      })
      
      await assertRejects(
        () => flowcoreClient.execute(command),
        Error,
        "UserRoleAssociationDeleteCommand failed with 404:"
      )
    })
  })
}) 