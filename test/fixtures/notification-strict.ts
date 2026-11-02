import assert from "node:assert/strict"
import { Subject } from "rxjs"

const sockets: Socket[] = []
class Socket {
  protocol = ""
  onopen?: () => void
  onerror?: (event: Event) => void
  onclose?: (event: { code: number; reason: string }) => void
  sent: string[] = []
  constructor(
    readonly url: string,
    readonly protocols: string[],
  ) {
    sockets.push(this)
  }
  send(value: string) {
    this.sent.push(value)
  }
  close() {}
}
globalThis.WebSocket = Socket as unknown as typeof WebSocket
globalThis.fetch = (async () =>
  Response.json([
    {
      id: "core",
      tenantId: "tenant",
      tenant: "synthetic",
      name: "synthetic",
      description: "",
      accessControl: "private",
      deleteProtection: false,
      isDeleting: false,
      isFlowcoreManaged: false,
    },
  ])) as unknown as typeof fetch
const { NotificationClient } = await import("../../src/common/notification-client.ts")
const logger = { debug() {}, info() {}, warn() {}, error() {} }
for (const bearer of [false, true]) {
  for (const outcome of ["error", "close", "missing-protocol", "success"]) {
    sockets.length = 0
    const observer = new Subject()
    let failure: Error | undefined
    observer.subscribe({
      error: (error) => {
        failure = error
      },
    })
    const client = new NotificationClient(
      observer as never,
      bearer
        ? { oidcClient: { getToken: async () => ({ accessToken: "synthetic-token" }) } }
        : { apiKey: "synthetic-key", apiKeyId: "synthetic-id" },
      { tenant: "synthetic", dataCore: "synthetic" },
      { allowQueryFallback: false, reconnectInterval: 1, logger },
    )
    await client.connect()
    const socket = sockets[0]
    assert.equal(new URL(socket.url).search, "")
    assert.equal(socket.protocols[0], bearer ? "flowcore-bearer" : "flowcore-api-key")
    if (outcome === "error") socket.onerror?.(new Event("error"))
    if (outcome === "close") socket.onclose?.({ code: 1006, reason: "synthetic" })
    if (outcome === "missing-protocol") socket.onopen?.()
    if (outcome === "success") {
      socket.protocol = socket.protocols[0]
      socket.onopen?.()
    } else socket.onclose?.({ code: 1006, reason: "synthetic" })
    await Bun.sleep(10)
    assert.equal(sockets.length, 1)
    assert.equal(socket.sent.length, outcome === "success" ? 1 : 0)
    assert.equal(failure?.message, outcome === "success" ? undefined : "Notification WebSocket handshake failed")
    assert.equal(client.isConnecting, false)
    client.disconnect()
  }
}
sockets.length = 0
const legacy = new NotificationClient(
  new Subject(),
  { apiKey: "synthetic-key", apiKeyId: "synthetic-id" },
  { tenant: "synthetic", dataCore: "synthetic" },
  { logger },
)
await legacy.connect()
sockets[0].onerror?.(new Event("error"))
sockets[0].onclose?.({ code: 1006, reason: "" })
await Bun.sleep(10)
assert.equal(sockets.length, 2)
assert.equal(new URL(sockets[1].url).searchParams.get("api_key"), "synthetic-key")
legacy.disconnect()
console.log("strict notification transport passed")
