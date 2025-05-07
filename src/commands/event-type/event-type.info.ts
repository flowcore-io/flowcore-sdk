import { CustomCommand } from "../../common/command-custom.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import type { FlowcoreEvent } from "../../contracts/event.ts"
import { EventListCommand, type EventListOutput } from "../events/event.list.ts"
import { TimeBucketListCommand } from "../events/time-bucket.list.ts"

/**
 * The input for the events fetch info command
 */
export interface EventTypeInfoInput {
  /** the tenant */
  tenant: string
  /** the event type id or ids */
  eventTypeId: [string, ...string[]] | string
  /** the limit for the number of last events to fetch (default is 5) */
  limit?: number
  /** include sensitive data */
  includeSensitiveData?: boolean
}

/**
 * The output for the events fetch info command
 */
export interface EventTypeInfoOutput {
  /** the first time bucket */
  firstTimeBucket?: string
  /** the last time bucket */
  lastTimeBucket?: string
  /** the last events */
  lastEvents: FlowcoreEvent[]
}

/**
 * Fetch information about an event type
 *
 * contains the first and last time bucket and the last {limit} events
 */
export class EventTypeInfoCommand extends CustomCommand<EventTypeInfoInput, EventTypeInfoOutput> {
  /**
   * Custom execute method
   */
  protected override async customExecute(client: FlowcoreClient): Promise<EventTypeInfoOutput> {
    const lastEventsLimit = this.input.limit ?? 5

    const firstTimeBucketCommand = new TimeBucketListCommand({
      tenant: this.input.tenant,
      eventTypeId: this.input.eventTypeId,
      order: "asc",
      pageSize: 1,
    })
    const lastTimeBucketCommand = new TimeBucketListCommand({
      tenant: this.input.tenant,
      eventTypeId: this.input.eventTypeId,
      order: "desc",
      pageSize: Math.max(lastEventsLimit, 100),
    })
    const [firstTimeBucketResponse, lastTimeBucketResponse] = await Promise.all([
      client.execute(firstTimeBucketCommand),
      client.execute(lastTimeBucketCommand),
    ])

    const firstTimeBucket: string | undefined = firstTimeBucketResponse.timeBuckets[0]
    const lastTimeBucket: string | undefined = lastTimeBucketResponse.timeBuckets[0]

    if (!firstTimeBucket || !lastTimeBucket) {
      return {
        firstTimeBucket: undefined,
        lastTimeBucket: undefined,
        lastEvents: [],
      }
    }

    const lastEvents: FlowcoreEvent[] = []
    const minLastEventLimit = Math.max(lastEventsLimit, 100)

    for (const timeBucket of lastTimeBucketResponse.timeBuckets) {
      let cursor: string | undefined = undefined

      do {
        const eventListResponse: EventListOutput = await client.execute(
          new EventListCommand({
            eventTypeId: this.input.eventTypeId,
            timeBucket,
            pageSize: minLastEventLimit - lastEvents.length,
            order: "desc",
            tenant: this.input.tenant,
            ...(cursor && { cursor }),
            ...(this.input.includeSensitiveData && { includeSensitiveData: true }),
          }),
        )
        lastEvents.push(...eventListResponse.events)
        cursor = eventListResponse.nextCursor
      } while (cursor && lastEvents.length < lastEventsLimit)

      if (lastEvents.length >= lastEventsLimit) {
        break
      }
    }

    // Trim to max limit if we went over
    if (lastEvents.length > lastEventsLimit) {
      lastEvents.length = lastEventsLimit
    }

    return {
      firstTimeBucket,
      lastTimeBucket,
      lastEvents,
    }
  }
}
