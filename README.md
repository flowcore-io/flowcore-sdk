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
import { Client, DataCoreFetchByNameCommand } from "@flowcore/sdk"

const client = new Client({
  getAuthToken: async (): Promise<string> => {
    const token = await someMethodToGetToken()
    return token
  },
})

const command = new DataCoreFetchByNameCommand({
  organization: "my-org",
  dataCore: "my-data-core",
})

const result = await client.execute(command)
```
