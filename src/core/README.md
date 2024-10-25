# Flowcore SDK

This is the Flowcore SDK core package, a TypeScript library for interacting with the Flowcore API.

## Installation

```bash
# npm / yarn
npx jsr add @flowcore/sdk-core
npx jsr add @flowcore/sdk-data-core

# Deno
deno add jsr:@flowcore/sdk-core
deno add jsr:@flowcore/sdk-data-core
```

## Examples

### Execute a command

```typescript
import { Client } from "@flowcore/sdk-core"
import { DataCoreFetchByNameCommand } from "@flowcore/sdk-data-core"

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
