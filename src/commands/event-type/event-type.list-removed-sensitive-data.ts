import { Command } from "../../common/command.ts"
import {
  type EventTypeListRemovedSensitiveDataResponse,
  EventTypeListRemovedSensitiveDataResponseSchema,
} from "../../contracts/event-type.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the event type list removed sensitive data command
 */
export interface EventTypeListRemovedSensitiveDataInput {
  /** The id of the tenant */
  tenantId: string
  /** The id of the data core */
  dataCoreId?: string
  /** The id of the flow type */
  flowTypeId?: string
  /** The id of the event type */
  eventTypeId?: string
  /** The identifier of the application that is trying to remove sensitive data (iLike operation) */
  application?: string
  /** The parent key of the event type (iLike operation) */
  parentKey?: string
  /** The page to fetch (minimum: 1, default: 1) */
  page?: number
  /** The page size (minimum: 1, maximum: 5000, default: 20) */
  pageSize?: number
  /** The type of removal */
  type?: string
  /** The sort order */
  sort?: string
  /** Filter by creation date from (format: date-time) */
  createdAtFrom?: string
  /** Filter by creation date to (format: date-time) */
  createdAtTo?: string
}

/**
 * Fetch an event type
 */
export class EventTypeListRemovedSensitiveDataCommand
  extends Command<EventTypeListRemovedSensitiveDataInput, EventTypeListRemovedSensitiveDataResponse> {
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
    return "https://event-type-2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    this.input.dataCoreId && queryParams.set("dataCoreId", this.input.dataCoreId)
    this.input.flowTypeId && queryParams.set("flowTypeId", this.input.flowTypeId)
    this.input.eventTypeId && queryParams.set("eventTypeId", this.input.eventTypeId)
    this.input.parentKey && queryParams.set("parentKey", this.input.parentKey)
    this.input.application && queryParams.set("application", this.input.application)
    this.input.page && queryParams.set("page", this.input.page.toString())
    this.input.pageSize && queryParams.set("pageSize", this.input.pageSize.toString())
    this.input.type && queryParams.set("type", this.input.type)
    this.input.sort && queryParams.set("sort", this.input.sort)
    this.input.createdAtFrom && queryParams.set("createdAtFrom", this.input.createdAtFrom)
    this.input.createdAtTo && queryParams.set("createdAtTo", this.input.createdAtTo)
    return `/api/v1/event-types/sensitive-data/${this.input.tenantId}?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventTypeListRemovedSensitiveDataResponse {
    return parseResponseHelper(EventTypeListRemovedSensitiveDataResponseSchema, rawResponse)
  }
}
