import { assertEquals } from "@std/assert"
import { afterAll, describe, it } from "@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"
import { RoleListCommand } from "../../../../src/commands/iam/roles/get-roles.ts"

describe("Role commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  describe("RoleListCommand", () => {
    it("should list all roles for a tenant", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const organizationId1 = crypto.randomUUID()
      const organizationId2 = crypto.randomUUID()

      // Mock response matches the RoleSchema structure (before transformation)
      const mockResponse = [
        {
          id: crypto.randomUUID(),
          name: "Admin",
          description: "Administrator role with full permissions",
          organizationId: organizationId1,
          flowcoreManaged: false,
          archived: false,
          frn: "frn:role:admin",
        },
        {
          id: crypto.randomUUID(),
          name: "Viewer",
          description: "Read-only access role",
          organizationId: organizationId2,
          flowcoreManaged: false,
          archived: false,
          frn: "frn:role:viewer",
        },
        {
          id: crypto.randomUUID(),
          name: "SystemAdmin",
          description: "Flowcore managed system administrator",
          organizationId: organizationId1,
          flowcoreManaged: true,
          archived: false,
          frn: "frn:role:system-admin",
        },
      ]

      fetchMockerBuilder.get("/api/v1/roles/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new RoleListCommand({ organizationId: tenantId })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.length, 3)

      // Check first role
      assertEquals(response[0].name, "Admin")
      assertEquals(response[0].description, "Administrator role with full permissions")
      assertEquals(response[0].organizationId, organizationId1)
      assertEquals(response[0].flowcoreManaged, false)

      // Check second role
      assertEquals(response[1].name, "Viewer")
      assertEquals(response[1].organizationId, organizationId2)

      // Check third role (Flowcore managed)
      assertEquals(response[2].name, "SystemAdmin")
      assertEquals(response[2].flowcoreManaged, true)
    })

    it("should list roles filtered by name", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const organizationId = crypto.randomUUID()
      const roleName = "Admin"

      const mockResponse = [
        {
          id: crypto.randomUUID(),
          name: roleName,
          description: "Administrator role",
          organizationId,
          flowcoreManaged: false,
          archived: false,
        },
      ]

      fetchMockerBuilder.get("/api/v1/roles/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new RoleListCommand({ organizationId: tenantId })
      const response = await flowcoreClient.execute(command)

      // assert
      assertEquals(response.length, 1)
      assertEquals(response[0].name, roleName)
      assertEquals(response[0].organizationId, organizationId)
    })

    it("should return empty array when no roles exist", async () => {
      // arrange
      const tenantId = crypto.randomUUID()

      fetchMockerBuilder.get("/api/v1/roles/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, [])

      // act
      const command = new RoleListCommand({ organizationId: tenantId })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response, [])
    })

    it("should handle large role lists", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const mockResponse = Array.from({ length: 50 }, (_, i) => ({
        id: crypto.randomUUID(),
        name: `Role${i}`,
        description: `Description for role ${i}`,
        organizationId: crypto.randomUUID(),
        flowcoreManaged: i % 5 === 0, // Every 5th role is Flowcore managed
        archived: false,
      }))

      fetchMockerBuilder.get("/api/v1/roles/")
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new RoleListCommand({ organizationId: tenantId })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.length, 50)
      assertEquals(response[0].name, "Role0")
      assertEquals(response[49].name, "Role49")

      // Check that every 5th role is Flowcore managed
      assertEquals(response[0].flowcoreManaged, true)
      assertEquals(response[1].flowcoreManaged, false)
      assertEquals(response[5].flowcoreManaged, true)
    })
  })
})
