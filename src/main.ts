import { DataCoreCreateCommand } from "./commands/data-core/data-core.create.ts"
import { Client } from "./common/client.ts"

export * from "./commands/data-core/data-core.create.ts"

// Example usage

const client = new Client({
    getAuthToken: () => "AUTH_TOKEN",
})

const command = new DataCoreCreateCommand({
    organizationId: "123",
    name: "My Data Core",
})

const result = await client.execute(command)

console.log(result)
