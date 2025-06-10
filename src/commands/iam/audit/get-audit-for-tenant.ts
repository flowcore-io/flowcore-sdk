import { Command, parseResponseHelper } from "@flowcore/sdk"
import { Type } from "@sinclair/typebox"

/**
 * Audit log entry type
 */
export const AuditLogEntrySchema = Type.Object({
  id: Type.String(),
  event: Type.String(),
  resourceName: Type.String(),
  performedBy: Type.Union([
    Type.String(),
    Type.Object({}), // Allow performedBy to be any object
    Type.Null(), // Or null
  ]),
  timestamp: Type.String(),
  status: Type.String(),
})

/**
 * Pagination information
 */
export const PaginationSchema = Type.Object({
  page: Type.Number(),
  pageSize: Type.Number(),
  totalItems: Type.Number(),
  totalPages: Type.Number(),
})

/**
 * Audit log response schema
 */
export const AuditLogResponseSchema = Type.Object({
  logs: Type.Array(AuditLogEntrySchema),
  pagination: PaginationSchema,
})

/**
 * Audit log entry type
 */
export type AuditLogEntry = {
  id: string
  event: string
  resourceName: string
  performedBy: string | Record<string, unknown> | null
  timestamp: string
  status: string
}

/**
 * Pagination information
 */
export type Pagination = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/**
 * Audit log response type
 */
export type AuditLogResponse = {
  logs: AuditLogEntry[]
  pagination: Pagination
}

/**
 * The input for the tenant audit logs command
 */
export interface TenantAuditLogsInput {
  /** The tenant id */
  tenantId: string
  /** Page number (1-based) */
  page?: number
  /** Page size */
  pageSize?: number
  /** Filter by resource type */
  resourceType?: string
  /** Filter by user who performed the action */
  performedBy?: string
  /** Filter by status (success or failure) */
  status?: "success" | "failure"
  /** Filter by start date */
  startDate?: string
  /** Filter by end date */
  endDate?: string
}

/**
 * Fetch audit logs for a tenant
 */
export class TenantAuditLogsCommand extends Command<
  TenantAuditLogsInput,
  AuditLogResponse
> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    // Build base path
    let path = `/api/v1/tenant-iam-audit/${this.input.tenantId}`


    // Add query parameters directly to the path
    const queryParams = []

    if (this.input.page !== undefined) {
      queryParams.push(
        `page=${encodeURIComponent(this.input.page.toString())}`,
      )
    }

    if (this.input.pageSize !== undefined) {
      queryParams.push(
        `pageSize=${encodeURIComponent(this.input.pageSize.toString())}`,
      )
    }

    if (this.input.resourceType) {
      queryParams.push(
        `resourceType=${encodeURIComponent(this.input.resourceType)}`,
      )
    }

    if (this.input.performedBy) {
      queryParams.push(
        `performedBy=${encodeURIComponent(this.input.performedBy)}`,
      )
    }

    if (this.input.status) {
      queryParams.push(`status=${encodeURIComponent(this.input.status)}`)
    }

    if (this.input.startDate) {
      queryParams.push(`startDate=${encodeURIComponent(this.input.startDate)}`)
    }

    if (this.input.endDate) {
      queryParams.push(`endDate=${encodeURIComponent(this.input.endDate)}`)
    }

    // Add query parameters to path if there are any
    if (queryParams.length > 0) {
      path += `?${queryParams.join("&")}`
    }

    return path
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): AuditLogResponse {
    try {
      console.log(
        "Parsing response for TenantAuditLogsCommand:",
        typeof rawResponse === "object" ? `${JSON.stringify(rawResponse).slice(0, 200)}...` : rawResponse,
      )

      // Handle empty responses
      if (!rawResponse) {
        console.warn("Empty response received from API")
        return {
          logs: [],
          pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
        }
      }

      // Try the normal parsing
      return parseResponseHelper(AuditLogResponseSchema, rawResponse)
    } catch (error) {
      console.error("Error parsing tenant audit logs response:", error)


      throw error
    }
  }
}
