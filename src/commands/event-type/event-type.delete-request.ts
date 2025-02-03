import { Type } from "@sinclair/typebox"
import { GraphQlCommand } from "../../common/command.ts"
import { CommandError } from "../../exceptions/command-error.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import type { FlowcoreClient } from "../../common/flowcore-client.ts"
import { EventTypeExistsCommand } from "./event-type.exists.ts"

/**
 * The input for the event type delete request command
 */
export type EventTypeDeleteRequestInput = {
  /** The id of the event type */
  eventTypeId: string

  /** Wait for the event type to be deleted (default: true) */
  waitForDelete?: boolean
}

const graphQlQuery = `
  mutation FLOWCORE_SDK_EVENT_TYPE_DELETE_REQUEST($eventTypeId: ID!) {
    eventType(id: $eventTypeId) {
      requestDelete {
        deleting
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
        requestDelete: Type.Union([
          Type.Object({
            deleting: Type.Boolean(),
          }),
          Type.Null(),
        ]),
      }),
    }),
    Type.Null(),
  ]),
})

/**
 * Request to delete a event type
 */
export class EventTypeDeleteRequestCommand extends GraphQlCommand<EventTypeDeleteRequestInput, boolean> {
  /**
   * The allowed modes for the command
   */
  protected override allowedModes: ("apiKey" | "bearer")[] = ["bearer"]

  /**
   * Create a new event type delete request command
   */
  constructor(input: EventTypeDeleteRequestInput) {
    super({
      ...input,
      waitForDelete: input.waitForDelete ?? true,
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
    if (!parsedResponse.data?.eventType?.requestDelete) {
      throw new NotFoundException("EventType", { id: this.input.eventTypeId })
    }
    return parsedResponse.data.eventType.requestDelete.deleting
  }

  /**
   * Get the body for the request
   */
  protected override getBody() {
    const { waitForDelete: _, ...rest } = this.input
    return {
      query: graphQlQuery,
      variables: rest,
    }
  }

  /**
   * Wait for the response (timeout: 25 seconds)
   */
  protected override async processResponse(client: FlowcoreClient, response: boolean): Promise<boolean> {
    if (!this.input.waitForDelete) {
      return response
    }
    const start = Date.now()
    while (Date.now() - start < 25_000) {
      const response = await client.execute(
        new EventTypeExistsCommand({
          eventTypeId: this.input.eventTypeId,
        }),
      )
      if (!response.exists) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return response
  }
}
