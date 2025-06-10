import { assertEquals } from "@std/assert"
import { afterAll, describe, it } from "jsr:@std/testing/bdd"
import { FlowcoreClient } from "../../../../src/mod.ts"
import { TenantAuditLogsCommand } from "../../../../src/commands/iam/tenant-iam-audit/get-audit-for-tenant.ts"
import { FetchMocker } from "../../../fixtures/fetch.fixture.ts"

describe("Audit commands", () => {
  const fetchMocker = new FetchMocker()
  const flowcoreClient = new FlowcoreClient({ getBearerToken: () => "BEARER_TOKEN" })
  const fetchMockerBuilder = fetchMocker.mock("https://iam.api.flowcore.io")

  afterAll(() => {
    fetchMocker.restore()
  })

  describe("TenantAuditLogsCommand", () => {
    it("should get audit logs for a tenant", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const mockResponse = {
        logs: [
          {
            id: crypto.randomUUID(),
            event: "role_assigned",
            resourceName: "admin-role",
            performedBy: "user-123",
            timestamp: "2024-01-15T10:30:00Z",
            status: "success",
          },
          {
            id: crypto.randomUUID(),
            event: "policy_created",
            resourceName: "read-only-policy",
            performedBy: { id: "user-456", name: "John Doe" },
            timestamp: "2024-01-15T11:45:00Z",
            status: "success",
          },
          {
            id: crypto.randomUUID(),
            event: "permission_denied",
            resourceName: "sensitive-data",
            performedBy: null,
            timestamp: "2024-01-15T12:00:00Z",
            status: "failure",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 3,
          totalPages: 1,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({ tenantId })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, 3)
      assertEquals(response.pagination.totalItems, 3)
      assertEquals(response.pagination.page, 1)

      // Check first log entry
      assertEquals(response.logs[0].event, "role_assigned")
      assertEquals(response.logs[0].resourceName, "admin-role")
      assertEquals(response.logs[0].performedBy, "user-123")
      assertEquals(response.logs[0].status, "success")

      // Check second log entry (performedBy as object)
      assertEquals(response.logs[1].event, "policy_created")
      assertEquals(typeof response.logs[1].performedBy, "object")

      // Check third log entry (performedBy as null)
      assertEquals(response.logs[2].event, "permission_denied")
      assertEquals(response.logs[2].performedBy, null)
      assertEquals(response.logs[2].status, "failure")
    })

    it("should get audit logs with pagination", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const page = 2
      const pageSize = 10

      const mockResponse = {
        logs: [
          {
            id: crypto.randomUUID(),
            event: "user_login",
            resourceName: "auth-system",
            performedBy: "user-789",
            timestamp: "2024-01-14T09:00:00Z",
            status: "success",
          },
        ],
        pagination: {
          page,
          pageSize,
          totalItems: 25,
          totalPages: 3,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({
        tenantId,
        page,
        pageSize,
      })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, 1)
      assertEquals(response.pagination.page, 2)
      assertEquals(response.pagination.pageSize, 10)
      assertEquals(response.pagination.totalItems, 25)
      assertEquals(response.pagination.totalPages, 3)
    })

    it("should get audit logs filtered by resource type", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const resourceType = "role"

      const mockResponse = {
        logs: [
          {
            id: crypto.randomUUID(),
            event: "role_created",
            resourceName: "new-admin-role",
            performedBy: "admin-user",
            timestamp: "2024-01-15T14:30:00Z",
            status: "success",
          },
          {
            id: crypto.randomUUID(),
            event: "role_deleted",
            resourceName: "old-user-role",
            performedBy: "admin-user",
            timestamp: "2024-01-15T15:00:00Z",
            status: "success",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 2,
          totalPages: 1,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({
          resourceType,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({
        tenantId,
        resourceType,
      })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, 2)
      assertEquals(response.logs[0].event, "role_created")
      assertEquals(response.logs[1].event, "role_deleted")
    })

    it("should get audit logs filtered by status", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const status = "failure"

      const mockResponse = {
        logs: [
          {
            id: crypto.randomUUID(),
            event: "unauthorized_access",
            resourceName: "protected-resource",
            performedBy: "unknown-user",
            timestamp: "2024-01-15T16:00:00Z",
            status: "failure",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 1,
          totalPages: 1,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({
          status,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({
        tenantId,
        status: "failure",
      })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, 1)
      assertEquals(response.logs[0].status, "failure")
      assertEquals(response.logs[0].event, "unauthorized_access")
    })

    it("should get audit logs filtered by date range", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const startDate = "2024-01-01"
      const endDate = "2024-01-31"

      const mockResponse = {
        logs: [
          {
            id: crypto.randomUUID(),
            event: "monthly_report",
            resourceName: "audit-report",
            performedBy: "system",
            timestamp: "2024-01-15T00:00:00Z",
            status: "success",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 1,
          totalPages: 1,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({
          startDate,
          endDate,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({
        tenantId,
        startDate,
        endDate,
      })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, 1)
      assertEquals(response.logs[0].event, "monthly_report")
    })

    it("should get audit logs filtered by performer", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const performedBy = "admin-user-123"

      const mockResponse = {
        logs: [
          {
            id: crypto.randomUUID(),
            event: "system_config_changed",
            resourceName: "auth-settings",
            performedBy: performedBy,
            timestamp: "2024-01-15T17:30:00Z",
            status: "success",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 1,
          totalPages: 1,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({
          performedBy,
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({
        tenantId,
        performedBy,
      })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, 1)
      assertEquals(response.logs[0].performedBy, performedBy)
    })

    it("should handle complex filtering with multiple parameters", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const filters = {
        page: 1,
        pageSize: 5,
        resourceType: "policy",
        performedBy: "admin",
        status: "success" as const,
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      }

      const mockResponse = {
        logs: [
          {
            id: crypto.randomUUID(),
            event: "policy_updated",
            resourceName: "security-policy",
            performedBy: "admin",
            timestamp: "2024-01-10T12:00:00Z",
            status: "success",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 5,
          totalItems: 1,
          totalPages: 1,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({
          page: "1",
          pageSize: "5",
          resourceType: "policy",
          performedBy: "admin",
          status: "success",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({
        tenantId,
        ...filters,
      })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, 1)
      assertEquals(response.logs[0].event, "policy_updated")
      assertEquals(response.logs[0].performedBy, "admin")
      assertEquals(response.logs[0].status, "success")
    })

    it("should return empty logs when no audit entries exist", async () => {
      // arrange
      const tenantId = crypto.randomUUID()

      const mockResponse = {
        logs: [],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({})
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({ tenantId })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs, [])
      assertEquals(response.pagination.totalItems, 0)
      assertEquals(response.pagination.totalPages, 0)
    })

    it("should handle large audit log responses", async () => {
      // arrange
      const tenantId = crypto.randomUUID()
      const logsCount = 100

      const mockLogs = Array.from({ length: logsCount }, (_, i) => ({
        id: crypto.randomUUID(),
        event: `event_${i}`,
        resourceName: `resource_${i}`,
        performedBy: `user_${i}`,
        timestamp: `2024-01-${String(i % 28 + 1).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:00:00Z`,
        status: i % 2 === 0 ? "success" : "failure",
      }))

      const mockResponse = {
        logs: mockLogs,
        pagination: {
          page: 1,
          pageSize: 100,
          totalItems: logsCount,
          totalPages: 1,
        },
      }

      fetchMockerBuilder.get(`/api/v1/tenant-iam-audit/${tenantId}`)
        .matchSearchParams({
          pageSize: "100",
        })
        .matchHeaders({
          "authorization": "Bearer BEARER_TOKEN",
        })
        .respondWith(200, mockResponse)

      // act
      const command = new TenantAuditLogsCommand({
        tenantId,
        pageSize: 100,
      })
      const response = await flowcoreClient.execute(command, true)

      // assert
      assertEquals(response.logs.length, logsCount)
      assertEquals(response.pagination.totalItems, logsCount)
      assertEquals(response.logs[0].event, "event_0")
      assertEquals(response.logs[99].event, "event_99")

      // Check that statuses alternate
      assertEquals(response.logs[0].status, "success")
      assertEquals(response.logs[1].status, "failure")
    })
  })
})
