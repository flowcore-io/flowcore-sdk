import { CustomCommand } from "../../common/command-custom.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import type { FlowcoreEvent } from "../../contracts/event.ts"
import { EventListCommand } from "../events/event.list.ts"
import { TimeBucketListCommand } from "../events/time-bucket.list.ts"

/**
 * The input for the events fetch indexes command
 */
export interface EventTypeInfoInput {
  /** the event type id or ids */
  eventTypeId: [string, ...string[]] | string
  /** the limit for the number of last events to fetch (default is 5) */
  limit?: number
}

/**
 * The output for the events tail indexes command
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
 * Fetch time buckets for an event type
 */
export class EventTypeInfoCommand extends CustomCommand<EventTypeInfoInput, EventTypeInfoOutput> {
  /**
   * Custom execute method
   */
  protected override async customExecute(client: FlowcoreClient): Promise<EventTypeInfoOutput> {
    const lastEventsLimit = this.input.limit ?? 5

    const firstTimeBucketCommand = new TimeBucketListCommand({
      eventTypeId: this.input.eventTypeId,
      order: "asc",
      pageSize: 1,
    })
    const lastTimeBucketCommand = new TimeBucketListCommand({
      eventTypeId: this.input.eventTypeId,
      order: "desc",
      pageSize: lastEventsLimit,
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

    for (const timeBucket of lastTimeBucketResponse.timeBuckets) {
      const eventListCommand = new EventListCommand({
        eventTypeId: this.input.eventTypeId,
        timeBucket,
        pageSize: lastEventsLimit - lastEvents.length,
        order: "desc",
      })
      const eventListResponse = await client.execute(eventListCommand)
      lastEvents.push(...eventListResponse.events)
      if (lastEvents.length >= lastEventsLimit) {
        break
      }
    }

    return {
      firstTimeBucket,
      lastTimeBucket,
      lastEvents,
    }
  }
}
