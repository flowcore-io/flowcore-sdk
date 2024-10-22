import { DataCoreFetchByNameCommand } from "./commands/index.ts"
import { Client } from "./common/client.ts"

export * from "./commands/index.ts"
export * from "./common/client.ts"

const client = new Client()

const result = await client.execute(
  new DataCoreFetchByNameCommand({
    organization: "org_123",
    dataCore: "my-data-core",
  }),
)

console.log(result)
