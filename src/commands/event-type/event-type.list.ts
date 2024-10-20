// import { Command } from "../../common/command.ts"
// import { type Static, Type } from "@sinclair/typebox"

// export type EventTypeListInput = {
//   dataCoreId: string
//   aggregator: string
// }

// export type EventTypeListOutput = Static<typeof EventTypeListSchema> | null

// /**
//  * Fetch a data core by name and organization
//  */
// export class EventTypeListCommand extends Command<EventTypeListInput, EventTypeListOutput> {
//   private readonly graphQl = `
//     query FLOWCORE_SDK_EVENT_TYPE_LIST($dataCoreId: ID!, $aggregator: String!) {
//       datacore(search: {id: $dataCoreId}) {
//         flowtypes(search: {aggregator: $aggregator}) {
//           aggregator
//           events {
//             id
//             name
//           }
//         }
//       }
//     }
//   `

//   protected override schema = Type.Object({
//     data: Type.Object({
//       datacore: Type.Object({
//         flowtypes: Type.Array(Type.Object({
//           aggregator: Type.String(),
//           events: Type.Array(Type.Object({
//             id: Type.String(),
//             name: Type.String(),
//           })),
//         })),
//       }),
//     }),
//   })

//   protected override parseResponse(rawResponse: unknown): DataCoreFetchByNameOutput {
//     const response = super.parseResponse<typeof this.schema>(rawResponse)
//     if (response.data.organization.datacores[0]) {
//       return dataCoreV0ToDataCore(response.data.organization.datacores[0], response.data.organization.id)
//     }
//     return null
//   }

//   protected override getBody(): string {
//     return JSON.stringify({
//       query: this.graphQl,
//       variables: {
//         organization: this.input.organization,
//         dataCore: this.input.dataCore,
//       },
//     })
//   }
// }
