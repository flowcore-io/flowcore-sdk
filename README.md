# Flowcore SDK

This is the Flowcore SDK, a TypeScript library for interacting with the Flowcore API.

## Installation

```bash
# npm / yarn
npx jsr add @flowcore/sdk

# Deno
deno add jsr:@flowcore/sdk
```

## Examples

### Execute a command

```typescript
import { DataCoreFetchByNameCommand, FlowcoreClient } from "@flowcore/sdk"
// With a bearer token
const client = new FlowcoreClient({
  getBearerToken: async (): Promise<string> => {
    const token = await someMethodToGetToken()
    return token
  },
})

// With an api key
const client = new FlowcoreClient({
  apiKeyId: "my-api-key-id",
  apiKey: "my-api-key",
})

// Execute a command
const command = new DataCoreFetchCommand({
  dataCoreId: "my-data-core-id",
})

const result = await client.execute(command)
```
