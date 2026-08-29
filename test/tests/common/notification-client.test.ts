import { assertEquals } from "@test/compat/assert"
import { describe, it } from "bun:test"
import { Subject } from "rxjs"
import { NotificationClient, type NotificationEvent } from "../../../src/common/notification-client.ts"
import type { Logger } from "../../../src/utils/logger.ts"

function recordingLogger(): Logger & { calls: Record<keyof Logger, string[]> } {
  const calls: Record<keyof Logger, string[]> = { debug: [], info: [], warn: [], error: [] }
  return {
    calls,
    debug: (m) => calls.debug.push(m),
    info: (m) => calls.info.push(m),
    warn: (m) => calls.warn.push(m),
    error: (m) => calls.error.push(String(m)),
  }
}

function makeClient() {
  const observer = new Subject<NotificationEvent>()
  const events: NotificationEvent[] = []
  observer.subscribe((e) => events.push(e))
  const logger = recordingLogger()
  const client = new NotificationClient(
    observer,
    { apiKey: "test-key" },
    { tenant: "t", dataCore: "dc" },
    { logger },
  )
  // handleMessage is the internal frame parser the WebSocket onmessage delegates to.
  const handle = (raw: string) => (client as unknown as { handleMessage(raw: string): void }).handleMessage(raw)
  return { handle, events, logger }
}

function validFrame(pattern = "event.stored.x"): string {
  const inner = JSON.stringify({
    pattern,
    data: {
      tenantId: "t",
      eventId: "evt-1",
      dataCore: "dc",
      aggregator: "fishfacts-ais.0",
      eventType: "ais.position.fix.observed.0",
      validTime: "2026-01-01T00:00:00Z",
    },
  })
  return JSON.stringify({ message: inner })
}

describe("NotificationClient.handleMessage", () => {
  it("emits a NotificationEvent for a well-formed frame", () => {
    const { handle, events } = makeClient()
    handle(validFrame())
    assertEquals(events.length, 1)
    assertEquals(events[0].pattern, "event.stored.x")
    assertEquals(events[0].data.eventId, "evt-1")
    assertEquals(events[0].data.flowType, "fishfacts-ais.0")
  })

  // Regression: a single malformed frame must NOT throw. In production handleMessage
  // runs inside the WebSocket onmessage callback, so an uncaught throw here crashes
  // the whole process (observed repeatedly in prod via an unguarded JSON.parse).
  it("does not throw or emit when data.message is not valid JSON", () => {
    const { handle, events, logger } = makeClient()
    handle(JSON.stringify({ message: "this-is-not-json{" }))
    assertEquals(events.length, 0)
    assertEquals(logger.calls.warn.length >= 1, true)
  })

  it("does not throw when message is empty or missing", () => {
    const { handle, events } = makeClient()
    handle(JSON.stringify({ message: "" }))
    handle(JSON.stringify({ foo: "bar" }))
    assertEquals(events.length, 0)
  })

  it("does not throw when the inner payload lacks a data field", () => {
    const { handle, events } = makeClient()
    handle(JSON.stringify({ message: JSON.stringify({ pattern: "p" }) }))
    assertEquals(events.length, 0)
  })

  it("does not throw on a non-JSON outer frame", () => {
    const { handle, events } = makeClient()
    handle("not even json")
    assertEquals(events.length, 0)
  })

  it("handles validation frames without emitting", () => {
    const { handle, events, logger } = makeClient()
    handle(JSON.stringify({ type: "validation", summary: "bad", message: "nope", found: "x", errors: [] }))
    assertEquals(events.length, 0)
    assertEquals(logger.calls.error.length >= 1, true)
  })
})

// The security property of this client, asserted directly: on the default
// transport the credential is NOT in the URL. An ingress access log records the
// request line, so a credential in the query string is written to disk in
// plaintext — 59 distinct live `fc_` keys were found in two hours of production
// nginx logs before this changed.
describe("NotificationClient credential transport", () => {
  type Handshake = { query: URLSearchParams; protocols: string[] }
  type Credential =
    | { kind: "bearer"; token: string }
    | { kind: "apiKey"; apiKey: string; apiKeyId?: string }

  function build(credential: Credential, transport?: "subprotocol" | "query"): Handshake {
    const { client } = makeClientForTransport()
    const internal = client as unknown as {
      authTransport: "subprotocol" | "query"
      buildCredentialHandshake(c: Credential): Handshake
    }
    if (transport) internal.authTransport = transport
    return internal.buildCredentialHandshake(credential)
  }

  function makeClientForTransport() {
    const observer = new Subject<NotificationEvent>()
    const client = new NotificationClient(
      observer,
      { apiKey: "fc_secret", apiKeyId: "key-id" },
      { tenant: "t", dataCore: "dc" },
      { logger: recordingLogger() },
    )
    return { client }
  }

  it("defaults to the subprotocol transport and puts NOTHING in the query", () => {
    const h = build({ kind: "apiKey", apiKey: "fc_secret", apiKeyId: "key-id" })
    assertEquals(h.query.toString(), "")
    assertEquals(h.protocols, ["flowcore-api-key", "fc_secret", "key-id"])
  })

  it("keeps a bearer token out of the query too", () => {
    const h = build({ kind: "bearer", token: "jwt-value" })
    assertEquals(h.query.toString(), "")
    assertEquals(h.protocols, ["flowcore-bearer", "jwt-value"])
  })

  // The legacy transport is retained ONLY as a fallback for a server that has
  // not shipped subprotocol support. It is the shape that leaks, so it is
  // pinned here to make any accidental re-defaulting visible.
  it("carries the credential in the query ONLY on the legacy transport", () => {
    const h = build({ kind: "apiKey", apiKey: "fc_secret", apiKeyId: "key-id" }, "query")
    assertEquals(h.protocols, [])
    assertEquals(h.query.get("api_key"), "fc_secret")
    assertEquals(h.query.get("api_key_id"), "key-id")
  })

  it("omits api_key_id when the caller did not supply one", () => {
    const h = build({ kind: "apiKey", apiKey: "fc_secret" }, "query")
    assertEquals(h.query.get("api_key_id"), null)
  })
})
