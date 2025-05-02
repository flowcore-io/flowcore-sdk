import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type EventTypeRemovedSensitiveData, EventTypeRemovedSensitiveDataSchema } from "../../contracts/event-type.ts"
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
  /** The identifier of the application that is trying to remove sensitive data */
  applicationId?: string
  /** The parent key of the event type */
  parentKey?: string
  /** The cursor to start the list from */
  cursor?: string
  /** The limit of the number of items to return */
  limit?: number
}

/**
 * Fetch an event type
 */
export class EventTypeListRemovedSensitiveDataCommand
  extends Command<EventTypeListRemovedSensitiveDataInput, EventTypeRemovedSensitiveData[]> {
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
    this.input.applicationId && queryParams.set("applicationId", this.input.applicationId)
    this.input.cursor && queryParams.set("cursor", this.input.cursor)
    this.input.limit && queryParams.set("limit", this.input.limit.toString())
    return `/api/v1/event-types/sensitive-data/${this.input.tenantId}?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): EventTypeRemovedSensitiveData[] {
    return parseResponseHelper(Type.Array(EventTypeRemovedSensitiveDataSchema), rawResponse)
  }
}
