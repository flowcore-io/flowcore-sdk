import "dotenv/config"
import { FlowcoreClient } from "../../src/common/flowcore-client.ts"
import { DataCoreFetchCommand } from "../../src/commands/data-core/data-core.fetch.ts"
import { FlowTypeFetchCommand } from "../../src/commands/flow-type/flow-type.fetch.ts"
import { EventTypeFetchCommand } from "../../src/commands/event-type/event-type.fetch.ts"
import { EventsFetchTimeBucketsByNamesCommand } from "../../src/commands/events/events.fetch-time-buckets-by-names.ts"
import { TimeBucketListCommand } from "../../src/commands/events/time-bucket.list.ts"
import { EventsFetchCommand } from "../../src/commands/events/events.fetch.ts"
import { EventListCommand } from "../../src/commands/events/event.list.ts"

const TENANT = "globe-tracker-aps"
const DATA_CORE_NAME = "konttivuokraus-data"
const FLOW_TYPE_NAME = "location.0"
const EVENT_TYPE_NAME = "created.0"

// --- Intercept fetch to log all URLs ---
const originalFetch = globalThis.fetch
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
  const method = init?.method ?? (input instanceof Request ? input.method : "GET")
  console.log(`\n>>> FETCH ${method} ${url}`)
  if (init?.body) {
    try {
      const body = typeof init.body === "string" ? JSON.parse(init.body) : init.body
      console.log(">>> BODY:", JSON.stringify(body, null, 2))
    } catch {
      console.log(">>> BODY:", init.body)
    }
  }
  const response = await originalFetch(input, init)
  console.log(`<<< ${response.status} ${response.statusText}`)
  return response
}) as typeof globalThis.fetch

// --- Main ---
async function main() {
  const apiKey = process.env.FLOWCORE_API_KEY
  if (!apiKey) {
    console.error("FLOWCORE_API_KEY not set in .env")
    process.exit(1)
  }

  const client = new FlowcoreClient({ apiKey })

  // Step 1: Resolve data core
  console.log("\n========== Step 1: Fetch Data Core ==========")
  const dataCore = await client.execute(
    new DataCoreFetchCommand({ tenant: TENANT, dataCore: DATA_CORE_NAME }),
  )
  console.log("Data Core ID:", dataCore.id)
  console.log("Data Core:", JSON.stringify(dataCore, null, 2))

  // Step 2: Resolve flow type
  console.log("\n========== Step 2: Fetch Flow Type ==========")
  const flowType = await client.execute(
    new FlowTypeFetchCommand({ dataCoreId: dataCore.id, flowType: FLOW_TYPE_NAME }),
  )
  console.log("Flow Type ID:", flowType.id)
  console.log("Flow Type:", JSON.stringify(flowType, null, 2))

  // Step 3: Resolve event type
  console.log("\n========== Step 3: Fetch Event Type ==========")
  const eventType = await client.execute(
    new EventTypeFetchCommand({ flowTypeId: flowType.id, eventType: EVENT_TYPE_NAME }),
  )
  console.log("Event Type ID:", eventType.id)
  console.log("Event Type:", JSON.stringify(eventType, null, 2))

  // Step 4: Fetch time buckets — both methods
  console.log("\n========== Step 4a: Time Buckets by Names (POST) ==========")
  const timeBucketsByNames = await client.execute(
    new EventsFetchTimeBucketsByNamesCommand({
      tenant: TENANT,
      dataCoreId: dataCore.id,
      flowType: FLOW_TYPE_NAME,
      eventTypes: [EVENT_TYPE_NAME],
    }),
  )
  console.log("Time buckets (by names):", timeBucketsByNames.timeBuckets.length, "buckets")
  console.log("First 5:", timeBucketsByNames.timeBuckets.slice(0, 5))

  console.log("\n========== Step 4b: Time Buckets by ID (GET) ==========")
  const timeBucketsById = await client.execute(
    new TimeBucketListCommand({
      tenant: TENANT,
      eventTypeId: eventType.id,
    }),
  )
  console.log("Time buckets (by ID):", timeBucketsById.timeBuckets.length, "buckets")
  console.log("First 5:", timeBucketsById.timeBuckets.slice(0, 5))

  // Compare
  console.log("\n========== Time Bucket Comparison ==========")
  console.log("By names count:", timeBucketsByNames.timeBuckets.length)
  console.log("By ID count:", timeBucketsById.timeBuckets.length)
  console.log("Match:", JSON.stringify(timeBucketsByNames.timeBuckets) === JSON.stringify(timeBucketsById.timeBuckets))

  // Step 5: Fetch events from first time bucket
  const timeBucket = timeBucketsByNames.timeBuckets[0] ?? timeBucketsById.timeBuckets[0]
  if (!timeBucket) {
    console.log("\nNo time buckets found — cannot fetch events")
    client.close()
    return
  }

  console.log("\n========== Step 5a: Events by Names (POST) — timeBucket:", timeBucket, "==========")
  const eventsByNames = await client.execute(
    new EventsFetchCommand({
      tenant: TENANT,
      dataCoreId: dataCore.id,
      flowType: FLOW_TYPE_NAME,
      eventTypes: [EVENT_TYPE_NAME],
      timeBucket,
    }),
  )
  console.log("Events (by names):", eventsByNames.events.length, "events")
  if (eventsByNames.events[0]) {
    console.log("First event:", JSON.stringify(eventsByNames.events[0], null, 2))
  }
  console.log("Next cursor:", eventsByNames.nextCursor)

  console.log("\n========== Step 5b: Events by ID (GET) — timeBucket:", timeBucket, "==========")
  const eventsById = await client.execute(
    new EventListCommand({
      tenant: TENANT,
      eventTypeId: eventType.id,
      timeBucket,
    }),
  )
  console.log("Events (by ID):", eventsById.events.length, "events")
  if (eventsById.events[0]) {
    console.log("First event:", JSON.stringify(eventsById.events[0], null, 2))
  }
  console.log("Next cursor:", eventsById.nextCursor)

  // Compare
  console.log("\n========== Event Comparison ==========")
  console.log("By names count:", eventsByNames.events.length)
  console.log("By ID count:", eventsById.events.length)

  // Step 6: Also try direct (non-dedicated) fetch for comparison
  console.log("\n========== Step 6a: Events by Names DIRECT (skip dedicated URL) ==========")
  const eventsByNamesDirect = await client.execute(
    new EventsFetchCommand({
      tenant: TENANT,
      dataCoreId: dataCore.id,
      flowType: FLOW_TYPE_NAME,
      eventTypes: [EVENT_TYPE_NAME],
      timeBucket,
    }),
    true, // direct = true, skips dedicated URL resolution
  )
  console.log("Events (by names, direct):", eventsByNamesDirect.events.length, "events")

  console.log("\n========== Step 6b: Events by ID DIRECT (skip dedicated URL) ==========")
  const eventsByIdDirect = await client.execute(
    new EventListCommand({
      tenant: TENANT,
      eventTypeId: eventType.id,
      timeBucket,
    }),
    true, // direct = true
  )
  console.log("Events (by ID, direct):", eventsByIdDirect.events.length, "events")

  // Final summary
  console.log("\n========== SUMMARY ==========")
  console.log("Time buckets by names:", timeBucketsByNames.timeBuckets.length)
  console.log("Time buckets by ID:   ", timeBucketsById.timeBuckets.length)
  console.log("Events by names (dedicated):", eventsByNames.events.length)
  console.log("Events by ID (dedicated):   ", eventsById.events.length)
  console.log("Events by names (direct):   ", eventsByNamesDirect.events.length)
  console.log("Events by ID (direct):      ", eventsByIdDirect.events.length)

  client.close()
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})
