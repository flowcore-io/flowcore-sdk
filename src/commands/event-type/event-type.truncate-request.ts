import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { CommandError } from "../../exceptions/command-error.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { EventTypeFetchCommand } from "./event-type.fetch.ts"

/**
 * The input for the event type truncate request command
 */
export interface EventTypeTruncateRequestInput {
  /** The id of the event type */
  eventTypeId: string

  /** Wait for the event type to be truncated (default: true) */
  waitForTruncate?: boolean
}

const graphQlQuery = `
  mutation FLOWCORE_SDK_EVENT_TYPE_TRUNCATE_REQUEST($eventTypeId: ID!) {
    eventType(id: $eventTypeId) {
      requestTruncate {
        truncating
      }
    }
  }
`

const responseSchema = Type.Object({
  errors: Type.Optional(Type.Array(Type.Object({
    message: Type.String(),
  }))),
  data: Type.Union([
    Type.Object({
      eventType: Type.Object({
        requestTruncate: Type.Union([
          Type.Object({
            truncating: Type.Boolean(),
          }),
          Type.Null(),
        ]),
      }),
    }),
    Type.Null(),
  ]),
})

/**
 * Request to truncate a event type
 * @deprecated Use `EventTypeRequestTruncateCommand` instead
 */
export class EventTypeTruncateRequestCommand extends GraphQlCommand<EventTypeTruncateRequestInput, boolean> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Create a new event type truncate request command
   */
  constructor(input: EventTypeTruncateRequestInput) {
    super({
      ...input,
      waitForTruncate: input.waitForTruncate ?? true,
    })
  }

  /**
   * Parse the response
   */
  protected override parseResponse(response: unknown): boolean {
    const parsedResponse = parseResponseHelper(responseSchema, response)
    if (parsedResponse.errors) {
      throw new CommandError(this.constructor.name, parsedResponse.errors[0].message)
    }
    if (!parsedResponse.data?.eventType?.requestTruncate) {
      throw new NotFoundException("EventType", { id: this.input.eventTypeId })
    }
    return parsedResponse.data.eventType.requestTruncate.truncating
  }

  /**
   * Get the body for the request
   */
  protected override getBody(): Record<string, unknown> {
    const { waitForTruncate: _, ...rest } = this.input
    return {
      query: graphQlQuery,
      variables: rest,
    }
  }

  /**
   * Wait for the response (timeout: 25 seconds)
   */
  protected override async processResponse(client: FlowcoreClient, response: boolean): Promise<boolean> {
    if (!this.input.waitForTruncate) {
      return response
    }
    const start = Date.now()
    while (Date.now() - start < 25_000) {
      const response = await client.execute(
        new EventTypeFetchCommand({
          eventTypeId: this.input.eventTypeId,
        }),
      )
      if (response.isTruncating) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return response
  }
}
