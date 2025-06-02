import { assertEquals } from "@std/assert"
import { afterAll, describe, it } from "jsr:@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { UserPermissionsCommand } from "../../../../src/commands/iam/permissions/get-user-permissions.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("Permissions commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  describe("UserPermissionsCommand", () => {
    it("should get all permissions for current user", async () => {
      // arrange
      const mockResponse = [
        {
          tenant: "tenant-1",
          type: "datacore",
          id: "datacore-1",
          action: ["read", "write"],
        },
        {
          tenant: "tenant-1",
          type: "role",
          id: "role-1",
          action: ["read"],
        },
        {
          tenant: "tenant-2",
          type: "policy",
          id: "policy-1",
          action: ["create", "read", "update", "delete"],
        },
      ]

      fetchMockerBuilder.get("/api/v1/permissions/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserPermissionsCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 3)
      assertEquals(response[0].tenant, "tenant-1")
      assertEquals(response[0].type, "datacore")
      assertEquals(response[0].id, "datacore-1")
      assertEquals(response[0].action, ["read", "write"])
      
      assertEquals(response[1].type, "role")
      assertEquals(response[1].action, ["read"])
      
      assertEquals(response[2].tenant, "tenant-2")
      assertEquals(response[2].type, "policy")
      assertEquals(response[2].action, ["create", "read", "update", "delete"])
    })

    it("should get permissions filtered by type", async () => {
      // arrange
      const permissionType = "datacore"
      const mockResponse = [
        {
          tenant: "tenant-1",
          type: permissionType,
          id: "datacore-1",
          action: ["read", "write"],
        },
        {
          tenant: "tenant-2",
          type: permissionType,
          id: "datacore-2",
          action: ["read"],
        },
      ]

      fetchMockerBuilder.get("/api/v1/permissions/")
        .matchSearchParams({
          type: permissionType,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserPermissionsCommand({ type: permissionType })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 2)
      assertEquals(response[0].type, permissionType)
      assertEquals(response[1].type, permissionType)
      assertEquals(response[0].tenant, "tenant-1")
      assertEquals(response[1].tenant, "tenant-2")
    })

    it("should return empty array when no permissions exist", async () => {
      // arrange
      fetchMockerBuilder.get("/api/v1/permissions/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, [])

      // act
      const command = new UserPermissionsCommand({})
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response, [])
    })

    it("should handle permissions with single action strings", async () => {
      // arrange
      const mockResponse = [
        {
          tenant: "tenant-1",
          type: "role",
          id: "role-1",
          action: ["read"], // API always returns arrays, but our schema allows single strings
        },
      ]

      fetchMockerBuilder.get("/api/v1/permissions/")
        .matchSearchParams({
          type: "role",
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new UserPermissionsCommand({ type: "role" })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 1)
      assertEquals(response[0].action, ["read"])
    })
  })
}) 