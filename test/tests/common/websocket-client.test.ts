import { assertEquals, assertExists, assertInstanceOf, fail } from "@std/assert"
import { delay } from "jsr:@std/async/delay"
import { afterEach, beforeEach, describe, it } from "jsr:@std/testing/bdd"
import { type Stub, stub } from "jsr:@std/testing/mock"
import type { Buffer } from "node:buffer"
import type { Subscription } from "rxjs"

import {
  type ActiveStreamInterface,
  type ClientOptions,
  ConversationStreamCommand, // Use the concrete command
  type ConversationStreamConfig,
  type ConversationStreamSendPayload,
  type StreamChunk,
  WebSocketClient, // Renamed client
  type WebSocketClientOptions,
} from "../../../src/mod.ts"
import { defaultLogger } from "../../../src/utils/logger.ts"

// --- Mock WebSocket Definition (MinimalWebSocket) ---
interface MockMinimalWebSocket {
  url: string
  readyState: number
  onopen: (() => void) | null
  onmessage: ((event: { data: string | ArrayBuffer | Buffer }) => void) | null
  onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null
  onerror: ((event: Event) => void) | null
  send(data: string): void
  close(code?: number, reason?: string): void
  _triggerOpen: () => void
  _triggerMessage: (data: string | ArrayBuffer) => void
  _triggerClose: (code: number, reason: string) => void
  _triggerError: (error?: Error) => void
}

let mockWebSocketInstances: MockMinimalWebSocket[] = []

function mockWebSocketFactory(url: string): MockMinimalWebSocket {
  const instance: MockMinimalWebSocket = {
    url,
    readyState: 0, // CONNECTING
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    send: (_data: string) => {}, // Mock send
    close: (code?: number, reason?: string) => {
      if (instance.readyState < 2) {
        instance.readyState = 2 // CLOSING
        setTimeout(() => {
          if (instance.readyState === 2) {
            instance.readyState = 3 // CLOSED
            const closeCode = code ?? 1005
            const closeReason = reason ?? ""
            instance.onclose?.({ code: closeCode, reason: closeReason, wasClean: closeCode === 1000 })
          }
        }, 5)
      }
    },
    _triggerOpen: () => {
      if (instance.readyState === 0) {
        instance.readyState = 1 // OPEN
        instance.onopen?.()
      }
    },
    _triggerMessage: (data: string | ArrayBuffer) => {
      if (instance.readyState === 1) {
        instance.onmessage?.({ data })
      }
    },
    _triggerClose: (code: number, reason: string) => {
      if (instance.readyState < 3) {
        instance.readyState = 3 // CLOSED
        instance.onclose?.({ code, reason, wasClean: code === 1000 })
      }
    },
    _triggerError: (error?: Error) => {
      if (instance.readyState < 3) {
        instance.onerror?.(new ErrorEvent("error", { error }))
        instance.close(1006, "Abnormal Closure")
      }
    },
  }
  mockWebSocketInstances.push(instance)
  return instance
}
// --- End Mock WebSocket ---

describe("WebSocketClient", () => { // Updated describe block
  let client: WebSocketClient
  let clientOptions: WebSocketClientOptions & { reconnectInterval: number }
  let authOptionsBearer: ClientOptions
  let authOptionsApiKey: ClientOptions
  const testConversationId = "conv_test_123"
  const testConfig: ConversationStreamConfig = { conversationId: testConversationId }
  let testCommand: ConversationStreamCommand
  let sendSpy: Stub<MockMinimalWebSocket, [string]> | undefined
  let closeSpy: Stub<MockMinimalWebSocket, [number?, string?]> | undefined
  let activeStream: ActiveStreamInterface<ConversationStreamSendPayload> | null = null
  let outputSubscription: Subscription | null = null

  beforeEach(() => {
    mockWebSocketInstances = []
    clientOptions = { logger: defaultLogger, reconnectInterval: 10 }
    authOptionsBearer = { getBearerToken: () => Promise.resolve("test-bearer-token") }
    authOptionsApiKey = { apiKey: "test-api-key", apiKeyId: "test-api-key-id" }
    testCommand = new ConversationStreamCommand(testConfig)
    activeStream = null
    outputSubscription = null
    sendSpy = undefined
    closeSpy = undefined
  })

  afterEach(async () => {
    outputSubscription?.unsubscribe() // Unsubscribe if active
    // Ensure disconnect is called if stream was potentially activated
    // Use a small delay if needed for disconnect actions to settle
    activeStream?.disconnect()
    await delay(10)
    sendSpy?.restore()
    closeSpy?.restore()
    // Client itself doesn't need dispose if it manages no global state
  })

  // Helper to create client
  function createClient(authOpts: ClientOptions, clientOpts?: WebSocketClientOptions) {
    return new WebSocketClient(
      authOpts,
      { ...clientOptions, ...clientOpts },
      mockWebSocketFactory,
    )
  }

  it("connect() should create WebSocket with correct URL (Bearer)", async () => {
    client = createClient(authOptionsBearer)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream)
    assertEquals(mockWebSocketInstances.length, 1)
    const instance = mockWebSocketInstances[0]
    const expectedUrl = `wss://ai-coordinator.api.flowcore.io/stream/${testConversationId}?token=test-bearer-token`
    assertEquals(instance.url, expectedUrl)
  })

  it("connect() should create WebSocket with correct URL (API Key)", async () => {
    client = createClient(authOptionsApiKey)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream)
    assertEquals(mockWebSocketInstances.length, 1)
    const instance = mockWebSocketInstances[0]
    const expectedUrl =
      `wss://ai-coordinator.api.flowcore.io/stream/${testConversationId}?api_key=test-api-key&api_key_id=test-api-key-id`
    assertEquals(instance.url, expectedUrl)
  })

  it("should set client state correctly during connection", async () => {
    client = createClient(authOptionsBearer)
    const connectPromise = client.connect(testCommand)
    await delay(0) // Allow connect to start
    assertEquals(client.isConnecting, true)
    assertEquals(client.isOpen, false)
    assertExists(mockWebSocketInstances[0], "WebSocket instance should be created")
    mockWebSocketInstances[0]._triggerOpen()
    activeStream = await connectPromise // Wait for connect to resolve
    await delay(0)
    assertEquals(client.isOpen, true)
    assertEquals(client.isConnecting, false)
  })

  it("output$ should emit received valid chunks", async () => {
    client = createClient(authOptionsBearer)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream, "activeStream should be defined after connect")
    assertExists(mockWebSocketInstances[0])
    mockWebSocketInstances[0]._triggerOpen()
    await delay(0)

    const receivedChunks: StreamChunk[] = []
    outputSubscription = activeStream.output$.subscribe((chunk) => receivedChunks.push(chunk))

    const chunk1: StreamChunk = { type: "markdown_delta", content: "Hello" }
    const chunk2: StreamChunk = { type: "tool_start", tool_name: "test_tool" }

    mockWebSocketInstances[0]._triggerMessage(JSON.stringify(chunk1))
    mockWebSocketInstances[0]._triggerMessage(JSON.stringify(chunk2))

    await delay(0)

    assertEquals(receivedChunks.length, 2)
    assertEquals(receivedChunks[0], chunk1)
    assertEquals(receivedChunks[1], chunk2)
  })

  it("output$ should not emit for malformed JSON messages", async () => {
    client = createClient(authOptionsBearer)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream, "activeStream should be defined after connect")
    assertExists(mockWebSocketInstances[0])
    mockWebSocketInstances[0]._triggerOpen()
    await delay(0)

    const receivedChunks: StreamChunk[] = []
    outputSubscription = activeStream.output$.subscribe((chunk) => receivedChunks.push(chunk))

    mockWebSocketInstances[0]._triggerMessage("this is not json")
    mockWebSocketInstances[0]._triggerMessage("{missing_quote: true")

    await delay(0)

    assertEquals(receivedChunks.length, 0)
  })

  it("activeStream.send() should call WebSocket send", async () => {
    client = createClient(authOptionsBearer)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream, "activeStream should be defined after connect")
    assertExists(mockWebSocketInstances[0])
    const instance = mockWebSocketInstances[0]
    instance._triggerOpen()
    await delay(0)

    sendSpy = stub(instance, "send")

    const message: ConversationStreamSendPayload = { content: "User input" }
    const success = activeStream.send(message)

    assertEquals(success, true)
    assertEquals(sendSpy.calls.length, 1)
    const expectedSerializedPayload = JSON.stringify({
      type: "message",
      payload: message,
    })
    assertEquals(sendSpy.calls[0].args[0], expectedSerializedPayload)
  })

  it("output$ should complete on normal close (code 1000)", async () => {
    client = createClient(authOptionsBearer)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream, "activeStream should be defined after connect")
    assertExists(mockWebSocketInstances[0])
    mockWebSocketInstances[0]._triggerOpen()
    await delay(0)
    assertEquals(client.isOpen, true)

    let completed = false
    outputSubscription = activeStream.output$.subscribe({ complete: () => completed = true })

    mockWebSocketInstances[0]._triggerClose(1000, "Normal closure")
    await delay(10) // Allow close processing

    assertEquals(client.isOpen, false)
    assertEquals(completed, true)
  })

  it("should attempt reconnect on unexpected close and succeed", async () => {
    client = createClient(authOptionsBearer, { maxReconnects: 1 })
    activeStream = await client.connect(testCommand)
    assertExists(mockWebSocketInstances[0])
    const instance1 = mockWebSocketInstances[0]
    instance1._triggerOpen()
    await delay(0)

    instance1._triggerClose(1006, "Abnormal Closure")
    await delay(clientOptions.reconnectInterval + 50) // Wait for reconnect timer + buffer

    assertEquals(mockWebSocketInstances.length, 2, "Should create second instance for reconnect")
    const instance2 = mockWebSocketInstances[1]
    assertEquals(client.isConnecting, true, "Client should be connecting during reconnect")

    instance2._triggerOpen()
    await delay(10) // Allow open state to propagate

    assertEquals(client.isOpen, true, "Client should be open after successful reconnect")
    assertEquals(client.isConnecting, false)
  })

  it("output$ should complete after max reconnect attempts failed", async () => {
    client = createClient(authOptionsBearer, { maxReconnects: 1, reconnectInterval: 5 })
    activeStream = await client.connect(testCommand)
    assertExists(activeStream, "activeStream should be defined after connect")
    assertExists(mockWebSocketInstances[0])
    const instance1 = mockWebSocketInstances[0]
    instance1._triggerOpen()
    await delay(0)

    let completed = false
    let receivedError: Error | null = null
    outputSubscription = activeStream.output$.subscribe({
      error: (err) => receivedError = err,
      complete: () => completed = true,
    })

    instance1._triggerClose(1006, "Close 1")
    await delay(10) // Wait for reconnect attempt 1

    assertEquals(mockWebSocketInstances.length, 2)
    const instance2 = mockWebSocketInstances[1]

    instance2._triggerClose(1006, "Close 2 - Failed reconnect")
    await delay(10) // Allow close processing

    assertEquals(client.isOpen, false)
    assertEquals(client.isConnecting, false)
    assertEquals(mockWebSocketInstances.length, 2)
    assertEquals(completed, true, "Observable should complete after giving up")
    assertEquals(receivedError, null, "Should not error on failed reconnects, just complete")
  })

  it("activeStream.disconnect() should close WebSocket and complete output$", async () => {
    client = createClient(authOptionsBearer)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream, "activeStream should be defined after connect")
    assertExists(mockWebSocketInstances[0])
    const instance1 = mockWebSocketInstances[0]
    closeSpy = stub(instance1, "close")

    instance1._triggerOpen()
    await delay(0)

    let completed = false
    outputSubscription = activeStream.output$.subscribe({ complete: () => completed = true })

    activeStream.disconnect() // Call disconnect on the interface

    assertEquals(closeSpy.calls.length, 1)
    assertEquals(closeSpy.calls[0].args[0], 1000)
    assertEquals(closeSpy.calls[0].args[1], "Disconnected by user")

    await delay(10) // Allow disconnect processing

    assertEquals(client.isOpen, false)
    assertEquals(completed, true, "Observable should complete on disconnect")
  })

  it("output$ should receive error on WebSocket error", async () => {
    client = createClient(authOptionsBearer)
    activeStream = await client.connect(testCommand)
    assertExists(activeStream, "activeStream should be defined after connect")
    assertExists(mockWebSocketInstances[0])
    const instance = mockWebSocketInstances[0]
    instance._triggerOpen()
    await delay(0)

    let receivedError: Error | null = null
    let completed = false
    outputSubscription = activeStream.output$.subscribe({
      error: (err: unknown) => {
        if (err instanceof Error) {
          receivedError = err
        } else {
          console.error("Received non-Error object:", err)
        }
      },
      complete: () => completed = true,
    })

    const mockError = new Error("Test WebSocket Error")
    instance._triggerError(mockError)

    await delay(10)

    if (!receivedError) {
      fail("Error should have been received by observer and be an instance of Error")
    } else {
      assertInstanceOf(receivedError, Error)
      assertEquals((receivedError as Error).message, "WebSocket encountered an error")
    }

    assertEquals(client.isOpen, false)
    assertEquals(completed, false, "Observer should not complete on error")
  })

  it("should connect successfully with bearer token", () => {
    const testConversationId = "conv-456"
    const testConfig: ConversationStreamConfig = { conversationId: testConversationId }
    const command = new ConversationStreamCommand(testConfig)

    const _connectPromise = client.connect(command)
    // ... rest of the test ...
  })
})
