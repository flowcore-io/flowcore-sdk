# Flowcore SDK

This is the Flowcore SDK, a TypeScript library for interacting with the Flowcore API.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Client Configuration](#client-configuration)
- [API Reference](#api-reference)
  - [Tenant Operations](#tenant-operations)
  - [API Key Management](#api-key-management)
  - [Secret Operations](#secret-operations)
  - [Variable Operations](#variable-operations)
  - [Data Core Operations](#data-core-operations)
  - [Flow Type Operations](#flow-type-operations)
  - [Event Type Operations](#event-type-operations)
  - [Scenario Operations](#scenario-operations)
  - [Notifications](#notifications)
  - [Adapter Operations](#adapter-operations)

## Installation

```bash
# Bun
bunx jsr add @flowcore/sdk

# Deno
deno add jsr:@flowcore/sdk

# npm / yarn
npx jsr add @flowcore/sdk
```

## Getting Started

### Client Configuration

The FlowcoreClient can be initialized in several ways:

```typescript
import { FlowcoreClient } from "@flowcore/sdk"

// 1. With a bearer token
const clientWithBearer = new FlowcoreClient({
  getBearerToken: async (): Promise<string> => {
    const token = await someMethodToGetToken()
    return token
  },
})

// 2. With an API key
const clientWithApiKey = new FlowcoreClient({
  apiKeyId: "my-api-key-id",
  apiKey: "my-api-key",
})

// 3. With retry configuration
const clientWithRetry = new FlowcoreClient({
  apiKeyId: "my-api-key-id",
  apiKey: "my-api-key",
  retry: {
    delay: 100,    // Delay in milliseconds between retries
    maxRetries: 5, // Maximum number of retry attempts
  },
})
```

> **Note**: When retry is not configured, it defaults to 250ms delay and 3 max retries. To disable retry, set `retry` to `null`.

## API Reference

### Tenant Operations

> **Important**: Tenant operations require bearer token authentication and cannot be performed using API key authentication.

#### Fetch a Tenant

You can fetch a Tenant either by ID or by name:

```typescript
import { TenantFetchCommand, FlowcoreClient } from "@flowcore/sdk"

// Fetch by ID
const fetchById = new TenantFetchCommand({
  tenantId: "your-tenant-id"
})

// Fetch by name
const fetchByName = new TenantFetchCommand({
  tenant: "your-tenant-name"
})

const result = await client.execute(fetchById) // or fetchByName
// Returns a Tenant object:
// {
//   id: string;
//   name: string;
//   displayName: string;
//   description: string;
//   website: string;
// }
```

#### List Tenants

```typescript
import { TenantListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new TenantListCommand({})

const tenants = await client.execute(command)
// Returns an array of TenantWithLinkType objects:
// {
//   id: string;
//   name: string;
//   displayName: string;
//   description: string;
//   website: string;
//   linkType: "OWNER" | "COLLABORATOR";
// }
```

> **Note**: The `linkType` field indicates your relationship with the tenant - either as an owner or collaborator.

### API Key Management

> **Important**: API key management operations require bearer token authentication and cannot be performed using API key authentication.

#### Create an API Key

```typescript
import { ApiKeyCreateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ApiKeyCreateCommand({
  tenantId: "your-tenant-id",
  name: "my-new-api-key"
})

const result = await client.execute(command)
// Result will contain:
// {
//   id: string;
//   name: string;
//   createdAt: string;
//   value: string; // The API key value - store this securely!
// }
```

> **Important**: The API key value is only returned once during creation. Make sure to store it securely as you won't be able to retrieve it again.

#### List API Keys

```typescript
import { ApiKeyListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ApiKeyListCommand({
  tenantId: "your-tenant-id"
})

const apiKeys = await client.execute(command)
// Returns an array of:
// {
//   id: string;
//   name: string;
//   createdAt: string;
// }
```

#### Delete an API Key

```typescript
import { ApiKeyDeleteCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ApiKeyDeleteCommand({
  tenantId: "your-tenant-id",
  apiKeyId: "api-key-id-to-delete"
})

const result = await client.execute(command)
// Returns true if deletion was successful
```

### Secret Operations

> **Important**: Secret operations require bearer token authentication and cannot be performed using API key authentication.

#### Create a Secret

```typescript
import { SecretCreateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new SecretCreateCommand({
  tenantId: "your-tenant-id",
  key: "MY_SECRET_KEY",
  value: "my-secret-value"
})

const result = await client.execute(command)
// Returns: boolean indicating if creation was successful
```

> **Important**: Secret values should be handled securely and never logged or exposed in your application.

#### List Secrets

```typescript
import { SecretListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new SecretListCommand({
  tenantId: "your-tenant-id"
})

const secrets = await client.execute(command)
// Returns an array of secret keys (not values):
// string[]
```

> **Note**: For security reasons, the list operation only returns the secret keys, not their values.

#### Delete a Secret

```typescript
import { SecretDeleteCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new SecretDeleteCommand({
  tenantId: "your-tenant-id",
  key: "MY_SECRET_KEY"
})

const result = await client.execute(command)
// Returns: boolean indicating if deletion was successful
```

> **Important**: Deleting a secret is irreversible. Make sure you have a backup if needed.

### Variable Operations

> **Important**: Variable operations require bearer token authentication and cannot be performed using API key authentication.

#### Create a Variable

```typescript
import { VariableCreateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new VariableCreateCommand({
  tenantId: "your-tenant-id",
  key: "MY_VARIABLE_KEY",
  value: "my-variable-value"
})

const result = await client.execute(command)
// Returns the created Variable:
// {
//   key: string;
//   value: string;
// }
```

#### List Variables

```typescript
import { VariableListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new VariableListCommand({
  tenantId: "your-tenant-id"
})

const variables = await client.execute(command)
// Returns an array of Variables:
// {
//   key: string;
//   value: string;
// }[]
```

#### Delete a Variable

```typescript
import { VariableDeleteCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new VariableDeleteCommand({
  tenantId: "your-tenant-id",
  key: "MY_VARIABLE_KEY"
})

const result = await client.execute(command)
// Returns: boolean indicating if deletion was successful
```

> **Important**: Deleting a variable is irreversible. Make sure you have a backup if needed.

### Data Core Operations

#### Create a Data Core

```typescript
import { DataCoreCreateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new DataCoreCreateCommand({
  tenantId: "your-tenant-id",
  name: "my-data-core",
  description: "My awesome data core",
  accessControl: "private",
  deleteProtection: true
})

const result = await client.execute(command)
// Returns the created DataCore object:
// {
//   id: string;
//   name: string;
//   description: string;
//   accessControl: "public" | "private";
//   deleteProtection: boolean;
//   isDeleting: boolean;         // Indicates if the data core is being deleted
//   isFlowcoreManaged: boolean;  // Indicates if the data core is managed by Flowcore
//   createdAt: string;          // ISO timestamp of creation
//   updatedAt: string;          // ISO timestamp of last update
// }
```

#### Fetch a Data Core

You can fetch a Data Core either by ID or by name:

```typescript
import { DataCoreFetchCommand, FlowcoreClient } from "@flowcore/sdk"

// Fetch by ID
const fetchById = new DataCoreFetchCommand({
  dataCoreId: "your-data-core-id"
})

// Fetch by name
const fetchByName = new DataCoreFetchCommand({
  tenantId: "your-tenant-id",
  dataCore: "your-data-core-name"
})

const result = await client.execute(fetchById) // or fetchByName
```

#### List Data Cores

```typescript
import { DataCoreListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new DataCoreListCommand({
  tenantId: "your-tenant-id",  // Optional: Filter by tenant ID
  tenant: "tenant-name"        // Optional: Filter by tenant name
})

const dataCores = await client.execute(command)
// Returns an array of DataCore objects
```

#### Update a Data Core

```typescript
import { DataCoreUpdateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new DataCoreUpdateCommand({
  dataCoreId: "your-data-core-id",
  description: "Updated description",     // Optional
  accessControl: "public",                // Optional
  deleteProtection: false                 // Optional
})

const updatedDataCore = await client.execute(command)
```

#### Check if a Data Core Exists

```typescript
import { DataCoreExistsCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new DataCoreExistsCommand({
  dataCoreId: "your-data-core-id"
})

const result = await client.execute(command)
// Returns: { exists: boolean }
```

#### Delete a Data Core

```typescript
import { DataCoreDeleteRequestCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new DataCoreDeleteRequestCommand({
  dataCoreId: "your-data-core-id",
  waitForDelete: true  // Optional: Wait for deletion to complete (default: true)
})

const result = await client.execute(command)
// Returns: boolean indicating if deletion was successful
```

> **Note**: If `waitForDelete` is set to `true`, the command will wait up to 25 seconds for the deletion to complete.

### Flow Type Operations

#### Create a Flow Type

```typescript
import { FlowTypeCreateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new FlowTypeCreateCommand({
  dataCoreId: "your-data-core-id",
  name: "my-flow-type",
  description: "My awesome flow type"
})

const result = await client.execute(command)
// Returns the created FlowType object:
// {
//   id: string;
//   name: string;
//   description: string;
//   dataCoreId: string;
//   createdAt: string;
//   updatedAt: string;
// }
```

#### Fetch a Flow Type

You can fetch a Flow Type either by ID or by name:

```typescript
import { FlowTypeFetchCommand, FlowcoreClient } from "@flowcore/sdk"

// Fetch by ID
const fetchById = new FlowTypeFetchCommand({
  flowTypeId: "your-flow-type-id"
})

// Fetch by name
const fetchByName = new FlowTypeFetchCommand({
  dataCoreId: "your-data-core-id",
  flowType: "your-flow-type-name"
})

const result = await client.execute(fetchById) // or fetchByName
```

#### List Flow Types

```typescript
import { FlowTypeListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new FlowTypeListCommand({
  dataCoreId: "your-data-core-id"
})

const flowTypes = await client.execute(command)
// Returns an array of FlowType objects
```

#### Update a Flow Type

```typescript
import { FlowTypeUpdateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new FlowTypeUpdateCommand({
  flowTypeId: "your-flow-type-id",
  description: "Updated description"  // Optional
})

const updatedFlowType = await client.execute(command)
```

#### Check if a Flow Type Exists

```typescript
import { FlowTypeExistsCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new FlowTypeExistsCommand({
  flowTypeId: "your-flow-type-id"
})

const result = await client.execute(command)
// Returns: { exists: boolean }
```

#### Delete a Flow Type

```typescript
import { FlowTypeDeleteRequestCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new FlowTypeDeleteRequestCommand({
  flowTypeId: "your-flow-type-id",
  waitForDelete: true  // Optional: Wait for deletion to complete (default: true)
})

const result = await client.execute(command)
// Returns: boolean indicating if deletion was successful
```

> **Note**: If `waitForDelete` is set to `true`, the command will wait up to 25 seconds for the deletion to complete.
> **Important**: Flow Type deletion operations require bearer token authentication.

### Event Type Operations

#### Create an Event Type

```typescript
import { EventTypeCreateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new EventTypeCreateCommand({
  flowTypeId: "your-flow-type-id",
  name: "my-event-type",
  description: "My awesome event type",
  sensitiveDataMask: {
    key: "entityId",
    schema: {
      // Simple fields
      name: true,               // Will be masked completely
      email: "string",          // Will be masked as a string
      age: "number",            // Will be masked as a number
      isActive: "boolean",      // Will be masked as a boolean
      
      // Complex nested objects
      address: {
        street: {
          type: "string",
          faker: "address.streetAddress" // Uses faker.js for realistic values
        },
        city: "string",
        zipCode: {
          type: "string",
          pattern: "\\d{5}"    // Will generate a 5-digit zip code
        }
      },
      
      // Arrays
      phoneNumbers: {
        type: "array",
        count: 2,              // Will generate 2 items
        items: "string"        // Each item will be a masked string
      },
      
      // Objects with properties
      preferences: {
        type: "object",
        properties: {
          theme: "string",
          notifications: "boolean"
        }
      }
    }
  },
  sensitiveDataEnabled: true
})

const result = await client.execute(command)
// Returns the created EventType object:
// {
//   id: string;
//   name: string;
//   description: string;
//   flowTypeId: string;
//   createdAt: string;
//   updatedAt: string;
// }
```

#### Fetch an Event Type

You can fetch an Event Type either by ID or by name:

```typescript
import { EventTypeFetchCommand, FlowcoreClient } from "@flowcore/sdk"

// Fetch by ID
const fetchById = new EventTypeFetchCommand({
  eventTypeId: "your-event-type-id"
})

// Fetch by name
const fetchByName = new EventTypeFetchCommand({
  flowTypeId: "your-flow-type-id",
  eventType: "your-event-type-name"
})

const result = await client.execute(fetchById) // or fetchByName
```

#### List Event Types

```typescript
import { EventTypeListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new EventTypeListCommand({
  flowTypeId: "your-flow-type-id"
})

const eventTypes = await client.execute(command)
// Returns an array of EventType objects
```

#### Update an Event Type

```typescript
import { EventTypeUpdateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new EventTypeUpdateCommand({
  eventTypeId: "your-event-type-id",
  description: "Updated description"  // Optional
})

const updatedEventType = await client.execute(command)
```

#### Check if an Event Type Exists

```typescript
import { EventTypeExistsCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new EventTypeExistsCommand({
  eventTypeId: "your-event-type-id"
})

const result = await client.execute(command)
// Returns: { exists: boolean }
```

#### Delete an Event Type

```typescript
import { EventTypeDeleteRequestCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new EventTypeDeleteRequestCommand({
  eventTypeId: "your-event-type-id",
  waitForDelete: true  // Optional: Wait for deletion to complete (default: true)
})

const result = await client.execute(command)
// Returns: boolean indicating if deletion was successful
```

#### Truncate an Event Type

```typescript
import { EventTypeRequestTruncateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new EventTypeRequestTruncateCommand({
  eventTypeId: "your-event-type-id",
  waitForTruncate: true  // Optional: Wait for truncation to complete (default: true)
})

const result = await client.execute(command)
// Returns: boolean indicating if truncation was successful
```

> **Note**: If `waitForDelete` or `waitForTruncate` is set to `true`, the command will wait up to 25 seconds for the operation to complete.
> **Important**: Event Type deletion and truncation operations require bearer token authentication.

#### Remove Sensitive Data from an Event Type

```typescript
import { EventTypeRemoveSensitiveDataCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new EventTypeRemoveSensitiveDataCommand({
  eventTypeId: "your-event-type-id",
  application: "my-application-name",
  parentKey: "user",
  key: "email",
  type: "scramble" // or "remove"
})

const result = await client.execute(command)
// Returns:
// {
//   success: boolean; // Whether the operation was successful
//   id: string;       // ID of the sensitive data removal record
// }
```

> **Note**: The `type` parameter determines how sensitive data is handled. Use `scramble` to replace the data with a masked version, or `remove` to completely delete it.
> **Important**: Sensitive data removal operations require bearer token authentication.
> **WARNING**: This operation is NON-REVERSIBLE. Once sensitive data has been removed or scrambled, it cannot be recovered. Make sure you have backups before proceeding, as this action permanently alters your data.

### Scenario Operations

Scenario operations allow you to manage scenarios in your Flowcore tenant.

> **Important**: Scenario operations require bearer token authentication and cannot be performed using API key authentication.

#### Create a Scenario

```typescript
import { ScenarioCreateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ScenarioCreateCommand({
  tenantId: "your-tenant-id",
  name: "my-scenario",
  description: "A test scenario", // Optional
  displayName: "My Test Scenario" // Optional
})

const result = await client.execute(command)
// Returns the created Scenario object:
// {
//   id: string;
//   tenantId: string;
//   name: string;
//   displayName?: string;
//   description?: string;
//   createdAt: string;
//   updatedAt: string;
// }
```

#### Fetch a Scenario

```typescript
import { ScenarioFetchCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ScenarioFetchCommand({
  scenarioId: "your-scenario-id"
})

const scenario = await client.execute(command)
```

#### List Scenarios

```typescript
import { ScenarioListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ScenarioListCommand({
  tenantId: "your-tenant-id"
})

const result = await client.execute(command)
// Returns:
// {
//   id: string; // The tenant ID
//   scenarios: Scenario[]; // Array of scenario objects
// }
```

#### Update a Scenario

```typescript
import { ScenarioUpdateCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ScenarioUpdateCommand({
  tenantId: "your-tenant-id",
  scenarioId: "your-scenario-id",
  description: "Updated description", // Optional
  displayName: "Updated Display Name"  // Optional
})

const updatedScenario = await client.execute(command)
```

#### Delete a Scenario

```typescript
import { ScenarioDeleteCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ScenarioDeleteCommand({
  scenarioId: "your-scenario-id"
})

const result = await client.execute(command)
// Returns: { success: boolean }
```

### Event Ingestion Operations

The SDK provides commands for ingesting events into Flowcore event types.

> **Important**: Ingestion operations require API key authentication.

#### Ingest a Single Event

```typescript
import { IngestEventCommand, FlowcoreClient } from "@flowcore/sdk"

// Define your event data type
interface MyEventData {
  userId: string;
  action: string;
  timestamp: number;
  // ... any other fields
}

// Create the ingestion command
const command = new IngestEventCommand<MyEventData>({
  tenantName: "your-tenant-name",
  dataCoreId: "your-data-core-id",
  flowTypeName: "your-flow-type-name",
  eventTypeName: "your-event-type-name",
  eventData: {
    userId: "user-123",
    action: "login",
    timestamp: Date.now()
  },
  // Optional parameters
  metadata: {
    source: "web-app",
    version: "1.0.0"
  },
  eventTime: new Date().toISOString(), // When the event occurred
  validTime: new Date().toISOString(),  // When the event becomes valid
  ttl: true,                           // Set time-to-live flag
  isEphemeral: false                   // Whether to archive the event
})

const result = await client.execute(command)
// Returns:
// {
//   eventId: string;  // The ID of the ingested event
//   success: boolean; // Whether ingestion was successful
// }
```

#### Ingest Multiple Events (Batch)

```typescript
import { IngestBatchCommand, FlowcoreClient } from "@flowcore/sdk"

// Define your event data type
interface MyEventData {
  userId: string;
  action: string;
  timestamp: number;
}

// Create the batch ingestion command
const command = new IngestBatchCommand<MyEventData>({
  tenantName: "your-tenant-name",
  dataCoreId: "your-data-core-id",
  flowTypeName: "your-flow-type-name",
  eventTypeName: "your-event-type-name",
  events: [
    {
      userId: "user-123",
      action: "login",
      timestamp: Date.now()
    },
    {
      userId: "user-456",
      action: "view_profile",
      timestamp: Date.now()
    },
    // Add more events as needed (maximum 25 events per batch)
  ],
  // Optional parameters (applied to all events in the batch)
  metadata: {
    source: "web-app",
    version: "1.0.0"
  },
  eventTime: new Date().toISOString(),
  validTime: new Date().toISOString(),
  ttl: true,
  isEphemeral: false
})

const result = await client.execute(command)
// Returns:
// {
//   eventIds: string[];  // Array of IDs for the ingested events
//   success: boolean;    // Whether the batch ingestion was successful
// }
```

#### Ingestion Options

Both single and batch ingestion support these options:

- **metadata**: Key-value pairs sent as `x-flowcore-metadata-json` header
- **eventTime**: When the event occurred (`x-flowcore-event-time` header)
- **validTime**: When the event becomes valid (`x-flowcore-valid-time` header)
- **ttl**: Enables time-to-live for events (adds `ttl-on/stored-event: true` to metadata)
- **isEphemeral**: Prevents archiving (adds `do-not-archive-on/stored-event: true` to metadata)

> **Note**: Batch ingestion is more efficient for inserting multiple events at once, as it requires only a single API call.
> **Important**: Batch ingestion has a maximum limit of 25 events per request. For larger volumes, split your events into multiple batches.

### AI Agent Coordinator Operations

These commands allow interaction with the AI Agent Coordinator service for managing conversational AI agents.

> **Important**: AI Agent Coordinator operations require bearer token authentication (OAuth2) and cannot be performed using API key authentication.

#### List Conversations

Retrieves metadata for all conversations accessible by the user.

```typescript
import { ConversationListCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ConversationListCommand()

const conversations = await client.execute(command)
// Returns an array of conversation metadata:
// {
//   id: string;
//   title: string;
//   lastUpdated: string; // ISO Date string
// }[]
```

#### Get a Specific Conversation

Retrieves the full details, including messages and context, for a specific conversation.

```typescript
import { ConversationGetCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ConversationGetCommand({ conversationId: "your-conversation-id" })

try {
  const conversation = await client.execute(command)
  // Returns the full Conversation object:
  // {
  //   id: string;
  //   title: string;
  //   lastUpdated: string;
  //   context: ContextItem[]; // Array of items in the conversation's context
  //   messages: Message[];   // Array of messages in the conversation
  // }
} catch (error) {
  if (error instanceof NotFoundException) {
    console.error("Conversation not found:", error.details);
  } else {
    console.error("Failed to get conversation:", error);
  }
}
```

#### Delete a Conversation

Permanently deletes a specific conversation and its associated data.

```typescript
import { ConversationDeleteCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ConversationDeleteCommand({ conversationId: "conversation-id-to-delete" })

try {
  const result = await client.execute(command)
  // Returns: { message: "Conversation deleted successfully." }
  console.log(result.message);
} catch (error) {
  console.error("Failed to delete conversation:", error);
}
```

#### Add Items to Conversation Context

Adds one or more resources (like tenants, data cores) to the context of a specific conversation.

```typescript
import { ContextAddItemCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ContextAddItemCommand({
  conversationId: "your-conversation-id",
  items: [
    { type: "tenant", id: "tenant-id-to-add" },
    { type: "dataCore", id: "data-core-id-to-add" }
  ]
})

try {
  const result = await client.execute(command)
  // Returns the updated context array for the conversation:
  // { context: ContextItem[] }
  console.log("Updated context:", result.context);
} catch (error) {
  console.error("Failed to add context items:", error);
}
```

#### Remove Item from Conversation Context

Removes a specific item instance from the context of a conversation.

```typescript
import { ContextRemoveItemCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ContextRemoveItemCommand({
  conversationId: "your-conversation-id",
  itemId: "context-item-id-to-remove" // The ID of the item in the context array
})

try {
  const result = await client.execute(command)
  // Returns the updated context array for the conversation:
  // { context: ContextItem[] }
  console.log("Updated context after removal:", result.context);
} catch (error) {
  console.error("Failed to remove context item:", error);
}
```

#### Get a Specific Artifact

Retrieves the details (content, data, or url) for a specific artifact by its ID.

```typescript
import { ArtifactGetCommand, FlowcoreClient, NotFoundException } from "@flowcore/sdk"

const command = new ArtifactGetCommand({ artifactId: "your-artifact-id" });

try {
  const artifact = await client.execute(command);
  // Returns the Artifact object:
  // {
  //   artifactId: string;
  //   artifactType: "code" | "markdown" | "table" | "visualization" | "html" | "mermaid";
  //   title: string;
  //   content?: string; // For text-based artifacts
  //   data?: unknown;   // For JSON-based artifacts
  //   url?: string;     // For URL-based artifacts
  // }
  console.log("Artifact details:", artifact);
} catch (error) {
  if (error instanceof NotFoundException) {
    console.error("Artifact not found:", error.details);
  } else {
    console.error("Failed to get artifact:", error);
  }
}
```

#### Stream Conversation Events

The `WebSocketClient` is used to establish a persistent connection for streaming conversation events (like AI responses, tool usage, etc.) for a specific conversation.

```typescript
import {
  WebSocketClient,
  ConversationStreamCommand,
  type ConversationStreamConfig,
  type ConversationStreamSendPayload,
  type StreamChunk
} from "@flowcore/sdk";
import { Subject } from "rxjs";

// 1. Authentication (using bearer token provider)
const authOptions = {
  getBearerToken: async (): Promise<string | null> => {
    // Replace with your actual token retrieval logic
    return "your-bearer-token";
  }
};

// 2. Create the WebSocket Client
const wsClient = new WebSocketClient(authOptions, {
  // Optional configuration
  reconnectInterval: 2000, // milliseconds
  maxReconnects: 5
});

// 3. Define the command for the specific conversation stream
const conversationConfig: ConversationStreamConfig = {
  conversationId: "your-conversation-id"
};
const streamCommand = new ConversationStreamCommand(conversationConfig);

// 4. Connect and handle the stream
async function startStreaming() {
  try {
    console.log(`Connecting to conversation stream: ${conversationConfig.conversationId}...`);
    const activeStream = await wsClient.connect(streamCommand);
    console.log("Stream connected!");

    // Subscribe to incoming chunks
    const subscription = activeStream.output$.subscribe({
      next: (chunk: StreamChunk) => {
        console.log("Received chunk:", chunk.type, chunk);
        // Process different chunk types (markdown_delta, tool_start, etc.)
      },
      error: (error) => {
        console.error("Stream error:", error);
        // Handle stream errors (e.g., attempt reconnect or notify user)
      },
      complete: () => {
        console.log("Stream completed.");
        // Handle stream completion (e.g., connection closed by server or maxReconnects reached)
      }
    });

    // Example: Sending a message to the conversation
    const messageToSend: ConversationStreamSendPayload = { content: "Hello Agent!" };
    const sent = activeStream.send(messageToSend);
    if (sent) {
      console.log("Sent message to agent.");
    } else {
      console.warn("Failed to send message (socket likely not open).");
    }

    // Keep the connection open until explicitly disconnected or an error occurs
    // In a real application, you might have UI events trigger disconnect
    // Example: Disconnect after 60 seconds
    setTimeout(() => {
      console.log("Disconnecting stream...");
      activeStream.disconnect();
      subscription.unsubscribe();
    }, 60000);

  } catch (error) {
    console.error("Failed to connect to WebSocket stream:", error);
  }
}

startStreaming();

// Remember to handle graceful shutdown by calling disconnect
// e.g., wsClient.disconnect() or activeStream.disconnect()
```

**Stream Chunks (`StreamChunk`)**

The `output$` observable emits objects conforming to the `StreamChunk` type (or subtypes). Refer to the API specification or SDK types for details on the different chunk types like `markdown_delta`, `tool_start`, `context_add_item`, etc., and their specific properties.

### Notifications

The NotificationClient allows you to receive real-time notifications when events are ingested into an event type. The notifications follow the hierarchical structure: Data Core → Flow Type → Event Type.

#### Setting up Notifications

```typescript
import { NotificationClient, type NotificationEvent } from "@flowcore/sdk"
import { Subject } from "rxjs"

// Create an RxJS Subject to handle the notifications
const subject = new Subject<NotificationEvent>()

// Subscribe to handle notifications
subject.subscribe({
  next: (event) => {
    console.log("Received event:", event)
    // event.data contains:
    // {
    //   tenant: string;      // Tenant ID
    //   eventId: string;     // Unique event ID
    //   dataCoreId: string;  // Data Core ID
    //   flowType: string;    // Flow Type name
    //   eventType: string;   // Event Type name
    //   validTime: string;   // Timestamp
    // }
  },
  error: (error) => console.error("Error:", error),
  complete: () => console.log("Notification stream completed")
})

// Create the notification client
const client = new NotificationClient(
  subject,
  oidcClient, // Your OIDC client for authentication
  {
    tenant: "your-tenant-name",
    dataCore: "your-data-core-name",
    flowType: "your-flow-type-name",     // Optional: Subscribe to specific flow type
    eventType: "your-event-type-name"    // Optional: Subscribe to specific event type
  },
  {
    reconnectInterval: 1000,             // Optional: Milliseconds between reconnection attempts
    maxReconnects: 5,                    // Optional: Maximum number of reconnection attempts
    maxEvents: 1000,                     // Optional: Maximum number of events to receive
    logger: customLogger                 // Optional: Custom logger implementation
  }
)

// Connect to start receiving notifications
await client.connect()

// Disconnect when done
client.disconnect()
```

> **Note**: The NotificationClient uses WebSocket connections to receive real-time updates.

#### Configuration Options

- **reconnectInterval**: Time in milliseconds between reconnection attempts (default: 1000)
- **maxReconnects**: Maximum number of reconnection attempts (optional)
- **maxEvents**: Maximum number of events to receive before auto-disconnecting (optional)
- **logger**: Custom logger implementation (optional)

#### Subscription Specification

You can narrow down your notification subscription by specifying:

- **tenant**: Required - The tenant name
- **dataCore**: Required - The data core name
- **flowType**: Optional - Specific flow type to monitor
- **eventType**: Optional - Specific event type to monitor (requires flowType to be specified)

> **Important**: The NotificationClient requires OIDC authentication. Make sure your OIDC client implements the required `getToken()` method that returns a Promise with an `accessToken`.

### Adapter Operations

Adapter operations allow you to manage and reset adapters in your Flowcore environment.

> **Important**: Adapter operations require bearer token authentication and cannot be performed using API key authentication.

#### Reset an Adapter

Resets an adapter to a specific state, allowing you to restart processing from a particular time bucket or event.

```typescript
import { ResetAdapterCommand, FlowcoreClient } from "@flowcore/sdk"

const command = new ResetAdapterCommand({
  adapterId: "your-adapter-id",
  tenant: "your-tenant-name",
  timeBucket: "20240101000000",        // Optional: Time bucket to reset from (format: YYYYMMDDhhiiss)
  eventId: "your-event-id",            // Optional: Specific event ID to reset from
  reason: "Manual reset for testing"   // Optional: Reason for the reset
})

const result = await client.execute(command)
// Returns:
// {
//   success: boolean;  // Whether the reset was successful
//   message: string;   // A message describing the result
// }

if (result.success) {
  console.log("Adapter reset successfully:", result.message)
} else {
  console.error("Failed to reset adapter:", result.message)
}
```

#### Reset Parameters

- **adapterId**: Required - The unique identifier of the adapter to reset
- **tenant**: Required - The tenant name where the adapter is located
- **timeBucket**: Optional - The time bucket to reset from in `YYYYMMDDhhiiss` format (e.g., `20240101000000`)
- **eventId**: Optional - A specific event ID to reset from
- **reason**: Optional - A descriptive reason for the reset operation

> **Note**: If both `timeBucket` and `eventId` are provided, the adapter will reset from the specified event within that time bucket.
> **Important**: Resetting an adapter will cause it to reprocess events from the specified point, which may result in duplicate processing if not handled properly in your adapter logic.
