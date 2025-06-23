import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import {
  type Static,
  type TArray,
  type TNull,
  type TNumber,
  type TObject,
  type TProperties,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * Audit log entry type
 */
export const AuditLogEntrySchema: TObject<{
  id: TString
  event: TString
  resourceName: TString
  performedBy: TUnion<[TString, TObject<TProperties>, TNull]>
  timestamp: TString
  status: TString
}> = Type.Object({
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
export const PaginationSchema: TObject<{
  page: TNumber
  pageSize: TNumber
  totalItems: TNumber
  totalPages: TNumber
}> = Type.Object({
  page: Type.Number(),
  pageSize: Type.Number(),
  totalItems: Type.Number(),
  totalPages: Type.Number(),
})

/**
 * Audit log response schema
 */
export const AuditLogResponseSchema: TObject<{
  logs: TArray<typeof AuditLogEntrySchema>
  pagination: typeof PaginationSchema
}> = Type.Object({
  logs: Type.Array(AuditLogEntrySchema),
  pagination: PaginationSchema,
})

/**
 * Audit log entry type
 */
export type AuditLogEntry = Static<typeof AuditLogEntrySchema>

/**
 * Pagination information
 */
export type Pagination = Static<typeof PaginationSchema>

/**
 * Audit log response type
 */
export type AuditLogResponse = Static<typeof AuditLogResponseSchema>

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
  protected override retryOnFailure = true

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
    if (!rawResponse) {
      return {
        logs: [],
        pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      }
    }

    return parseResponseHelper(AuditLogResponseSchema, rawResponse)
  }
}
