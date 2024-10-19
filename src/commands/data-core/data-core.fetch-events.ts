// import { Command } from "../../common/command.ts"

// export interface DataCoreFetchEventsInput {
//   dataCoreId: string
//   aggregator: string
//   eventType: string
//   cursor?: string
//   fromTimeBucket?: string
//   toTimeBucket?: string
//   pageSize?: number
// }

// export interface DataCoreFetchEventsOutput {
//   events: {
//     eventId: string
//     timeBucket: string
//     eventType: string
//     aggregator: string
//     dataCore: string
//     metadata: string
//     payload: string
//     validTime: string
//   }[]
//   cursor?: string
// }

// /**
//  * Fetch events from a data core
//  */
// export class DataCoreFetchEventsCommand extends Command<DataCoreFetchEventsInput, DataCoreFetchEventsOutput> {
//   private readonly graphQl = `
//     query FLOWCORE_CLI_FETCH_EVENTS($dataCoreId: ID!, $aggregator: String!, $eventTypes: [String!]!, $timeBucket: String!, $cursor: String, $afterEventId: String, $beforeEventId: String, $pageSize: Int) {
//       datacore(search: {id: $dataCoreId}) {
//         fetchEvents(input: {
//           aggregator: $aggregator,
//           eventTypes: $eventTypes,
//           timeBucket: $timeBucket
//           cursor: $cursor
//           afterEventId: $afterEventId
//           beforeEventId: $beforeEventId
//           pageSize: $pageSize
//         }) {
//           events {
//             eventId
//             timeBucket
//             eventType
//             aggregator
//             dataCore
//             metadata
//             payload
//             validTime
//           }
//           cursor
//         }
//       }
//     }
//   `

//   public override parseResponse(response: unknown): DataCoreFetchEventsOutput | null {
//     return response.data.datacore.fetchEvents ?? null
//   }

//   protected override getBody(): string {
//     return JSON.stringify({
//       query: this.graphQl,
//       variables: {
//         dataCoreId: this.input.dataCoreId,
//         aggregator: this.input.aggregator,
//         eventType: this.input.eventType,
//         cursor: this.input.cursor,
//         fromTimeBucket: this.input.fromTimeBucket,
//         toTimeBucket: this.input.toTimeBucket,
//         pageSize: this.input.pageSize,
//       },
//     })
//   }
// }
