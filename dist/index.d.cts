import * as _sinclair_typebox from '@sinclair/typebox';
import { TObject, Static, TString, TBoolean, TUnion, TNull, TLiteral, TOptional, TArray, TRecord, TUnknown, TNumber, TInteger, TProperties, TSchema } from '@sinclair/typebox';
import { Observable, Subject } from 'rxjs';
import { Buffer } from 'node:buffer';

/**
 * An error thrown when the client request fails
 */
declare class ClientError extends Error {
    readonly status: number;
    readonly command: string;
    readonly body?: unknown | undefined;
    constructor(message: string, status: number, command: string, body?: unknown | undefined);
}

/**
 * The options for the bearer token
 */
interface ClientOptionsBearer {
    getBearerToken: () => Promise<string | null> | string | null;
    /**
     * The ID of the API key.
     * @deprecated Use apiKey only instead (apiKeyId is only used for old api keys).
     */
    apiKeyId?: never;
    apiKey?: never;
    retry?: {
        delay: number;
        maxRetries: number;
    } | null;
}
/**
 * The options for the api key
 */
interface ClientOptionsApiKey {
    /**
     * The ID of the API key.
     * @deprecated Use apiKey only instead (apiKeyId is only used for old api keys).
     */
    apiKeyId?: string;
    apiKey: string;
    getBearerToken?: never;
    retry?: {
        delay: number;
        maxRetries: number;
    } | null;
}
/**
 * The options for the client
 */
type ClientOptions = ClientOptionsBearer | ClientOptionsApiKey;
/**
 * A base client for executing commands
 */
declare class FlowcoreClient {
    private readonly options;
    private mode;
    private baseUrl;
    constructor(options: ClientOptions);
    /**
     * Get the auth header
     *
     * Public so that a `CustomCommand` which owns its own transport — a
     * streaming request whose body must NOT be consumed by `innerExecute`'s
     * unconditional `response.json()` — can authenticate its own fetch with
     * exactly the header every other command sends. Read-only: it derives the
     * header from the client options and mutates nothing.
     */
    getAuthHeader(): Promise<string | null>;
    /**
     * Execute a command (inner method)
     */
    private innerExecute;
    /**
     * Override the base URL for all commands
     */
    setBaseUrl(baseUrl: string): void;
    /**
     * Execute a command
     */
    execute<Input, Output>(command: Command<Input, Output>, direct?: boolean): Promise<Output>;
    /**
     * Close the client and clean up resources
     * This should be called when the client is no longer needed to prevent memory leaks
     */
    close(): void;
    /**
     * Dispose the client
     */
    [Symbol.dispose](): void;
}

/**
 * Abstract command for executing requests
 */
declare abstract class Command<Input, Output> {
    /**
     * Whether the command should retry on failure
     */
    protected readonly retryOnFailure: boolean;
    /**
     * The dedicated subdomain for the command
     */
    protected readonly dedicatedSubdomain?: string;
    /**
     * The allowed modes for the command
     */
    protected readonly allowedModes: ("apiKey" | "bearer")[];
    /**
     * The input for the command
     */
    protected readonly input: Input;
    /**
     * The client auth options
     */
    protected readonly clientAuthOptions: {
        token?: string;
        apiKeyId?: string;
        apiKey?: string;
    };
    constructor(input: Input);
    /**
     * Set the client auth options - this is called by the FlowcoreClient
     * before executing the command
     */
    setClientAuthOptions(options: {
        token?: string;
        apiKeyId?: string;
        apiKey?: string;
    }): void;
    /**
     * Get the dedicated base URL
     */
    protected getDedicatedBaseUrl(client: FlowcoreClient): Promise<string | null>;
    /**
     * Get the base URL for the request
     */
    protected abstract getBaseUrl(): string;
    /**
     * Get the method for the request
     */
    protected getMethod(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown> | Array<unknown> | undefined;
    /**
     * Get the headers for the request
     */
    protected getHeaders(): Record<string, string>;
    /**
     * Parse the response
     */
    protected abstract parseResponse(response: unknown): Output;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Get the request object
     */
    getRequest(client: FlowcoreClient, direct?: boolean): Promise<{
        allowedModes: ("apiKey" | "bearer")[];
        body: string | Record<string, unknown> | Array<unknown> | undefined;
        headers: Record<string, string>;
        baseUrl: string;
        path: string;
        method: string;
        parseResponse: (response: unknown) => Output | Promise<Output>;
        processResponse: (client: FlowcoreClient, response: Output) => Promise<Output>;
        handleClientError: (error: ClientError) => void;
        retryOnFailure: boolean;
        customExecute?: (client: FlowcoreClient) => Promise<unknown>;
    }>;
    /**
     * Wait for the response
     */
    protected processResponse(_client: FlowcoreClient, response: Output): Promise<Output>;
}

interface ArtifactGetCommandInput {
    artifactId: string;
}
/**
 * Represents the structure of the artifact returned by the API.
 * Based on the Swagger spec example.
 */
declare const ArtifactSchema: TObject;
type Artifact = typeof ArtifactSchema.static;
declare class ArtifactGetCommand extends Command<ArtifactGetCommandInput, Artifact> {
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getHeaders(): Record<string, string>;
    protected parseResponse(rawResponse: unknown): Artifact;
    protected handleClientError(error: ClientError): void;
}

interface ContextItem {
    type: "tenant" | "dataCore" | "flowType" | "eventType" | string;
    id: string;
    name: string;
    description: string;
}
interface Message {
    id: string;
    role: "system" | "user" | "assistant";
    content: string;
    timestamp: string;
}
interface ConversationMetadata {
    id: string;
    title: string;
    lastUpdated: string;
}
interface Conversation extends ConversationMetadata {
    context: ContextItem[];
    messages: Message[];
}
interface ConversationListResponse {
    conversations: ConversationMetadata[];
}
interface ConversationDeleteResponse {
    message: string;
}
interface ContextUpdateResponse {
    context: ContextItem[];
}
interface AddContextItem {
    type: string;
    id: string;
}
interface AddContextItemsRequest {
    items: AddContextItem[];
}
interface RemoveContextItemRequest {
    itemId: string;
}

/**
 * Input for adding items to a conversation's context.
 */
type ContextAddItemCommandInput = {
    /** The ID of the conversation to modify. */
    conversationId: string;
    /** An array of context items (type and ID) to add. */
    items: AddContextItem[];
};
/**
 * Output containing the updated context array after adding items.
 */
type ContextAddItemCommandOutput = ContextUpdateResponse;
/**
 * Command to add one or more items to the context of a specific conversation.
 */
declare class ContextAddItemCommand extends Command<ContextAddItemCommandInput, ContextAddItemCommandOutput> {
    protected getBaseUrl(): string;
    protected getMethod(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(response: unknown): ContextAddItemCommandOutput;
}

/**
 * Input for removing an item from a conversation's context.
 */
type ContextRemoveItemCommandInput = {
    /** The ID of the conversation to modify. */
    conversationId: string;
    /** The unique ID of the context item instance to remove. */
    itemId: string;
};
/**
 * Output containing the updated context array after removing the item.
 */
type ContextRemoveItemCommandOutput = ContextUpdateResponse;
/**
 * Command to remove a specific item from the context of a conversation.
 */
declare class ContextRemoveItemCommand extends Command<ContextRemoveItemCommandInput, ContextRemoveItemCommandOutput> {
    protected getBaseUrl(): string;
    protected getMethod(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(response: unknown): ContextRemoveItemCommandOutput;
}

/**
 * Input for deleting a specific conversation.
 */
type ConversationDeleteCommandInput = {
    /** The unique ID of the conversation to delete. */
    conversationId: string;
};
/**
 * Output confirming the deletion of the conversation.
 */
type ConversationDeleteCommandOutput = ConversationDeleteResponse;
/**
 * Command to delete a specific conversation by its ID.
 */
declare class ConversationDeleteCommand extends Command<ConversationDeleteCommandInput, ConversationDeleteCommandOutput> {
    protected getBaseUrl(): string;
    protected getMethod(): string;
    protected getPath(): string;
    protected parseResponse(response: unknown): ConversationDeleteCommandOutput;
}

/**
 * Input for fetching a specific conversation.
 */
type ConversationGetCommandInput = {
    /** The unique ID of the conversation to fetch. */
    conversationId: string;
};
/**
 * Output containing the full details of the fetched conversation.
 */
type ConversationGetCommandOutput = Conversation;
/**
 * Command to fetch the details of a specific conversation by its ID.
 */
declare class ConversationGetCommand extends Command<ConversationGetCommandInput, ConversationGetCommandOutput> {
    protected getBaseUrl(): string;
    protected getMethod(): string;
    protected getPath(): string;
    protected parseResponse(response: unknown): ConversationGetCommandOutput;
    protected handleClientError(error: ClientError): void;
}

/**
 * Input for listing conversations.
 * Currently empty as no filters are supported.
 */
type ConversationListCommandInput = Record<string, never>;
/**
 * Output containing a list of conversation metadata.
 */
type ConversationListCommandOutput = ConversationMetadata[];
/**
 * Command to list all conversations accessible by the user.
 */
declare class ConversationListCommand extends Command<ConversationListCommandInput, ConversationListCommandOutput> {
    constructor();
    protected getBaseUrl(): string;
    protected getMethod(): string;
    protected getPath(): string;
    protected parseResponse(response: unknown): ConversationListCommandOutput;
}

/**
 * Configuration for initiating an AI Agent Coordinator stream.
 */
interface AiStreamConfig {
    /** The ID of the conversation to stream. */
    conversationId: string;
}
interface MarkdownDeltaChunk {
    type: "markdown_delta";
    /** The chunk of markdown text. */
    content: string;
}
interface InfoChunk {
    type: "info";
    /** An informational message. */
    message: string;
}
interface ErrorChunk {
    type: "error";
    /** An error message. */
    message: string;
}
interface ToolStartChunk {
    type: "tool_start";
    /** The name of the tool being executed. */
    tool_name: string;
}
interface ToolInputChunk {
    type: "tool_input";
    /** The input provided to the tool (can be any JSON structure). */
    content: unknown;
}
interface ToolOutputChunk {
    type: "tool_output";
    /** The output received from the tool (can be any JSON structure). */
    content: unknown;
}
interface ToolErrorChunk {
    type: "tool_error";
    content: {
        /** A summary error message. */
        error_message: string;
        /** Optional additional details about the error. */
        details?: string | unknown;
    };
}
interface ContextAddItemChunk {
    type: "context_add_item";
    /** The full context item that was added. */
    item: ContextItem;
}
interface TitleUpdateChunk {
    type: "title_update";
    /** The new suggested title for the conversation. */
    title: string;
}
interface ArtifactStartChunk {
    type: "artifact_start";
    artifactId: string;
    artifactType: string;
    title: string;
}
interface ArtifactContentDeltaChunk {
    type: "artifact_content_delta";
    artifactId: string;
    /** The chunk of artifact text content. */
    content: string;
}
interface ArtifactContentChunk {
    type: "artifact_content";
    artifactId: string;
    /** The complete artifact text content. */
    content: string;
}
interface ArtifactDataChunk {
    type: "artifact_data";
    artifactId: string;
    /** The complete JSON data for the artifact. */
    data: unknown;
}
interface ArtifactUrlChunk {
    type: "artifact_url";
    artifactId: string;
    /** The URL pointing to the artifact content. */
    url: string;
}
interface ArtifactEndChunk {
    type: "artifact_end";
    artifactId: string;
}
interface ConversationCreatedChunk {
    type: "conversation_created";
    /** The ID of the newly created conversation. */
    conversationId: string;
}
/**
 * A discriminated union of all possible chunk types streamed from the backend.
 */
type StreamChunk = MarkdownDeltaChunk | InfoChunk | ErrorChunk | ToolStartChunk | ToolInputChunk | ToolOutputChunk | ToolErrorChunk | ContextAddItemChunk | TitleUpdateChunk | ArtifactStartChunk | ArtifactContentDeltaChunk | ArtifactContentChunk | ArtifactDataChunk | ArtifactUrlChunk | ArtifactEndChunk | ConversationCreatedChunk;

/**
 * Interface for a command that configures a WebSocket stream connection.
 * @template Config - The type of the configuration data needed to initiate the stream.
 * @template SendPayload - The type of data that can be sent *to* the stream after connection.
 */
interface WebSocketCommand<Config, SendPayload> {
    /**
     * Gets the configuration data needed to establish the connection.
     */
    getConfig(): Config;
    /**
     * Gets the base WebSocket URL (e.g., wss://server.api.flowcore.io).
     * @returns The base WebSocket URL string.
     */
    getWebSocketBaseUrl(): string;
    /**
     * Gets the specific path segment for the WebSocket URL based on the config
     * (e.g., /api/v1/stream/entity/{id}).
     * @param config - The configuration object.
     * @returns The path segment string.
     */
    getWebSocketPathSegment(config: Config): string;
    /**
     * Serializes the payload to be sent over the WebSocket.
     * Default implementation might be JSON.stringify.
     * @param payload - The payload object to send.
     * @returns The serialized string representation.
     */
    serializeSendPayload?(payload: SendPayload): string;
}
/**
 * Interface representing an active WebSocket stream connection.
 * @template SendPayload - The type of data that can be sent to the stream.
 */
interface ActiveStreamInterface<SendPayload> {
    /**
     * An Observable emitting the raw data chunks received from the WebSocket.
     * Consumers should filter/map this observable based on the specific stream protocol.
     */
    output$: Observable<StreamChunk>;
    /**
     * Sends a payload to the WebSocket stream.
     * @param payload - The data to send, conforming to the SendPayload type.
     * @returns True if the message was queued to be sent, false otherwise (e.g., socket not open).
     */
    send(payload: SendPayload): boolean;
    /**
     * Disconnects the WebSocket stream gracefully.
     */
    disconnect(): void;
}

/**
 * Configuration for the Conversation Stream.
 * Only requires the conversationId.
 */
interface ConversationStreamConfig {
    conversationId?: string;
}
/**
 * Payload type for messages sent *to* the Conversation Stream.
 */
interface ConversationStreamSendPayload {
    content: string;
}
/**
 * Command to stream conversation events for a specific agent.
 */
declare class ConversationStreamCommand implements WebSocketCommand<ConversationStreamConfig, ConversationStreamSendPayload> {
    private config;
    constructor(config: ConversationStreamConfig);
    /** Get the configuration object for the command. */
    getConfig(): ConversationStreamConfig;
    /** Get the base WebSocket URL. */
    getWebSocketBaseUrl(): string;
    /** Get the WebSocket path segment. */
    getWebSocketPathSegment(): string;
    /** Serializer function for outgoing payloads. */
    serializeSendPayload(payload: ConversationStreamSendPayload): string;
}

/**
 * The input for the tenant disable sensitive data command
 */
interface TenantDisableSensitiveDataInput {
    /** The id of the tenant */
    tenantId: string;
}
interface TenantDisableSensitiveDataResponse {
    sensitiveDataEnabled: boolean;
}
/**
 * Disable Sensitive Data Feature for a tenant
 */
declare class TenantDisableSensitiveDataCommand extends Command<TenantDisableSensitiveDataInput, TenantDisableSensitiveDataResponse> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): TenantDisableSensitiveDataResponse;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the tenant enable sensitive data command
 */
interface TenantEnableSensitiveDataInput {
    /** The id of the tenant */
    tenantId: string;
}
interface TenantEnableSensitiveDataResponse {
    sensitiveDataEnabled: boolean;
}
/**
 * Enable Sensitive Data Feature for a tenant
 */
declare class TenantEnableSensitiveDataCommand extends Command<TenantEnableSensitiveDataInput, TenantEnableSensitiveDataResponse> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): TenantEnableSensitiveDataResponse;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The schema for a tenant
 */
declare const TenantSchema: TObject<{
    id: TString;
    name: TString;
    displayName: TString;
    description: TString;
    websiteUrl: TString;
    isDedicated: TBoolean;
    dedicated: TUnion<[
        TNull,
        TObject<{
            status: TUnion<[
                TLiteral<"ready">,
                TLiteral<"degraded">,
                TLiteral<"offline">
            ]>;
            configuration: TObject<{
                domain: TString;
                configurationRepoUrl: TString;
                configurationRepoCredentials: TUnion<[TString, TNull]>;
            }>;
        }>
    ]>;
    sensitiveDataEnabled: TOptional<TBoolean>;
}>;
/**
 * The type for a tenant
 */
type Tenant = Static<typeof TenantSchema>;
/**
 * The schema for a tenant list item
 */
declare const TenantListItemSchema: TObject<{
    id: TString;
    name: TString;
    displayName: TString;
    description: TString;
    websiteUrl: TString;
    isDedicated: TBoolean;
    sensitiveDataEnabled: TBoolean;
    domain: TUnion<[TString, TNull]>;
    permissions: TArray<TString>;
}>;
/**
 * The type for a tenant list item
 */
type TenantListItem = Static<typeof TenantListItemSchema>;
/**
 * The schema for a tenant user.
 */
declare const TenantUserSchema: TObject<{
    id: TString;
    username: TString;
    email: TString;
    firstName: TUnion<[TString, TNull]>;
    lastName: TUnion<[TString, TNull]>;
}>;
/**
 * The type for a tenant user
 */
type TenantUser = Static<typeof TenantUserSchema>;
/**
 * The schema for a public tenant preview
 */
declare const TenantPreviewSchema: TObject;
/**
 * The type for a public tenant preview
 */
type TenantPreview = Static<typeof TenantPreviewSchema>;
/**
 * The schema for a tenant instance
 */
declare const TenantInstanceSchema: TObject<{
    isDedicated: TBoolean;
    instance: TUnion<[
        TNull,
        TObject<{
            status: TString;
            domain: TString;
        }>
    ]>;
}>;
/**
 * The type for a tenant instance
 */
type TenantInstance = Static<typeof TenantInstanceSchema>;

/**
 * The input for the tenant create command
 */
interface TenantCreateInput {
    /** The tenant slug (already normalized, lowercase, URL-safe) */
    tenantSlug: string;
    /** The description of the tenant */
    description?: string;
    /** The display name of the tenant */
    displayName?: string;
}
/**
 * Create a tenant
 */
declare class TenantCreateCommand extends Command<TenantCreateInput, Tenant> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Tenant;
}

/**
 * The input for the tenant fetch by id command
 */
interface TenantFetchByIdInput {
    /** The id of the tenant */
    tenantId: string;
    /** The name of the tenant */
    tenant?: never;
}
/**
 * The input for the tenant fetch by name command
 */
interface TenantFetchByNameInput {
    /** The name of the tenant */
    tenant: string;
    /** The id of the tenant */
    tenantId?: never;
}
/**
 * The input for the tenant fetch command
 */
type TenantFetchInput = TenantFetchByIdInput | TenantFetchByNameInput;
/**
 * Fetch a tenant
 */
declare class TenantFetchCommand extends Command<TenantFetchInput, Tenant> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Tenant;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the tenant instance fetch by id command
 */
interface TenantInstanceFetchByIdInput {
    /** The id of the tenant */
    tenantId: string;
    /** The name of the tenant */
    tenant?: never;
}
/**
 * The input for the tenant instance fetch by name command
 */
interface TenantInstanceFetchByNameInput {
    /** The name of the tenant */
    tenant: string;
    /** The id of the tenant */
    tenantId?: never;
}
/**
 * The input for the tenant instance fetch command
 */
type TenantInstanceFetchInput = TenantInstanceFetchByIdInput | TenantInstanceFetchByNameInput;
/**
 * Fetch a tenant instance
 */
declare class TenantInstanceFetchCommand extends Command<TenantInstanceFetchInput, TenantInstance> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): TenantInstance;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the tenant list command
 */
interface TenantListInput {
    /** Page number (1-based) */
    page?: number;
    /** Number of tenants per page */
    limit?: number;
    /** Tenant ids to pin to the front of the list (comma-separated string or array) */
    ids?: string | string[];
}
/**
 * List tenants
 */
declare class TenantListCommand extends Command<TenantListInput, TenantListItem[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): TenantListItem[];
}

/**
 * The input for the tenant update command
 */
interface TenantUpdateInput {
    /** The id of the tenant to update */
    tenantId: string;
    /** The description of the tenant */
    description?: string;
    /** The display name of the tenant */
    displayName?: string;
    /** The website URL of the tenant */
    website?: string;
}
/**
 * Update a tenant
 */
declare class TenantUpdateCommand extends Command<TenantUpdateInput, Tenant> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Tenant;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the tenant user add command
 */
interface TenantUserAddInput {
    tenantId: string;
    userId: string;
}
/**
 * Add a user to a tenant
 */
declare class TenantUserAddCommand extends Command<TenantUserAddInput, boolean> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): boolean;
}

/**
 * The input for the tenant user remove command
 */
interface TenantUserRemoveInput {
    tenantId: string;
    userId: string;
}
/**
 * Remove a user from a tenant
 */
declare class TenantUserRemoveCommand extends Command<TenantUserRemoveInput, boolean> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): boolean;
}

/**
 * Abstract command for executing custom requests
 */
declare abstract class CustomCommand<Input, Output> extends Command<Input, Output> {
    /**
     * Get the base URL for the request
     */
    protected getBaseUrl(): string;
    /**
     * Custom execute method
     */
    protected abstract customExecute(client: FlowcoreClient): Promise<Output>;
    /**
     * Get the request object
     */
    getRequest(client: FlowcoreClient, direct?: boolean): Promise<{
        allowedModes: ("apiKey" | "bearer")[];
        body: string | Record<string, unknown> | Array<unknown> | undefined;
        headers: Record<string, string>;
        baseUrl: string;
        path: string;
        method: string;
        parseResponse: (response: unknown) => Output | Promise<Output>;
        processResponse: (client: FlowcoreClient, response: Output) => Promise<Output>;
        handleClientError: (error: ClientError) => void;
        retryOnFailure: boolean;
        customExecute: (client: FlowcoreClient) => Promise<Output>;
    }>;
    /**
     * Parse the response
     */
    protected parseResponse(response: unknown): Output;
}

/**
 * The input for the tenant users command
 */
interface TenantUserListInput {
    /** the tenant id */
    tenantId: string;
}
/**
 * The output for the tenant user list command
 */
interface TenantUserListOutput extends TenantUser {
    managedRoles: string[];
}
/**
 * List tenants users
 */
declare class TenantUserListCommand extends CustomCommand<TenantUserListInput, TenantUserListOutput[]> {
    /**
     * Custom execute method
     */
    protected customExecute(client: FlowcoreClient): Promise<TenantUserListOutput[]>;
}

/**
 * The input for the tenant translate name to id command
 */
interface TenantTranslateNameToIdInput {
    /** The name of the tenant */
    tenant: string;
}
/**
 * The schema for the tenant translate name to id command
 */
declare const TenantTranslateNameToIdSchema: TObject<{
    id: TString;
    name: TString;
}>;
type TenantTranslateNameToId = Static<typeof TenantTranslateNameToIdSchema>;
/**
 * Translate a tenant name to an tenant id
 */
declare class TenantTranslateNameToIdCommand extends Command<TenantTranslateNameToIdInput, TenantTranslateNameToId> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): TenantTranslateNameToId;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the tenant preview command
 */
interface TenantPreviewInput {
    /** The name of the tenant to preview */
    name: string;
}
/**
 * Retrieve a public tenant preview
 */
declare class TenantPreviewCommand extends Command<TenantPreviewInput, TenantPreview> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): TenantPreview;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The schema for an api key
 */
declare const ApiKeySchema: TObject<{
    id: TString;
    tenantId: TString;
    name: TString;
    description: TString;
    maskedApiKey: TString;
    createdAt: TString;
    lastUsedAt: TUnion<[TString, TNull]>;
}>;
/**
 * The type for an api key
 */
type ApiKey = Static<typeof ApiKeySchema>;
/**
 * The schema for an api key with value
 */
declare const ApiKeyWithValueSchema: TObject<{
    id: TString;
    tenantId: TString;
    name: TString;
    description: TString;
    maskedApiKey: TString;
    createdAt: TString;
    lastUsedAt: TUnion<[TString, TNull]>;
    apiKey: TString;
}>;
/**
 * The type for an api key with value
 */
type ApiKeyWithValue = Static<typeof ApiKeyWithValueSchema>;
/**
 * The schema for an api key validation response
 */
declare const ApiKeyValidationSchema: TObject<{
    valid: TBoolean;
    apiKeyId: TOptional<TString>;
    tenantId: TOptional<TString>;
}>;
/**
 * The type for an api key validation response
 */
type ApiKeyValidation = Static<typeof ApiKeyValidationSchema>;

/**
 * The input for the api key create command
 */
interface ApiKeyCreateInput {
    /** The tenant id */
    tenantId: string;
    /** The name of the api key */
    name: string;
    /** The description of the api key */
    description?: string;
}
/**
 * Create an api key
 */
declare class ApiKeyCreateCommand extends Command<ApiKeyCreateInput, ApiKeyWithValue> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command. Api-key mode requires tenant-store >=
     * the release that accepts AuthType.ApiKey on the api-key management routes;
     * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ApiKeyWithValue;
}

/**
 * The input for the api key fetch command
 */
interface ApiKeyFetchInput {
    /** The api key id */
    apiKeyId: string;
}
/**
 * Fetch an api key
 */
declare class ApiKeyFetchCommand extends Command<ApiKeyFetchInput, ApiKey> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command. Api-key mode requires tenant-store >=
     * the release that accepts AuthType.ApiKey on the api-key management routes;
     * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ApiKey;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the api key edit command
 */
interface ApiKeyEditInput {
    /** The api key id */
    apiKeyId: string;
    /** The description of the api key */
    description: string;
}
/**
 * Edit an api key
 */
declare class ApiKeyEditCommand extends Command<ApiKeyEditInput, ApiKey> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command. Api-key mode requires tenant-store >=
     * the release that accepts AuthType.ApiKey on the api-key management routes;
     * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ApiKey;
}

/**
 * The input for the api key delete command
 */
interface ApiKeyDeleteInput {
    /** The api key id */
    apiKeyId: string;
}
/**
 * Delete an api key
 */
declare class ApiKeyDeleteCommand extends Command<ApiKeyDeleteInput, boolean> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command. Api-key mode requires tenant-store >=
     * the release that accepts AuthType.ApiKey on the api-key management routes;
     * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(_rawResponse: unknown): boolean;
}

/**
 * The input for the api key list command
 */
interface ApiKeyListInput {
    /** The tenant id */
    tenantId: string;
}
/**
 * List api keys
 */
declare class ApiKeyListCommand extends Command<ApiKeyListInput, ApiKey[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command. Api-key mode requires tenant-store >=
     * the release that accepts AuthType.ApiKey on the api-key management routes;
     * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ApiKey[];
}

/**
 * The input for the api key validate command
 */
interface ApiKeyValidateInput {
    /** The api key to validate */
    apiKey: string;
}
/**
 * Validate an api key
 */
declare class ApiKeyValidateCommand extends Command<ApiKeyValidateInput, ApiKeyValidation> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ApiKeyValidation;
}

/**
 * The input for the api key validate with tenant id command
 */
interface ApiKeyValidateWithTenantIdInput {
    /** The api key to validate */
    apiKey: string;
    /** The tenant id */
    tenantId: string;
}
/**
 * Validate an api key with tenant id
 */
declare class ApiKeyValidateWithTenantIdCommand extends Command<ApiKeyValidateWithTenantIdInput, ApiKeyValidation> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ApiKeyValidation;
}

/**
 * The schema for AWS Marketplace dedicated cluster types.
 */
declare const AwsMarketplaceDedicatedClusterTypeSchema: TUnion<[TLiteral<"managed">, TLiteral<"self-hosted">]>;
/**
 * The type for AWS Marketplace dedicated cluster types.
 */
type AwsMarketplaceDedicatedClusterType = Static<typeof AwsMarketplaceDedicatedClusterTypeSchema>;
/**
 * The schema for AWS Marketplace product properties.
 */
declare const AwsMarketplaceProductPropertiesSchema: TRecord<TString, TOptional<TString>>;
/**
 * The type for AWS Marketplace product properties.
 */
type AwsMarketplaceProductProperties = Static<typeof AwsMarketplaceProductPropertiesSchema>;
/**
 * The schema for AWS Marketplace customer product modes.
 */
declare const AwsMarketplaceProductModeSchema: TUnion<[TLiteral<"basic">, TLiteral<"dedicated">]>;
/**
 * The type for AWS Marketplace customer product modes.
 */
type AwsMarketplaceProductMode = Static<typeof AwsMarketplaceProductModeSchema>;
/**
 * The schema for an AWS Marketplace customer.
 */
declare const AwsMarketplaceCustomerSchema: TObject<{
    customerId: TString;
    productCode: TString;
    accountId: TString;
    metadata: TString;
    productMode: typeof AwsMarketplaceProductModeSchema;
}>;
/**
 * The type for an AWS Marketplace customer.
 */
type AwsMarketplaceCustomer = Static<typeof AwsMarketplaceCustomerSchema>;
/**
 * The schema for an AWS Marketplace link.
 */
declare const AwsMarketplaceLinkSchema: TObject<{
    linkingId: TString;
    awsCustomerId: TString;
    awsProductCode: TString;
    awsAccountId: TString;
    tenant: TUnion<[TString, TNull]>;
    tenantId: TString;
    contactInfo: TUnion<[TString, TNull]>;
    productProperties: TUnion<[TRecord<TString, TString>, TNull]>;
    linkedAt: TString;
}>;
/**
 * The type for an AWS Marketplace link.
 */
type AwsMarketplaceLink = Static<typeof AwsMarketplaceLinkSchema>;
/**
 * The schema for the AWS Marketplace customer resolve response.
 */
declare const AwsMarketplaceCustomerResolveSchema: TObject<{
    success: TBoolean;
    customer: typeof AwsMarketplaceCustomerSchema;
}>;
/**
 * The type for the AWS Marketplace customer resolve response.
 */
type AwsMarketplaceCustomerResolve = Static<typeof AwsMarketplaceCustomerResolveSchema>;
/**
 * The schema for the AWS Marketplace link create response.
 */
declare const AwsMarketplaceLinkCreateSchema: TObject<{
    success: TBoolean;
    linkingId: TString;
    status: TLiteral<"linked">;
}>;
/**
 * The type for the AWS Marketplace link create response.
 */
type AwsMarketplaceLinkCreate = Static<typeof AwsMarketplaceLinkCreateSchema>;
/**
 * The schema for the AWS Marketplace link list response.
 */
declare const AwsMarketplaceLinkListSchema: TObject<{
    success: TBoolean;
    links: TArray<typeof AwsMarketplaceLinkSchema>;
}>;
/**
 * The type for the AWS Marketplace link list response.
 */
type AwsMarketplaceLinkList = Static<typeof AwsMarketplaceLinkListSchema>;
/**
 * The schema for the AWS Marketplace link fetch response.
 */
declare const AwsMarketplaceLinkFetchSchema: TObject<{
    success: TBoolean;
    link: typeof AwsMarketplaceLinkSchema;
}>;
/**
 * The type for the AWS Marketplace link fetch response.
 */
type AwsMarketplaceLinkFetch = Static<typeof AwsMarketplaceLinkFetchSchema>;
/**
 * The schema for the AWS Marketplace link delete response.
 */
declare const AwsMarketplaceLinkDeleteSchema: TObject<{
    success: TBoolean;
    linkingId: TString;
    status: TLiteral<"unlinked">;
}>;
/**
 * The type for the AWS Marketplace link delete response.
 */
type AwsMarketplaceLinkDelete = Static<typeof AwsMarketplaceLinkDeleteSchema>;

/**
 * The input for the AWS Marketplace customer resolve command.
 */
interface AwsMarketplaceCustomerResolveInput {
    /** The AWS Marketplace registration token */
    registrationToken: string;
}
/**
 * Resolve an AWS Marketplace registration token.
 */
declare class AwsMarketplaceCustomerResolveCommand extends Command<AwsMarketplaceCustomerResolveInput, AwsMarketplaceCustomerResolve> {
    /**
     * Whether the command should retry on failure.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method.
     */
    protected getMethod(): string;
    /**
     * Get the base url.
     */
    protected getBaseUrl(): string;
    /**
     * Get the path.
     */
    protected getPath(): string;
    /**
     * Parse the response.
     */
    protected parseResponse(rawResponse: unknown): AwsMarketplaceCustomerResolve;
}

/**
 * The input for the AWS Marketplace link create command.
 */
interface AwsMarketplaceLinkCreateInput {
    /** The AWS Marketplace registration token */
    registrationToken: string;
    /** The tenant slug */
    tenant: string;
    /** The tenant id */
    tenantId: string;
    /** Product-specific properties */
    productProperties?: AwsMarketplaceProductProperties & {
        /** The dedicated cluster type for dedicated products */
        dedicatedClusterType?: AwsMarketplaceDedicatedClusterType;
    };
    /** Optional license key */
    licenseKey?: string;
}
/**
 * Create an AWS Marketplace link for a tenant.
 */
declare class AwsMarketplaceLinkCreateCommand extends Command<AwsMarketplaceLinkCreateInput, AwsMarketplaceLinkCreate> {
    /**
     * Whether the command should retry on failure.
     */
    protected retryOnFailure: boolean;
    /**
     * The allowed modes for the command.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Get the method.
     */
    protected getMethod(): string;
    /**
     * Get the base url.
     */
    protected getBaseUrl(): string;
    /**
     * Get the path.
     */
    protected getPath(): string;
    /**
     * Parse the response.
     */
    protected parseResponse(rawResponse: unknown): AwsMarketplaceLinkCreate;
}

/**
 * The input for the AWS Marketplace link delete command.
 */
interface AwsMarketplaceLinkDeleteInput {
    /** The AWS Marketplace linking id */
    linkingId: string;
    /** Optional unlink reason */
    reason?: string;
}
/**
 * Delete an AWS Marketplace link.
 */
declare class AwsMarketplaceLinkDeleteCommand extends Command<AwsMarketplaceLinkDeleteInput, AwsMarketplaceLinkDelete> {
    /**
     * Whether the command should retry on failure.
     */
    protected retryOnFailure: boolean;
    /**
     * The allowed modes for the command.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Get the method.
     */
    protected getMethod(): string;
    /**
     * Get the base url.
     */
    protected getBaseUrl(): string;
    /**
     * Get the path.
     */
    protected getPath(): string;
    /**
     * Get the body.
     */
    protected getBody(): undefined;
    /**
     * Parse the response.
     */
    protected parseResponse(rawResponse: unknown): AwsMarketplaceLinkDelete;
}

/**
 * The input for the AWS Marketplace link fetch command.
 */
interface AwsMarketplaceLinkFetchInput {
    /** The AWS Marketplace linking id */
    linkingId: string;
}
/**
 * Fetch an AWS Marketplace link.
 */
declare class AwsMarketplaceLinkFetchCommand extends Command<AwsMarketplaceLinkFetchInput, AwsMarketplaceLinkFetch> {
    /**
     * Whether the command should retry on failure.
     */
    protected retryOnFailure: boolean;
    /**
     * The allowed modes for the command.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Get the method.
     */
    protected getMethod(): string;
    /**
     * Get the base url.
     */
    protected getBaseUrl(): string;
    /**
     * Get the path.
     */
    protected getPath(): string;
    /**
     * Parse the response.
     */
    protected parseResponse(rawResponse: unknown): AwsMarketplaceLinkFetch;
}

/**
 * The input for the AWS Marketplace link list command.
 */
interface AwsMarketplaceLinkListInput {
    /** The tenant slug */
    tenant?: string;
    /** The tenant id */
    tenantId?: string;
    /** The AWS Marketplace customer id */
    awsCustomerId?: string;
    /** The AWS Marketplace product code */
    awsProductCode?: string;
}
/**
 * List AWS Marketplace links.
 */
declare class AwsMarketplaceLinkListCommand extends Command<AwsMarketplaceLinkListInput, AwsMarketplaceLinkList> {
    /**
     * Whether the command should retry on failure.
     */
    protected retryOnFailure: boolean;
    /**
     * The allowed modes for the command.
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Get the method.
     */
    protected getMethod(): string;
    /**
     * Get the base url.
     */
    protected getBaseUrl(): string;
    /**
     * Get the path.
     */
    protected getPath(): string;
    /**
     * Parse the response.
     */
    protected parseResponse(rawResponse: unknown): AwsMarketplaceLinkList;
}

/**
 * The schema for a secret
 */
declare const SecretSchema: TObject<{
    tenantId: TString;
    key: TString;
    description: TString;
    createdAt: TString;
    updatedAt: TUnion<[TString, TNull]>;
}>;
/**
 * The type for a secret
 */
type Secret = Static<typeof SecretSchema>;

/**
 * The input for the secret create command
 */
interface SecretCreateInput {
    /** The tenant id */
    tenantId: string;
    /** The key of the secret */
    key: string;
    /** The value of the secret */
    value: string;
    /** The description of the secret */
    description?: string;
}
/**
 * Create a secret
 */
declare class SecretCreateCommand extends Command<SecretCreateInput, Secret> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Secret;
}

/**
 * The input for the secret delete command
 */
interface SecretDeleteInput {
    /** The tenant id */
    tenantId: string;
    /** The key of the secret */
    key: string;
}
/**
 * Delete a secret
 */
declare class SecretDeleteCommand extends Command<SecretDeleteInput, boolean> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(_rawResponse: unknown): boolean;
}

/**
 * The input for the secret edit command
 */
interface SecretEditInput {
    /** The tenant id */
    tenantId: string;
    /** The key of the secret */
    key: string;
    /** The value of the secret */
    value?: string;
    /** The description of the secret */
    description?: string;
}
/**
 * Edit a secret
 */
declare class SecretEditCommand extends Command<SecretEditInput, Secret> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Secret;
}

/**
 * The input for the secret fetch command
 */
interface SecretFetchInput {
    /** The tenant id */
    tenantId: string;
    /** The secret key */
    key: string;
}
/**
 * Fetch a secret
 */
declare class SecretFetchCommand extends Command<SecretFetchInput, Secret> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Secret;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the secret list command
 */
interface SecretListInput {
    /** The tenant id */
    tenantId: string;
}
/**
 * List secrets
 */
declare class SecretListCommand extends Command<SecretListInput, Secret[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Secret[];
}

/**
 * The schema for a service account
 */
declare const ServiceAccountSchema: TObject<{
    id: TString;
    tenantId: TString;
    name: TString;
    description: TString;
    linkedUserId: TString;
    clientId: TString;
    isAdmin: TBoolean;
    enabled: TBoolean;
    createdAt: TString;
    updatedAt: TUnion<[TString, TNull]>;
    lastRotatedAt: TUnion<[TString, TNull]>;
}>;
/**
 * The type for a service account
 */
type ServiceAccount = Static<typeof ServiceAccountSchema>;
/**
 * The schema for a service account response with client secret
 */
declare const ServiceAccountWithSecretSchema: TObject<{
    id: TString;
    tenantId: TString;
    name: TString;
    description: TString;
    linkedUserId: TString;
    clientId: TString;
    isAdmin: TBoolean;
    enabled: TBoolean;
    createdAt: TString;
    updatedAt: TUnion<[TString, TNull]>;
    lastRotatedAt: TUnion<[TString, TNull]>;
    clientSecret: TString;
}>;
/**
 * The type for a service account response with client secret
 */
type ServiceAccountWithSecret = Static<typeof ServiceAccountWithSecretSchema>;
/**
 * The schema for a rotated service account secret response
 */
declare const ServiceAccountSecretRotationSchema: TObject<{
    id: TString;
    clientId: TString;
    clientSecret: TString;
}>;
/**
 * The type for a rotated service account secret response
 */
type ServiceAccountSecretRotation = Static<typeof ServiceAccountSecretRotationSchema>;

/**
 * The input for the service account create command
 */
interface ServiceAccountCreateInput {
    /** The tenant id */
    tenantId: string;
    /** The name of the service account */
    name: string;
    /** The description of the service account */
    description?: string;
    /** Whether the service account should be admin */
    isAdmin?: boolean;
}
/**
 * Create a service account
 */
declare class ServiceAccountCreateCommand extends Command<ServiceAccountCreateInput, ServiceAccountWithSecret> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ServiceAccountWithSecret;
}

/**
 * The input for the service account delete command
 */
interface ServiceAccountDeleteInput {
    /** The service account id */
    serviceAccountId: string;
}
/**
 * Delete a service account
 */
declare class ServiceAccountDeleteCommand extends Command<ServiceAccountDeleteInput, boolean> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): undefined;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(): boolean;
}

/**
 * The input for the service account edit command
 */
interface ServiceAccountEditInput {
    /** The service account id */
    serviceAccountId: string;
    /** The description of the service account */
    description?: string;
    /** Whether the service account is enabled */
    enabled?: boolean;
}
/**
 * Edit a service account
 */
declare class ServiceAccountEditCommand extends Command<ServiceAccountEditInput, ServiceAccount> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ServiceAccount;
}

/**
 * The input for the service account fetch command
 */
interface ServiceAccountFetchInput {
    /** The service account id */
    serviceAccountId: string;
}
/**
 * Fetch a service account
 */
declare class ServiceAccountFetchCommand extends Command<ServiceAccountFetchInput, ServiceAccount> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ServiceAccount;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the service account list command
 */
interface ServiceAccountListInput {
    /** The tenant id */
    tenantId: string;
}
/**
 * List service accounts
 */
declare class ServiceAccountListCommand extends Command<ServiceAccountListInput, ServiceAccount[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ServiceAccount[];
}

/**
 * The input for the service account rotate secret command
 */
interface ServiceAccountRotateSecretInput {
    /** The service account id */
    serviceAccountId: string;
}
/**
 * Rotate a service account secret
 */
declare class ServiceAccountRotateSecretCommand extends Command<ServiceAccountRotateSecretInput, ServiceAccountSecretRotation> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): undefined;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ServiceAccountSecretRotation;
}

/**
 * The schema for a variable
 */
declare const VariableSchema: TObject<{
    tenantId: TString;
    key: TString;
    description: TString;
    value: TString;
    createdAt: TString;
    updatedAt: TUnion<[TString, TNull]>;
}>;
/**
 * The type for a variable
 */
type Variable = Static<typeof VariableSchema>;

/**
 * The input for the variable create command
 */
interface VariableCreateInput {
    /** The tenant id */
    tenantId: string;
    /** The key of the variable */
    key: string;
    /** The value of the variable */
    value: string;
    /** The description of the variable */
    description?: string;
}
/**
 * Create a variable
 */
declare class VariableCreateCommand extends Command<VariableCreateInput, Variable> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Variable;
}

/**
 * The input for the variable delete command
 */
interface VariableDeleteInput {
    /** The tenant id */
    tenantId: string;
    /** The key of the variable */
    key: string;
}
/**
 * Delete a variable
 */
declare class VariableDeleteCommand extends Command<VariableDeleteInput, boolean> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(): boolean;
}

/**
 * The input for the variable edit command
 */
interface VariableEditInput {
    /** The tenant id */
    tenantId: string;
    /** The key of the variable */
    key: string;
    /** The value of the variable */
    value?: string;
    /** The description of the variable */
    description?: string;
}
/**
 * Edit a variable
 */
declare class VariableEditCommand extends Command<VariableEditInput, Variable> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Variable;
}

/**
 * The input for the variable fetch command
 */
interface VariableFetchInput {
    /** The tenant id */
    tenantId: string;
    /** The variable key */
    key: string;
}
/**
 * Fetch a variable
 */
declare class VariableFetchCommand extends Command<VariableFetchInput, Variable> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Variable;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the variable list command
 */
interface VariableListInput {
    /** The tenant id */
    tenantId: string;
}
/**
 * List variables
 */
declare class VariableListCommand extends Command<VariableListInput, Variable[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Variable[];
}

/**
 * The schema for a data core
 */
declare const DataCoreSchema: TObject<{
    id: TString;
    tenantId: TString;
    tenant: TString;
    name: TString;
    description: TString;
    accessControl: TUnion<[TLiteral<"public">, TLiteral<"private">]>;
    deleteProtection: TBoolean;
    isDeleting: TBoolean;
    isFlowcoreManaged: TBoolean;
}>;
/**
 * The schema for a data core with access
 */
declare const DataCoreWithAccessSchema: TObject<{
    id: TString;
    tenantId: TString;
    tenant: TString;
    name: TString;
    description: TString;
    accessControl: TUnion<[TLiteral<"public">, TLiteral<"private">]>;
    deleteProtection: TBoolean;
    isDeleting: TBoolean;
    isFlowcoreManaged: TBoolean;
    access: TArray<TUnion<[TLiteral<"read">, TLiteral<"write">, TLiteral<"fetch">, TLiteral<"ingest">]>>;
}>;
/**
 * The type for a data core
 */
type DataCore = Static<typeof DataCoreSchema>;
/**
 * The type for a data core with access
 */
type DataCoreWithAccess = Static<typeof DataCoreWithAccessSchema>;

/**
 * The input for the data core create command
 */
interface DataCoreCreateInput {
    /** The tenant id */
    tenantId: string;
    /** The name of the data core */
    name: string;
    /** The description of the data core */
    description: string;
    /** The access control of the data core */
    accessControl: "public" | "private";
    /** Whether the data core is delete protected */
    deleteProtection: boolean;
    /** Whether the data core is managed by Flowcore */
    isFlowcoreManaged?: boolean;
}
/**
 * Create a data core
 */
declare class DataCoreCreateCommand extends Command<DataCoreCreateInput, DataCore> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): DataCore;
}

/**
 * The input for the data core fetch by id command
 */
interface DataCoreExistsInput {
    /** The id of the data core */
    dataCoreId: string;
}
/**
 * The output for the data core exists command
 */
interface DataCoreExistsOutput {
    /** Whether the data core exists */
    exists: boolean;
}
/**
 * Fetch a data core
 */
declare class DataCoreExistsCommand extends Command<DataCoreExistsInput, DataCoreExistsOutput> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): DataCoreExistsOutput;
}

/**
 * The input for the data core fetch by id command
 */
interface DataCoreFetchByIdInput {
    /** The id of the data core */
    dataCoreId: string;
    /** The tenant id */
    tenantId?: never;
    /** The tenant */
    tenant?: never;
    /** The name of the data core */
    dataCore?: never;
}
/**
 * The input for the data core fetch by name and tenant id command
 */
interface DataCoreFetchByNameAndTenantIdInput {
    /** The tenant id */
    tenantId: string;
    /** The tenant */
    tenant?: never;
    /** The name of the data core */
    dataCore: string;
    /** The id of the data core */
    dataCoreId?: never;
}
/**
 * The input for the data core fetch by name and tenant command
 */
interface DataCoreFetchByNameAndTenantInput {
    /** The tenant id */
    tenantId?: never;
    /** The tenant */
    tenant: string;
    /** The name of the data core */
    dataCore: string;
    /** The id of the data core */
    dataCoreId?: never;
}
/**
 * The input for the data core fetch command
 */
type DataCoreFetchInput = DataCoreFetchByIdInput | DataCoreFetchByNameAndTenantIdInput | DataCoreFetchByNameAndTenantInput;
/**
 * Fetch a data core
 */
declare class DataCoreFetchCommand extends Command<DataCoreFetchInput, DataCore> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): DataCore;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the data core list command
 */
interface DataCoreListInput {
    /** The tenant id */
    tenantId?: string;
    /** The tenant name */
    tenant?: string;
    /** The data core name */
    name?: string;
    /** Page number (1-based). Used with limit. Defaults to 1 when limit is provided. */
    page?: number;
    /** Maximum number of data cores to return (max 100). Omit to return all data cores. */
    limit?: number;
    /** Data core ids to pin to the front of the list (comma-separated string or array) */
    ids?: string | string[];
}
/**
 * Fetch all data cores for a tenant
 */
declare class DataCoreListCommand extends Command<DataCoreListInput, DataCoreWithAccess[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): DataCoreWithAccess[];
}

/**
 * The input for the data core request delete command
 */
interface DataCoreRequestDeleteInput {
    /** The tenant */
    tenant: string;
    /** The id of the data core */
    dataCoreId: string;
    /** Wait for the data core to be deleted (default: false) */
    waitForDelete?: boolean;
}
/**
 * The output for the data core request delete command
 */
interface DataCoreRequestDeleteOutput {
    /** The success of the data core delete request */
    success: boolean;
}
/**
 * Request to delete a data core
 */
declare class DataCoreRequestDeleteCommand extends Command<DataCoreRequestDeleteInput, DataCoreRequestDeleteOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): DataCoreRequestDeleteOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Wait for the response (timeout: 25 seconds)
     */
    protected processResponse(client: FlowcoreClient, response: DataCoreRequestDeleteOutput): Promise<DataCoreRequestDeleteOutput>;
}

/**
 * The input for the data core update command
 */
interface DataCoreUpdateInput {
    /** The id of the data core */
    dataCoreId: string;
    /** The description of the data core */
    description?: string;
    /** The access control of the data core */
    accessControl?: "public" | "private";
    /** Whether the data core is delete protected */
    deleteProtection?: boolean;
}
/**
 * Update a data core
 */
declare class DataCoreUpdateCommand extends Command<DataCoreUpdateInput, DataCore> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): DataCore;
}

/**
 * The schema for a flow type
 */
declare const FlowTypeSchema: TObject<{
    id: TString;
    tenantId: TString;
    dataCoreId: TString;
    name: TString;
    description: TString;
    isDeleting: TBoolean;
}>;
/**
 * The type for a flow type
 */
type FlowType = Static<typeof FlowTypeSchema>;

/**
 * The input for the data core create command
 */
interface FlowTypeCreateInput {
    /** The id of the data core */
    dataCoreId: string;
    /** The name of the flow type */
    name: string;
    /** The description of the flow type */
    description: string;
}
/**
 * Create a flow type
 */
declare class FlowTypeCreateCommand extends Command<FlowTypeCreateInput, FlowType> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): FlowType;
}

/**
 * The input for the flow type fetch by name command
 */
interface FlowTypeExistsInput {
    /** The id of the flow type */
    flowTypeId: string;
    /** Wait for the flow type to be deleted */
    waitForDelete?: boolean;
}
/**
 * The output for the flow type exists command
 */
interface FlowTypeExistsOutput {
    /** Whether the flow type exists */
    exists: boolean;
}
/**
 * Fetch a flow type
 */
declare class FlowTypeExistsCommand extends Command<FlowTypeExistsInput, FlowTypeExistsOutput> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): FlowTypeExistsOutput;
}

/**
 * The input for the flow type fetch by name command
 */
interface FlowTypeFetchByNameInput {
    /** The id of the data core */
    dataCoreId: string;
    /** The name of the flow type */
    flowType: string;
    /** The id of the flow type */
    flowTypeId?: never;
}
/**
 * The input for the flow type fetch by id command
 */
interface FlowTypeFetchByIdInput {
    /** The id of the flow type */
    flowTypeId: string;
    /** The id of the data core */
    dataCoreId?: never;
    /** The name of the flow type */
    flowType?: never;
}
/**
 * The input for the flow type fetch command
 */
type FlowTypeFetchInput = FlowTypeFetchByIdInput | FlowTypeFetchByNameInput;
/**
 * Fetch a flow type
 */
declare class FlowTypeFetchCommand extends Command<FlowTypeFetchInput, FlowType> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): FlowType;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the flow type list command
 */
interface FlowTypeListInput {
    /** the data core id */
    dataCoreId: string;
}
/**
 * Fetch all flow types for a data core
 */
declare class FlowTypeListCommand extends Command<FlowTypeListInput, FlowType[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): FlowType[];
}

/**
 * The input for the flow type request delete command
 */
interface FlowTypeRequestDeleteInput {
    /** The tenant */
    tenant: string;
    /** The id of the flow type */
    flowTypeId: string;
    /** Wait for the flow type to be deleted (default: false) */
    waitForDelete?: boolean;
}
/**
 * The output for the flow type request delete command
 */
interface FlowTypeRequestDeleteOutput {
    success: boolean;
}
/**
 * Request to delete a flow type
 */
declare class FlowTypeRequestDeleteCommand extends Command<FlowTypeRequestDeleteInput, FlowTypeRequestDeleteOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): FlowTypeRequestDeleteOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Wait for the response (timeout: 25 seconds)
     */
    protected processResponse(client: FlowcoreClient, response: FlowTypeRequestDeleteOutput): Promise<FlowTypeRequestDeleteOutput>;
}

/**
 * The input for the flow type update command
 */
interface FlowTypeUpdateInput {
    /** The id of the data core */
    flowTypeId: string;
    /** The description of the flow type */
    description?: string;
}
/**
 * Update a flow type
 */
declare class FlowTypeUpdateCommand extends Command<FlowTypeUpdateInput, FlowType> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): FlowType;
}

type SimpleSensitiveDataType = boolean | "string" | "number" | "boolean";
type DetailedSensitiveDataField = {
    type: "string" | "number" | "boolean" | "object" | "array";
    faker?: string;
    args?: unknown[];
    length?: number;
    pattern?: string;
    redact?: {
        char: string;
        length: number;
    };
    min?: number;
    max?: number;
    precision?: number;
    count?: number;
    items?: SimpleSensitiveDataType | DetailedSensitiveDataField | Record<string, unknown>;
    properties?: Record<string, SimpleSensitiveDataType | DetailedSensitiveDataField | Record<string, unknown>>;
};
type SensitiveDataDefinition = SimpleSensitiveDataType | DetailedSensitiveDataField | Record<string, SimpleSensitiveDataType | DetailedSensitiveDataField | Record<string, unknown>>;
/**
 * The schema for a detailed SensitiveData field
 */
declare const DetailedSensitiveDataFieldSchema: TObject<{
    type: TUnion<[TLiteral<"string">, TLiteral<"number">, TLiteral<"boolean">, TLiteral<"object">, TLiteral<"array">]>;
    faker: TOptional<TString>;
    args: TOptional<TArray<TUnknown>>;
    length: TOptional<TNumber>;
    pattern: TOptional<TString>;
    redact: TOptional<TObject<{
        char: TString;
        length: TNumber;
    }>>;
    min: TOptional<TNumber>;
    max: TOptional<TNumber>;
    precision: TOptional<TNumber>;
    count: TOptional<TNumber>;
    items: TOptional<TUnknown>;
    properties: TOptional<TRecord<TString, TUnknown>>;
}>;
/**
 * The schema for a SensitiveData definition
 */
declare const SensitiveDataDefinitionSchema: TUnion<[
    TLiteral<true>,
    TUnion<[TLiteral<"string">, TLiteral<"number">, TLiteral<"boolean">]>,
    typeof DetailedSensitiveDataFieldSchema,
    TRecord<TString, TUnknown>
]>;
/**
 * The schema for an event type SensitiveData mask
 */
declare const EventTypeSensitiveDataMaskSchema: TObject<{
    key: TString;
    schema: TRecord<TString, typeof SensitiveDataDefinitionSchema>;
}>;
/**
 * The schema for an event type SensitiveData mask parsed
 */
declare const EventTypeSensitiveDataMaskParsedSchema: TArray<TObject<{
    path: TString;
    definition: TObject<{
        type: TUnion<[TLiteral<"string">, TLiteral<"number">, TLiteral<"boolean">, TLiteral<"object">, TLiteral<"array">]>;
        faker: TOptional<TString>;
        args: TArray<TUnknown>;
        length: TOptional<TNumber>;
        pattern: TOptional<TString>;
        min: TOptional<TNumber>;
        max: TOptional<TNumber>;
        precision: TOptional<TNumber>;
        count: TOptional<TNumber>;
        items: TOptional<TUnknown>;
        properties: TOptional<TRecord<TString, TUnknown>>;
        redact: TOptional<TObject<{
            char: TString;
            length: TNumber;
        }>>;
    }>;
}>>;
/**
 * The schema for an event type
 */
declare const EventTypeSchema: TObject<{
    id: TString;
    tenantId: TString;
    dataCoreId: TString;
    flowTypeId: TString;
    name: TString;
    description: TString;
    isTruncating: TBoolean;
    isDeleting: TBoolean;
    createdAt: TString;
    updatedAt: TUnion<[TString, TNull]>;
    sensitiveDataMask: TOptional<TUnion<[typeof EventTypeSensitiveDataMaskSchema, TNull]>>;
    sensitiveDataEnabled: TOptional<TBoolean>;
}>;
/**
 * The schema for an event type remove sensitive data
 */
declare const EventTypeRemoveSensitiveDataSchema: TObject<{
    success: TBoolean;
    id: TString;
}>;
/**
 * The schema for an event type list removed sensitive data item
 */
declare const EventTypeListRemovedSensitiveDataItemSchema: TObject<{
    id: TString;
    tenantId: TString;
    dataCoreId: TString;
    flowTypeId: TString;
    eventTypeId: TString;
    application: TString;
    parentKey: TString;
    key: TString;
    type: TString;
    createdAt: TString;
}>;
/**
 * The schema for an event type list removed sensitive data response
 */
declare const EventTypeListRemovedSensitiveDataResponseSchema: TObject<{
    data: TArray<typeof EventTypeListRemovedSensitiveDataItemSchema>;
    pagination: TObject<{
        page: TNumber;
        pageSize: TNumber;
        hasNextPage: TBoolean;
        hasPreviousPage: TBoolean;
    }>;
}>;
/**
 * The type for an event type
 */
type EventType = Static<typeof EventTypeSchema>;
/**
 * Type for SensitiveData mask
 */
type EventTypeSensitiveDataMask = Static<typeof EventTypeSensitiveDataMaskSchema>;
/**
 * Type for parsed SensitiveData mask
 */
type EventTypeSensitiveDataMaskParsed = Static<typeof EventTypeSensitiveDataMaskParsedSchema>;
/**
 * Type for an event type list removed sensitive data response
 */
type EventTypeListRemovedSensitiveDataResponse = Static<typeof EventTypeListRemovedSensitiveDataResponseSchema>;
/**
 * Type for an event type remove sensitive data
 */
type EventTypeRemoveSensitiveData = Static<typeof EventTypeRemoveSensitiveDataSchema>;

/**
 * The input for the event type create command
 */
interface EventTypeCreateInput {
    /** The id of the flow type */
    flowTypeId: string;
    /** The name of the event type */
    name: string;
    /** The description of the event type */
    description: string;
    /** The sensitive data mask of the event type */
    sensitiveDataMask?: {
        /** The json path to the key where the entity id for the sensitive data mask is located */
        key: string;
        /** Schema defining the fields that should be masked and how they should be masked */
        schema: Record<string, SensitiveDataDefinition>;
    };
    /** Whether sensitive data masking is enabled for this event type */
    sensitiveDataEnabled?: boolean;
}
/**
 * Create an event type
 */
declare class EventTypeCreateCommand extends Command<EventTypeCreateInput, EventType> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventType;
}

/**
 * The input for the event type exists command
 */
interface EventTypeExistsInput {
    /** The id of the event type */
    eventTypeId: string;
}
/**
 * The output for the event type exists command
 */
interface EventTypeExistsOutput {
    /** Whether the event type exists */
    exists: boolean;
}
/**
 * Check if an event type exists
 */
declare class EventTypeExistsCommand extends Command<EventTypeExistsInput, EventTypeExistsOutput> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventTypeExistsOutput;
}

interface EventTypeFetchByIdInput {
    /** The id of the event type */
    eventTypeId: string;
    /** The id of the flow type */
    flowTypeId?: never;
    /** The name of the event type */
    eventType?: never;
}
interface EventTypeFetchByNameInput {
    /** The id of the flow type */
    flowTypeId: string;
    /** The name of the event type */
    eventType: string;
    /** The id of the event type */
    eventTypeId?: never;
}
/**
 * The input for the event type fetch command
 */
type EventTypeFetchInput = EventTypeFetchByIdInput | EventTypeFetchByNameInput;
/**
 * Fetch an event type
 */
declare class EventTypeFetchCommand extends Command<EventTypeFetchInput, EventType> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventType;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The schema for an event
 */
declare const FlowcoreEventSchema: TObject<{
    eventId: TString;
    timeBucket: TString;
    tenant: TString;
    dataCoreId: TString;
    flowType: TString;
    eventType: TString;
    metadata: TRecord<TString, TUnknown>;
    payload: TRecord<TString, TUnknown>;
    validTime: TString;
}>;
/**
 * The type for an event
 */
type FlowcoreEvent = Static<typeof FlowcoreEventSchema>;
/**
 * The input for the ingest event command
 */
interface IngestEventInput<T> {
    /** the tenant name */
    tenantName: string;
    /** the data core id */
    dataCoreId: string;
    /** the flow type name */
    flowTypeName: string;
    /** the event type name */
    eventTypeName: string;
    /** the event data */
    eventData: T;
    /** the event id */
    metadata?: Record<string, string>;
    /** ttl (This accepts d, h, m, s. The maximum value is 7 days, this can be increased for higher subscription levels.) */
    ttl?: string;
    /** indicate if this event is emphemral (default false) */
    isEphemeral?: boolean;
    /** valid time of the event */
    validTime?: string;
    /** event time of the event, overrides what time bucket this event is stored in */
    eventTime?: string;
    /** flowcore managed event */
    flowcoreManaged?: boolean;
}

/**
 * The input for the events fetch info command
 */
interface EventTypeInfoInput {
    /** the tenant */
    tenant: string;
    /** the event type id or ids */
    eventTypeId: [string, ...string[]] | string;
    /** the limit for the number of last events to fetch (default is 5) */
    limit?: number;
    /** include sensitive data */
    includeSensitiveData?: boolean;
}
/**
 * The output for the events fetch info command
 */
interface EventTypeInfoOutput {
    /** the first time bucket */
    firstTimeBucket?: string;
    /** the last time bucket */
    lastTimeBucket?: string;
    /** the last events */
    lastEvents: FlowcoreEvent[];
}
/**
 * Fetch information about an event type
 *
 * contains the first and last time bucket and the last {limit} events
 */
declare class EventTypeInfoCommand extends CustomCommand<EventTypeInfoInput, EventTypeInfoOutput> {
    /**
     * Custom execute method
     */
    protected customExecute(client: FlowcoreClient): Promise<EventTypeInfoOutput>;
}

/**
 * The input for the event type list removed sensitive data command
 */
interface EventTypeListRemovedSensitiveDataInput {
    /** The id of the tenant */
    tenantId: string;
    /** The id of the data core */
    dataCoreId?: string;
    /** The id of the flow type */
    flowTypeId?: string;
    /** The id of the event type */
    eventTypeId?: string;
    /** The identifier of the application that is trying to remove sensitive data (iLike operation) */
    application?: string;
    /** The parent key of the event type (iLike operation) */
    parentKey?: string;
    /** The page to fetch (minimum: 1, default: 1) */
    page?: number;
    /** The page size (minimum: 1, maximum: 5000, default: 20) */
    pageSize?: number;
    /** The type of removal */
    type?: string;
    /** The sort order */
    sort?: string;
    /** Filter by creation date from (format: date-time) */
    createdAtFrom?: string;
    /** Filter by creation date to (format: date-time) */
    createdAtTo?: string;
}
/**
 * Fetch an event type
 */
declare class EventTypeListRemovedSensitiveDataCommand extends Command<EventTypeListRemovedSensitiveDataInput, EventTypeListRemovedSensitiveDataResponse> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventTypeListRemovedSensitiveDataResponse;
}

/**
 * The input for the event type list command
 */
interface EventTypeListInput {
    /** The flow type id */
    flowTypeId: string;
}
/**
 * Fetch all event types for a flow type
 */
declare class EventTypeListCommand extends Command<EventTypeListInput, EventType[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventType[];
}

/**
 * The input for the event type list removed sensitive data command
 */
interface EventTypeRemoveSensitiveDataInput {
    /** The id of the event type */
    eventTypeId: string;
    /** The identifier of the application that is trying to remove sensitive data */
    application: string;
    /** The parent key of sensitive data point */
    parentKey: string;
    /** The key of sensitive data point */
    key: string;
    /** The removal type of sensitive data point */
    type: "remove" | "scramble";
}
/**
 * Fetch an event type
 */
declare class EventTypeRemoveSensitiveDataCommand extends Command<EventTypeRemoveSensitiveDataInput, EventTypeRemoveSensitiveData> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventTypeRemoveSensitiveData;
}

/**
 * The input for the event type request delete command
 */
interface EventTypeRequestDeleteInput {
    /** The tenant */
    tenant: string;
    /** The id of the event type */
    eventTypeId: string;
    /** Wait for the event type to be deleted (default: false) */
    waitForDelete?: boolean;
}
/**
 * The output for the event type request delete command
 */
interface EventTypeRequestDeleteOutput {
    success: boolean;
}
/**
 * Request to delete an event type
 */
declare class EventTypeRequestDeleteCommand extends Command<EventTypeRequestDeleteInput, EventTypeRequestDeleteOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventTypeRequestDeleteOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Wait for the response (timeout: 25 seconds)
     */
    protected processResponse(client: FlowcoreClient, response: EventTypeRequestDeleteOutput): Promise<EventTypeRequestDeleteOutput>;
}

/**
 * The input for the event type request truncate command
 */
interface EventTypeRequestTruncateInput {
    /** The tenant */
    tenant: string;
    /** The id of the event type */
    eventTypeId: string;
    /** Wait for the event type to be truncated (default: false) */
    waitForTruncate?: boolean;
}
/**
 * The output for the event type request truncate command
 */
interface EventTypeRequestTruncateOutput {
    success: boolean;
}
/**
 * Request to truncate an event type
 */
declare class EventTypeRequestTruncateCommand extends Command<EventTypeRequestTruncateInput, EventTypeRequestTruncateOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventTypeRequestTruncateOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Wait for the response (timeout: 25 seconds)
     */
    protected processResponse(client: FlowcoreClient, response: EventTypeRequestTruncateOutput): Promise<EventTypeRequestTruncateOutput>;
}

/**
 * The input for the event type update command
 */
type EventTypeUpdateInput = {
    /** The id of the event type */
    eventTypeId: string;
    /** The description of the event type */
    description?: string;
    /** The sensitive data mask of the event type */
    sensitiveDataMask?: {
        /** The json path to the key where the entity id for the sensitive data mask is located */
        key: string;
        /** Schema defining the fields that should be masked and how they should be masked */
        schema: Record<string, SensitiveDataDefinition>;
    };
    /** Whether sensitive data masking is enabled for this event type */
    sensitiveDataEnabled?: boolean;
};
/**
 * Update an event type
 */
declare class EventTypeUpdateCommand extends Command<EventTypeUpdateInput, EventType> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventType;
}

interface IngestBatchInput<T> extends Omit<IngestEventInput<T>, "eventData"> {
    events: IngestEventInput<T>["eventData"][];
}
/**
 * The output for the batch ingestion command
 */
interface IngestBatchOutput {
    /** the events */
    eventIds: string[];
    /** success status */
    success: boolean;
}
/**
 * Ingest a batch of events
 */
declare class IngestBatchCommand<T> extends Command<IngestBatchInput<T>, IngestBatchOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    /**
     * Get the base url for the request
     */
    protected getBaseUrl(): string;
    protected getHeaders(): Record<string, string>;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): IngestBatchOutput;
    /**
     * Get the body for the request
     */
    protected getBody(): unknown[];
}

/**
 * The output for the ingest event command
 */
interface IngestEventOutput {
    /** the events */
    eventId: string;
    /** success status */
    success: boolean;
}
/**
 * Ingest an event
 */
declare class IngestEventCommand<T> extends Command<IngestEventInput<T>, IngestEventOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    /**
     * Get the base url for the request
     */
    protected getBaseUrl(): string;
    protected getHeaders(): Record<string, string>;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): IngestEventOutput;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
}

/**
 * The input for the events fetch indexes command
 */
interface EventListInput {
    /** The tenant */
    tenant: string;
    /** the event type id or ids */
    eventTypeId: [string, ...string[]] | string;
    /** the time bucket */
    timeBucket: string;
    /** the paging cursor */
    cursor?: string;
    /** the page size (default is 10.000) */
    pageSize?: number;
    /** start from this event id */
    fromEventId?: string;
    /**
     * after this event id
     *
     * ⚠️ Not applicable if `fromEventId` is also defined
     */
    afterEventId?: string;
    /** end at this event id */
    toEventId?: string;
    /**
     * the order (default is asc)
     *
     * ⚠️ When using `desc` order, pagination and filters are not possible.
     */
    order?: "asc" | "desc";
    /** include sensitive data */
    includeSensitiveData?: boolean;
}
/**
 * The output for the events fetch indexes command
 */
interface EventListOutput {
    /** the events */
    events: FlowcoreEvent[];
    /** the next page cursor */
    nextCursor?: string;
}
/**
 * Fetch time buckets for an event type
 */
declare class EventListCommand extends Command<EventListInput, EventListOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the method for the request
     */
    protected getMethod(): string;
    /**
     * Get the base url for the request
     */
    protected getBaseUrl(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventListOutput;
}

/**
 * The input for the events fetch indexes command
 */
interface EventsFetchTimeBucketsByNamesInput {
    /** the tenant name */
    tenant: string;
    /** the data core id */
    dataCoreId: string;
    /** the flow type name */
    flowType: string;
    /** the event type names */
    eventTypes: string[];
    /** the paging cursor */
    cursor?: number;
    /** the page size (default is 10.000) */
    pageSize?: number;
    /** start from this time bucket */
    fromTimeBucket?: string;
    /** end at this time bucket */
    toTimeBucket?: string;
}
/**
 * The output for the events fetch indexes command
 */
interface EventsFetchTimeBucketsByNamesOutput {
    /** the time buckets */
    timeBuckets: string[];
    /** the next page cursor */
    nextCursor?: number;
}
/**
 * Fetch time buckets for an event type
 */
declare class EventsFetchTimeBucketsByNamesCommand extends Command<EventsFetchTimeBucketsByNamesInput, EventsFetchTimeBucketsByNamesOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the base url for the request
     */
    protected getBaseUrl(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventsFetchTimeBucketsByNamesOutput;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
}

/**
 * The input for the events fetch indexes command
 */
interface EventsFetchEventsInput {
    /** the tenant */
    tenant: string;
    /** the data core id */
    dataCoreId: string;
    /** the flow type name */
    flowType: string;
    /** the event type names */
    eventTypes: string[];
    /** the time bucket */
    timeBucket: string;
    /** the paging cursor */
    cursor?: string;
    /** the page size (default is 10.000) */
    pageSize?: number;
    /** start from this event id */
    fromEventId?: string;
    /** after this event id */
    afterEventId?: string;
    /** end at this event id */
    toEventId?: string;
    /** include sensitive data */
    includeSensitiveData?: boolean;
}
/**
 * The output for the events fetch indexes command
 */
interface EventsFetchEventsOutput {
    /** the events */
    events: FlowcoreEvent[];
    /** the next page cursor */
    nextCursor?: string;
}
/**
 * Fetch time buckets for an event type
 */
declare class EventsFetchCommand extends Command<EventsFetchEventsInput, EventsFetchEventsOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the base url for the request
     */
    protected getBaseUrl(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): EventsFetchEventsOutput;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
}

/**
 * The input for the events fetch indexes command
 */
interface TimeBucketListInput {
    /** the tenant */
    tenant: string;
    /** the event type ids */
    eventTypeId: [string, ...string[]] | string;
    /** the start time */
    fromTimeBucket?: string;
    /** the end time */
    toTimeBucket?: string;
    /** the page size */
    pageSize?: number;
    /** the cursor */
    cursor?: number;
    /** the order */
    order?: "asc" | "desc";
}
/**
 * The output for the events fetch indexes command
 */
interface TimeBucketListOutput {
    /** the time buckets */
    timeBuckets: string[];
    /** the next cursor */
    nextCursor?: number;
}
/**
 * Fetch time buckets for an event type
 */
declare class TimeBucketListCommand extends Command<TimeBucketListInput, TimeBucketListOutput> {
    /**
     * The dedicated subdomain for the command
     */
    protected dedicatedSubdomain: string;
    /**
     * Get the method for the request
     */
    protected getMethod(): string;
    /**
     * Get the base url for the request
     */
    protected getBaseUrl(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): TimeBucketListOutput;
}

/**
 * the schema for a container
 */
declare const ContainerRegistrySchema: TObject<{
    tenantId: TString;
    name: TString;
    description: TOptional<TString>;
    username: TOptional<TString>;
    id: TString;
}>;
declare const ContainerRegistryCreateSchema: TObject<{
    id: TString;
}>;
declare const ContainerRegistryDeleteSchema: TObject<{
    status: TNumber;
}>;
declare const ContainerRegistryListSchema: TArray;
type ContainerRegistry = Static<typeof ContainerRegistrySchema>;
type ContainerRegistryList = Static<typeof ContainerRegistryListSchema>;
type ContainerRegistryCreate = Static<typeof ContainerRegistryCreateSchema>;
type ContainerRegistryDelete = Static<typeof ContainerRegistryDeleteSchema>;

interface ContainerRegistryCreateInput {
    /** The tenant id to add the container registry to*/
    tenantId: string;
    /** The name of the container registry */
    name: string;
    /**A description of the container registry */
    description?: string;
    /** The URL of the container registry */
    registryUrl: string;
    /** The username to authenticate with the container registry */
    username?: string;
    /** The password to authenticate with the container registry */
    password?: string;
}
interface ContainerRegistryCreateOutput {
    /** The id of the new container-registry */
    id: string;
}
declare class ContainerRegistryCreateCommand extends Command<ContainerRegistryCreateInput, ContainerRegistryCreate> {
    /**
     * GET the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(response: unknown): ContainerRegistryCreate;
}

interface ContainerRegistryDeleteInput {
    /** The id of the new container-registry */
    containerId: string;
}
declare class ContainerRegistryDeleteCommand extends Command<ContainerRegistryDeleteInput, ContainerRegistryDelete> {
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(response: unknown): ContainerRegistryDelete;
}

interface ContainerRegistryFetchInput {
    /** The id of container */
    containerId: string;
}
declare class ContainerRegistryFetchCommand extends Command<ContainerRegistryFetchInput, ContainerRegistry> {
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(response: unknown): ContainerRegistry;
}

interface ContainerRegistryFetchTenantInput {
    /** The tenant id */
    tenantId: string;
}
declare class ContainerRegistListCommand extends Command<ContainerRegistryFetchTenantInput, ContainerRegistryList> {
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(response: unknown): ContainerRegistryList;
}

interface ContainerRegustryUpdateInput {
    /** The id of the container-registry */
    containerId: string;
    /** The name of the container-registry */
    name?: string;
    /** The description */
    description?: string;
    /** The registry url for the container */
    registryUrl?: string;
    /** The username for authentication */
    username?: string;
    /** The password for authentication */
    password?: string;
}
declare class ContainerRegistryUpdateCommand extends Command<ContainerRegustryUpdateInput, ContainerRegistry> {
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(response: unknown): ContainerRegistry;
}

/**
 * The schema for a PAT (Personal Access Token)
 */
declare const PATSchema: TObject<{
    id: TString;
    name: TString;
    description: TOptional<TString>;
    token: TOptional<TString>;
    createdAt: TString;
}>;
/**
 * The type for a PAT
 */
type PAT = Static<typeof PATSchema>;

/**
 * The input for the PAT create command
 */
interface SecurityCreatePAT {
    /** The name of the PAT */
    name: string;
    /** The description of the PAT */
    description?: string;
}
/**
 * Create a Personal Access Token (PAT)
 */
declare class SecurityCreatePATCommand extends Command<SecurityCreatePAT, PAT> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): PAT;
}

/**
 * The input for the PAT delete command
 */
interface SecurityDeletePAT {
    /** The id of the PAT */
    id: string;
}
interface SecurityDeletePATResponse {
    success: boolean;
}
/**
 * Delete a Personal Access Token (PAT)
 */
declare class SecurityDeletePATCommand extends Command<SecurityDeletePAT, SecurityDeletePATResponse> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): SecurityDeletePATResponse;
}

/**
 * The input for the PAT create command
 */
interface SecurityExchangePAT {
    /** The username of the user */
    username: string;
    /** The Personal Access Token */
    pat: string;
}
interface SecurityExchangePATResponse {
    /** The token of the PAT */
    accessToken: string;
}
/**
 * Exchange a Personal Access Token (PAT) for an access token
 */
declare class SecurityExchangePATCommand extends Command<SecurityExchangePAT, SecurityExchangePATResponse> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    protected getHeaders(): Record<string, string>;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): SecurityExchangePATResponse;
}

/**
 * The input for the PAT get command
 */
interface SecurityGetPAT {
    /** The id of the PAT */
    id: string;
}
/**
 * Get a Personal Access Token (PAT)
 */
declare class SecurityGetPATCommand extends Command<SecurityGetPAT, PAT> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): PAT;
}

/**
 * List all your Personal Access Token (PAT)
 */
declare class SecurityListPATCommand extends Command<void, PAT[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): PAT[];
}

/**
 * The schema for a permission
 */
declare const PermissionSchema: TObject<{
    tenant: TString;
    type: TString;
    id: TString;
    action: TArray<TUnion<[
        TLiteral<"read">,
        TLiteral<"write">,
        TLiteral<"ingest">,
        TLiteral<"fetch">,
        TLiteral<"sensitive-data-fetch">,
        TString
    ]>>;
}>;
/**
 * The type for a permission
 */
type Permission = Static<typeof PermissionSchema>;

/**
 * The input for the permissions list command
 */
interface PermissionsListInput {
    /** Filter by the type of the frn */
    type?: string;
}
/**
 * Fetch an event type
 */
declare class PermissionsListCommand extends Command<PermissionsListInput, Permission[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Permission[];
}

/**
 * The input for initializing user in Keycloak
 * No input parameters needed - checks current authenticated user
 */
type UserInitializeInKeycloakInput = Record<PropertyKey, never>;
/**
 * The output for initializing user in Keycloak
 * (matches the REST API response)
 */
type UserInitializeInKeycloakOutput = Static<typeof responseSchema$2>;
declare const responseSchema$2: TObject<{
    id: TString;
    username: TString;
    email: TString;
    firstName: TString;
    lastName: TString;
}>;
/**
 * Finalize user initialization by setting Flowcore User ID in Keycloak.
 *
 * Calls `POST /api/users` on the user service with an empty JSON body.
 * Requires a bearer token.
 */
declare class UserInitializeInKeycloakCommand extends Command<UserInitializeInKeycloakInput, UserInitializeInKeycloakOutput> {
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Get the base URL for the request
     */
    protected getBaseUrl(): string;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Get the body for the request (must be an empty JSON object)
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserInitializeInKeycloakOutput;
}

/**
 * The input for deleting the current authenticated user
 * No input parameters needed - checks current authenticated user
 */
type UserDeleteInput = Record<PropertyKey, never>;
/**
 * The output for deleting the current authenticated user
 */
type UserDeleteOutput = Static<typeof responseSchema$1>;
declare const responseSchema$1: TObject<{
    id: TString;
}>;
/**
 * Delete current authenticated user
 */
declare class UserDeleteCommand extends Command<UserDeleteInput, UserDeleteOutput> {
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Get the base URL for the request
     */
    protected getBaseUrl(): string;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserDeleteOutput;
}

/**
 * The input for inviting an existing user to a tenant
 */
interface UserInviteToTenantInput {
    tenantName: string;
    userEmail: string;
}
/**
 * The output for inviting an existing user to a tenant
 */
type UserInviteToTenantOutput = Static<typeof responseSchema>;
declare const responseSchema: TObject<{
    success: TBoolean;
    tenantName: TString;
    invitedEmail: TString;
}>;
/**
 * Invite an existing user (by email) to a tenant
 */
declare class UserInviteToTenantCommand extends Command<UserInviteToTenantInput, UserInviteToTenantOutput> {
    /**
     * The allowed modes for the command
     */
    protected allowedModes: ("apiKey" | "bearer")[];
    /**
     * Get the base URL for the request
     */
    protected getBaseUrl(): string;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the path for the request
     */
    protected getPath(): string;
    /**
     * Get the body for the request
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserInviteToTenantOutput;
}

interface DataPathwayAssignmentCompleteInput {
    slotId: string;
    assignmentId: string;
    pathwayId: string;
    outcome: "completed" | "failed" | "revoked";
}
declare class DataPathwayAssignmentCompleteCommand extends Command<DataPathwayAssignmentCompleteInput, null> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(_rawResponse: unknown): null;
}

type TSizeClass = TUnion<[TLiteral<"small">, TLiteral<"medium">, TLiteral<"high">]>;
type TStringRecord$1 = TRecord<TString, TString>;
type TUnknownRecord = TRecord<TString, TUnknown>;
type TNullableString = TUnion<[TString, TNull]>;
type TEndpointConfig = TObject<{
    url: TString;
    authHeaders: TOptional<TStringRecord$1>;
}>;
type TBackoffConfig = TOptional<TObject<{
    initialMs: TOptional<TInteger>;
    maxMs: TOptional<TInteger>;
    multiplier: TOptional<TNumber>;
}>>;
type TTimeoutConfig = TOptional<TObject<{
    deliveryMs: TOptional<TInteger>;
    fetchMs: TOptional<TInteger>;
}>>;
type TSourceConfig = TObject<{
    id: TOptional<TString>;
    name: TOptional<TString>;
    flowType: TString;
    eventTypes: TArray<TString>;
    endpoints: TArray<TEndpointConfig>;
    batchSize: TOptional<TInteger>;
    maxInFlight: TOptional<TInteger>;
    backoff: TBackoffConfig;
    timeouts: TTimeoutConfig;
}>;
type TDataSourceConfig = TObject<{
    tenant: TString;
    dataCore: TString;
}>;
type TAuthConfig = TObject<{
    apiKey: TString;
}>;
type TPathwayConfig = TObject<{
    sources: TArray<TSourceConfig>;
}>;
type TPumpConfig = TObject<{
    sources: TArray<TSourceConfig>;
    dataSource: TDataSourceConfig;
    auth: TOptional<TAuthConfig>;
}>;
/** User-facing pathway config — what the API accepts on create/update */
declare const PathwayConfigSchema: TPathwayConfig;
type PathwayConfig = Static<typeof PathwayConfigSchema>;
/** Rendered pump config — what the worker receives (CP injects dataSource + auth) */
declare const PumpConfigSchema: TPumpConfig;
type PumpConfig = Static<typeof PumpConfigSchema>;
type TPathwayType = TOptional<TUnion<[TLiteral<"managed">, TLiteral<"virtual">]>>;
type TVirtualConfig = TObject<{
    flowTypes: TOptional<TArray<TString>>;
}>;
/**
 * What a virtual pathway consumes, and therefore what a command may target.
 *
 * Entries are either a bare flow type (`"orders.0"`, every pump group on it) or a
 * composite `"orders.0::hot"` naming one pump group. A pump group belongs to exactly one
 * flow type, so the pair is the identity and one array carries both levels of precision.
 */
declare const VirtualConfigSchema: TVirtualConfig;
type VirtualConfig = Static<typeof VirtualConfigSchema>;
/**
 * Desired delivery state of a virtual pathway.
 *
 * `paused` means the control plane has told the consumer to stop delivering to its
 * handlers. The pump keeps running, keeps its buffer and keeps its cursor. A consumer
 * reads this at boot so a redeploy comes back paused rather than silently resuming.
 *
 * Optional: a control plane older than the pause feature omits it.
 */
type TDeliveryState = TUnion<[TLiteral<"active">, TLiteral<"paused">]>;
type TNullableStringArray = TUnion<[TArray<TString>, TNull]>;
declare const DataPathwaySchema: TObject<{
    id: TString;
    tenant: TString;
    name: TOptional<TNullableString>;
    dataCore: TString;
    sizeClass: TSizeClass;
    type: TPathwayType;
    enabled: TBoolean;
    priority: TInteger;
    version: TInteger;
    labels: TStringRecord$1;
    config: TOptional<TPathwayConfig>;
    virtualConfig: TOptional<TVirtualConfig>;
    deliveryState: TOptional<TDeliveryState>;
    deliveryPauseTargets: TOptional<TNullableStringArray>;
    createdAt: TString;
    updatedAt: TString;
}>;
type DataPathway = Static<typeof DataPathwaySchema>;
declare const DataPathwayListSchema: TObject<{
    pathways: TArray<typeof DataPathwaySchema>;
    total: TInteger;
}>;
type DataPathwayList = Static<typeof DataPathwayListSchema>;
declare const DataPathwayMutationResponseSchema: TObject<{
    pathwayId: TString;
    status: TString;
    apiKey: TOptional<TString>;
}>;
type DataPathwayMutationResponse = Static<typeof DataPathwayMutationResponseSchema>;
declare const DataPathwaySlotSchema: TObject<{
    id: TString;
    podUnitId: TString;
    class: TSizeClass;
    labels: TStringRecord$1;
    lastSeen: TString;
    createdAt: TString;
    updatedAt: TString;
}>;
type DataPathwaySlot = Static<typeof DataPathwaySlotSchema>;
declare const DataPathwaySlotListSchema: TObject<{
    slots: TArray<typeof DataPathwaySlotSchema>;
    total: TInteger;
}>;
type DataPathwaySlotList = Static<typeof DataPathwaySlotListSchema>;
declare const DataPathwaySlotMutationResponseSchema: TObject<{
    slotId: TString;
    status: TString;
}>;
type DataPathwaySlotMutationResponse = Static<typeof DataPathwaySlotMutationResponseSchema>;
declare const DataPathwayAssignmentSchema: TObject<{
    id: TString;
    pathwayId: TString;
    slotId: TString;
    generation: TInteger;
    leaseTTL: TString;
    status: TString;
    config: TPumpConfig;
    createdAt: TString;
    updatedAt: TString;
}>;
type DataPathwayAssignment = Static<typeof DataPathwayAssignmentSchema>;
type TAssignmentNextInner = TObject<{
    assignmentId: TString;
    pathwayId: TString;
    slotId: TString;
    generation: TInteger;
    config: TPumpConfig;
    leaseTTL: TString;
    status: TString;
}>;
declare const DataPathwayAssignmentNextSchema: TObject<{
    assignment: TUnion<[TAssignmentNextInner, TNull]>;
}>;
type DataPathwayAssignmentNext = Static<typeof DataPathwayAssignmentNextSchema>;
declare const DataPathwayAssignmentListSchema: TObject<{
    assignments: TArray<typeof DataPathwayAssignmentSchema>;
    total: TInteger;
}>;
type DataPathwayAssignmentList = Static<typeof DataPathwayAssignmentListSchema>;
declare const DataPathwayExpireLeasesResponseSchema: TObject<{
    expired: TInteger;
}>;
type DataPathwayExpireLeasesResponse = Static<typeof DataPathwayExpireLeasesResponseSchema>;
declare const DataPathwayCommandSchema: TObject<{
    id: TString;
    restartRequestId: TNullableString;
    assignmentId: TString;
    type: TString;
    generation: TInteger;
    position: TUnion<[TUnknownRecord, TNull]>;
    stopAt: TNullableString;
    timeoutMs: TUnion<[TInteger, TNull]>;
    phase: TString;
    reason: TNullableString;
    createdAt: TString;
}>;
type DataPathwayCommand = Static<typeof DataPathwayCommandSchema>;
declare const DataPathwayCommandListSchema: TObject<{
    commands: TArray<typeof DataPathwayCommandSchema>;
}>;
type DataPathwayCommandList = Static<typeof DataPathwayCommandListSchema>;
declare const DataPathwayCommandResponseSchema: TObject<{
    commandId: TString;
    phase: TString;
}>;
type DataPathwayCommandResponse = Static<typeof DataPathwayCommandResponseSchema>;
declare const DataPathwayCommandDetailSchema: TObject<{
    id: TString;
    restartRequestId: TNullableString;
    assignmentId: TNullableString;
    pathwayId: TNullableString;
    type: TString;
    generation: TUnion<[TInteger, TNull]>;
    position: TUnion<[TUnknownRecord, TNull]>;
    stopAt: TNullableString;
    timeoutMs: TUnion<[TInteger, TNull]>;
    phase: TString;
    reason: TNullableString;
    details: TNullableString;
    config: TUnion<[TUnknownRecord, TNull]>;
    sourceFlowTypes: TUnion<[TArray<TString>, TNull]>;
    createdAt: TString;
    updatedAt: TString;
}>;
type DataPathwayCommandDetail = Static<typeof DataPathwayCommandDetailSchema>;
declare const DataPathwayRestartRequestResponseSchema: TObject<{
    restartRequestId: TString;
    acceptedTargets: TArray<TString>;
    skippedTargets: TArray<TString>;
}>;
type DataPathwayRestartRequestResponse = Static<typeof DataPathwayRestartRequestResponseSchema>;
declare const DataPathwayRestartRequestSchema: TObject<{
    id: TString;
    targets: TUnknownRecord;
    mode: TString;
    position: TUnknownRecord;
    status: TString;
    requestedBy: TString;
    reason: TNullableString;
    createdAt: TString;
    updatedAt: TString;
}>;
type DataPathwayRestartRequest = Static<typeof DataPathwayRestartRequestSchema>;
type TSlotCount = TObject<{
    free: TInteger;
    used: TInteger;
}>;
type TThreeClassIntegers = TObject<{
    small: TInteger;
    medium: TInteger;
    high: TInteger;
}>;
declare const DataPathwayCapacitySchema: TObject<{
    slots: TObject<{
        small: TSlotCount;
        medium: TSlotCount;
        high: TSlotCount;
    }>;
    pendingAssignments: TThreeClassIntegers;
}>;
type DataPathwayCapacity = Static<typeof DataPathwayCapacitySchema>;
declare const DataPathwayQuotaSchema: TObject<{
    tenant: TString;
    maxSlots: TThreeClassIntegers;
    createdAt: TString;
    updatedAt: TString;
}>;
type DataPathwayQuota = Static<typeof DataPathwayQuotaSchema>;
declare const DataPathwayQuotaWithUsageSchema: TObject<{
    tenant: TString;
    maxSlots: TThreeClassIntegers;
    used: TThreeClassIntegers;
}>;
type DataPathwayQuotaWithUsage = Static<typeof DataPathwayQuotaWithUsageSchema>;
declare const DataPathwayQuotaListSchema: TObject<{
    quotas: TArray<typeof DataPathwayQuotaSchema>;
    total: TInteger;
}>;
type DataPathwayQuotaList = Static<typeof DataPathwayQuotaListSchema>;
declare const DataPathwayQuotaSetResponseSchema: TObject<{
    tenant: TString;
    status: TString;
}>;
type DataPathwayQuotaSetResponse = Static<typeof DataPathwayQuotaSetResponseSchema>;
type TPumpStateValue = TObject<{
    timeBucket: TString;
    eventId: TOptional<TString>;
}>;
declare const DataPathwayPumpStateSchema: TObject<{
    pathwayId: TString;
    flowType: TString;
    state: TUnion<[TPumpStateValue, TNull]>;
}>;
type DataPathwayPumpState = Static<typeof DataPathwayPumpStateSchema>;
declare const DataPathwayPumpStateBySourceSchema: TObject<{
    pathwayId: TString;
    sourceId: TString;
    flowType: TUnion<[TString, TNull]>;
    state: TUnion<[TPumpStateValue, TNull]>;
}>;
type DataPathwayPumpStateBySource = Static<typeof DataPathwayPumpStateBySourceSchema>;
declare const DataPathwayPumpStateSaveResponseSchema: TObject<{
    status: TString;
}>;
type DataPathwayPumpStateSaveResponse = Static<typeof DataPathwayPumpStateSaveResponseSchema>;
declare const DataPathwayDeliveryLogEntrySchema: TObject<{
    id: TString;
    pathwayId: TString;
    assignmentId: TString;
    endpointUrl: TString;
    httpStatus: TUnion<[TInteger, TNull]>;
    success: TBoolean;
    batchSize: TUnion<[TInteger, TNull]>;
    durationMs: TUnion<[TInteger, TNull]>;
    errorMessage: TUnion<[TString, TNull]>;
    responseBody: TUnion<[TString, TNull]>;
    flowType: TUnion<[TString, TNull]>;
    sourceId: TUnion<[TString, TNull]>;
    eventType: TUnion<[TString, TNull]>;
    createdAt: TString;
}>;
declare const DataPathwayDeliveryLogListSchema: TObject<{
    entries: TArray<typeof DataPathwayDeliveryLogEntrySchema>;
    total: TInteger;
}>;
type DataPathwayDeliveryLogList = Static<typeof DataPathwayDeliveryLogListSchema>;
declare const DataPathwayDeliveryLogBatchEntrySchema: TObject<{
    pathwayId: TString;
    assignmentId: TString;
    endpointUrl: TString;
    flowType: TOptional<TString>;
    sourceId: TOptional<TString>;
    eventType: TOptional<TString>;
    httpStatus: TOptional<TInteger>;
    success: TBoolean;
    batchSize: TOptional<TInteger>;
    durationMs: TOptional<TInteger>;
    errorMessage: TOptional<TString>;
    responseBody: TOptional<TString>;
}>;
type DataPathwayDeliveryLogBatchEntry = Static<typeof DataPathwayDeliveryLogBatchEntrySchema>;
declare const DataPathwayDeliveryLogBatchResponseSchema: TObject<{
    inserted: TInteger;
}>;
type DataPathwayDeliveryLogBatchResponse = Static<typeof DataPathwayDeliveryLogBatchResponseSchema>;
type TThroughputRecentResult = TObject<{
    status: TNumber;
    durationMs: TNumber;
    success: TBoolean;
    ageMs: TNumber;
}>;
type TNullableNumber = TUnion<[TNumber, TNull]>;
type TThroughputSource = TObject<{
    flowType: TString;
    name: TOptional<TString>;
    eventsPerSecond: TNumber;
    successRate: TNumber;
    avgDurationMs: TNumber;
    totalDelivered: TNumber;
    totalFailed: TNumber;
    lastDeliveryAgeMs: TNullableNumber;
    healthy: TBoolean;
    recentResults: TArray<TThroughputRecentResult>;
}>;
type TThroughputEndpoint = TObject<{
    eventsPerSecond: TNumber;
    successRate: TNumber;
    totalDelivered: TNumber;
    totalFailed: TNumber;
    lastDeliveryAgeMs: TNullableNumber;
    healthy: TBoolean;
    sources: TRecord<TString, TThroughputSource>;
}>;
type TThroughputGlobal = TObject<{
    eventsPerSecond: TNumber;
    totalRecorded: TNumber;
    windowSeconds: TNumber;
}>;
type TThroughputSnapshot = TObject<{
    global: TThroughputGlobal;
    endpoints: TRecord<TString, TThroughputEndpoint>;
}>;
type TMetricsAssignmentEntry = TObject<{
    assignmentId: TString;
    status: TString;
    throughput: TUnion<[TThroughputSnapshot, TNull]>;
    updatedAt: TString;
}>;
declare const DataPathwayMetricsSchema: TObject<{
    pathwayId: TString;
    assignments: TArray<TMetricsAssignmentEntry>;
}>;
type DataPathwayMetrics = Static<typeof DataPathwayMetricsSchema>;
declare const DataPathwayHealthSchema: TObject<{
    status: TUnion<[TLiteral<"healthy">, TLiteral<"unhealthy">]>;
    checks: TObject<{
        db: TUnion<[TLiteral<"ok">, TLiteral<"error">]>;
    }>;
    uptime: TNumber;
}>;
type DataPathwayHealth = Static<typeof DataPathwayHealthSchema>;
declare const DataPathwayPumpPulseResponseSchema: TObject<{
    status: TString;
}>;
type DataPathwayPumpPulseResponse = Static<typeof DataPathwayPumpPulseResponseSchema>;
declare const DataPathwayPumpStatusSchema: TObject;
type DataPathwayPumpStatus = Static<typeof DataPathwayPumpStatusSchema>;

type DataPathwayAssignmentExpireLeasesInput = Record<string, never>;
declare class DataPathwayAssignmentExpireLeasesCommand extends Command<DataPathwayAssignmentExpireLeasesInput, DataPathwayExpireLeasesResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown> | undefined;
    protected parseResponse(rawResponse: unknown): DataPathwayExpireLeasesResponse;
}

interface DataPathwayAssignmentFetchInput {
    id: string;
}
declare class DataPathwayAssignmentFetchCommand extends Command<DataPathwayAssignmentFetchInput, DataPathwayAssignment> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayAssignment;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayAssignmentHeartbeatInput {
    slotId: string;
    assignmentId: string;
    pathwayId: string;
    metrics: {
        eventsFetchedTotal?: number;
        eventsDeliveredTotal?: number;
        deliveryErrorsTotal?: number;
        bufferDepth?: number;
        lagSeconds?: number;
        throughput?: {
            global: {
                eventsPerSecond: number;
                totalRecorded: number;
                windowSeconds: number;
            };
            endpoints: Record<string, {
                eventsPerSecond: number;
                successRate: number;
                totalDelivered: number;
                totalFailed: number;
                lastDeliveryAgeMs: number | null;
                healthy: boolean;
                sources: Record<string, {
                    flowType: string;
                    name?: string;
                    eventsPerSecond: number;
                    successRate: number;
                    avgDurationMs: number;
                    totalDelivered: number;
                    totalFailed: number;
                    lastDeliveryAgeMs: number | null;
                    healthy: boolean;
                    recentResults: Array<{
                        status: number;
                        durationMs: number;
                        success: boolean;
                        ageMs: number;
                    }>;
                }>;
            }>;
        };
    };
}
declare class DataPathwayAssignmentHeartbeatCommand extends Command<DataPathwayAssignmentHeartbeatInput, null> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(_rawResponse: unknown): null;
}

interface DataPathwayAssignmentListInput {
    status?: "active" | "completed" | "failed" | "revoked" | "expired";
    slotId?: string;
    pathwayId?: string;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
}
declare class DataPathwayAssignmentListCommand extends Command<DataPathwayAssignmentListInput, DataPathwayAssignmentList> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayAssignmentList;
}

interface DataPathwayAssignmentNextInput {
    slotId: string;
    class: "small" | "medium" | "high";
}
declare class DataPathwayAssignmentNextCommand extends Command<DataPathwayAssignmentNextInput, DataPathwayAssignmentNext> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayAssignmentNext;
}

type DataPathwayCapacityFetchInput = Record<string, never>;
declare class DataPathwayCapacityFetchCommand extends Command<DataPathwayCapacityFetchInput, DataPathwayCapacity> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayCapacity;
}

interface DataPathwayCommandDispatchConfigUpdateInput {
    assignmentId: string;
    generation: number;
    config: Record<string, unknown>;
}
declare class DataPathwayCommandDispatchConfigUpdateCommand extends Command<DataPathwayCommandDispatchConfigUpdateInput, DataPathwayCommandResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandDispatchRestartInput {
    assignmentId: string;
    restartRequestId?: string;
    generation: number;
    position?: {
        timeBucket?: string;
        eventId?: string;
    };
    stopAt?: string | null;
    timeoutMs?: number;
}
declare class DataPathwayCommandDispatchRestartCommand extends Command<DataPathwayCommandDispatchRestartInput, DataPathwayCommandResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandDispatchStopInput {
    assignmentId: string;
    restartRequestId?: string;
    generation: number;
    reason?: string;
    timeoutMs?: number;
}
declare class DataPathwayCommandDispatchStopCommand extends Command<DataPathwayCommandDispatchStopInput, DataPathwayCommandResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandFetchInput {
    commandId: string;
}
declare class DataPathwayCommandFetchCommand extends Command<DataPathwayCommandFetchInput, DataPathwayCommandDetail> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandDetail;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandPendingInput {
    assignmentId: string;
}
declare class DataPathwayCommandPendingCommand extends Command<DataPathwayCommandPendingInput, DataPathwayCommandList> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandList;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandUpdateStatusInput {
    assignmentId: string;
    commandId: string;
    phase: "acknowledged" | "restarting" | "running" | "failed" | "timedOut";
    details?: string;
}
declare class DataPathwayCommandUpdateStatusCommand extends Command<DataPathwayCommandUpdateStatusInput, DataPathwayCommandResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayDeliveryLogBatchInput {
    entries: DataPathwayDeliveryLogBatchEntry[];
}
declare class DataPathwayDeliveryLogBatchCommand extends Command<DataPathwayDeliveryLogBatchInput, DataPathwayDeliveryLogBatchResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayDeliveryLogBatchResponse;
}

interface DataPathwayDeliveryLogListInput {
    pathwayId: string;
    success?: boolean;
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
}
declare class DataPathwayDeliveryLogListCommand extends Command<DataPathwayDeliveryLogListInput, DataPathwayDeliveryLogList> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayDeliveryLogList;
}

type DataPathwayHealthCheckInput = Record<string, never>;
declare class DataPathwayHealthCheckCommand extends Command<DataPathwayHealthCheckInput, DataPathwayHealth> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayHealth;
}

interface DataPathwayCreateInput {
    id: string;
    tenant: string;
    dataCore: string;
    sizeClass: "small" | "medium" | "high";
    enabled?: boolean;
    priority?: number;
    version?: number;
    labels?: Record<string, string>;
    config?: PathwayConfig;
    type?: "managed" | "virtual";
    virtualConfig?: VirtualConfig;
}
declare class DataPathwayCreateCommand extends Command<DataPathwayCreateInput, DataPathwayMutationResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayMutationResponse;
}

interface DataPathwayDeleteInput {
    id: string;
    reason?: string;
}
declare class DataPathwayDeleteCommand extends Command<DataPathwayDeleteInput, DataPathwayMutationResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayMutationResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayDisableInput {
    id: string;
    reason?: string;
}
declare class DataPathwayDisableCommand extends Command<DataPathwayDisableInput, DataPathwayMutationResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayMutationResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayFetchInput {
    id: string;
}
declare class DataPathwayFetchCommand extends Command<DataPathwayFetchInput, DataPathway> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathway;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayFetchByNameInput {
    name: string;
    tenant: string;
}
declare class DataPathwayFetchByNameCommand extends Command<DataPathwayFetchByNameInput, DataPathway> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathway;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayListInput {
    tenant?: string;
    sizeClass?: "small" | "medium" | "high";
    type?: "managed" | "virtual";
    enabled?: boolean;
    priority?: number;
    limit?: number;
    offset?: number;
    /** Page number (1-based). When set, offset is derived as (page - 1) * limit. */
    page?: number;
    /** Pathway ids to pin to the front of the list (comma-separated string or array) */
    ids?: string | string[];
    sort?: "asc" | "desc";
}
declare class DataPathwayListCommand extends Command<DataPathwayListInput, DataPathwayList> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayList;
}

interface DataPathwayMetricsFetchInput {
    id: string;
}
declare class DataPathwayMetricsFetchCommand extends Command<DataPathwayMetricsFetchInput, DataPathwayMetrics> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayMetrics;
    protected handleClientError(error: ClientError): void;
}

type TUpsertResponse = TObject<{
    pathwayId: TString;
    status: TUnion<[TLiteral<"created">, TLiteral<"updated">]>;
}>;
declare const DataPathwayUpsertByNameResponseSchema: TUpsertResponse;
type DataPathwayUpsertByNameResponse = Static<typeof DataPathwayUpsertByNameResponseSchema>;
interface DataPathwayUpsertByNameInput {
    name: string;
    tenant: string;
    dataCore: string;
    sizeClass?: "small" | "medium" | "high";
    enabled?: boolean;
    labels?: Record<string, string>;
    type?: "managed" | "virtual";
    config?: PathwayConfig;
    virtualConfig?: VirtualConfig;
}
declare class DataPathwayUpsertByNameCommand extends Command<DataPathwayUpsertByNameInput, DataPathwayUpsertByNameResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayUpsertByNameResponse;
}

interface DataPathwayCommandDispatchPauseInput {
    pathwayId: string;
    /**
     * What to pause. Each entry is either a bare flow type (`"orders.0"`, every pump group
     * on it) or a composite `"orders.0::hot"` naming exactly one pump. Omit to pause every
     * pump.
     *
     * A composite target is rejected with 409 unless the pathway advertised composite
     * entries in `virtualConfig.flowTypes`. An older consumer compares targets against flow
     * type names only, so it would match nothing and pause nothing.
     */
    targets?: string[];
    reason?: string;
    requestedBy?: string;
    timeoutMs?: number;
}
/**
 * Pause delivery on a virtual pathway.
 *
 * Delivery to the consumer's handlers stops while its pump keeps fetching, keeps its
 * buffer and keeps its cursor. The desired state is recorded on the pathway, so a
 * consumer that restarts comes back paused at the same position.
 *
 * This is NOT `disable`. Disabling a virtual pathway deletes its API key, and a later
 * enable resets the cursor to latest.
 */
declare class DataPathwayCommandDispatchPauseCommand extends Command<DataPathwayCommandDispatchPauseInput, DataPathwayCommandResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandDispatchResumeInput {
    pathwayId: string;
    /**
     * What to resume. Same shape as the pause targets: a bare flow type, or a composite
     * `"orders.0::hot"`. Omit to resume every pump.
     */
    targets?: string[];
    reason?: string;
    requestedBy?: string;
    timeoutMs?: number;
}
/**
 * Resume delivery on a virtual pathway, continuing from the exact position where
 * {@link DataPathwayCommandDispatchPauseCommand} stopped it.
 */
declare class DataPathwayCommandDispatchResumeCommand extends Command<DataPathwayCommandDispatchResumeInput, DataPathwayCommandResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandPendingByPathwayInput {
    pathwayId: string;
}
/**
 * Fetch pending commands for a virtual pathway. Mirrors the assignment-scoped
 * `command.pending` endpoint but for virtual pathways that poll by pathwayId.
 */
declare class DataPathwayCommandPendingByPathwayCommand extends Command<DataPathwayCommandPendingByPathwayInput, DataPathwayCommandList> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandList;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayCommandUpdateStatusByPathwayInput {
    pathwayId: string;
    commandId: string;
    phase: "acknowledged" | "restarting" | "running" | "failed" | "timedOut";
    details?: string;
}
/**
 * Update command status for a virtual pathway callback. Mirrors the
 * assignment-scoped `command.update-status` endpoint but for virtual pathways
 * that report completion by pathwayId.
 */
declare class DataPathwayCommandUpdateStatusByPathwayCommand extends Command<DataPathwayCommandUpdateStatusByPathwayInput, DataPathwayCommandResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayCommandResponse;
    protected handleClientError(error: ClientError): void;
}

interface SendPumpPulseInput {
    pathwayId: string;
    sourceId?: string;
    flowType: string;
    timeBucket: string;
    eventId: string | null;
    isLive: boolean;
    buffer: {
        depth: number;
        reserved: number;
        sizeBytes: number;
    };
    counters: {
        acknowledged: number;
        failed: number;
        pulled: number;
    };
    uptimeMs: number;
}
declare class SendPumpPulseCommand extends Command<SendPumpPulseInput, DataPathwayPumpPulseResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayPumpPulseResponse;
}

interface DataPathwayPumpStateFetchInput {
    pathwayId: string;
    flowType: string;
}
declare class DataPathwayPumpStateFetchCommand extends Command<DataPathwayPumpStateFetchInput, DataPathwayPumpState> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayPumpState;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayPumpStateFetchBySourceInput {
    pathwayId: string;
    sourceId: string;
}
declare class DataPathwayPumpStateFetchBySourceCommand extends Command<DataPathwayPumpStateFetchBySourceInput, DataPathwayPumpStateBySource> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayPumpStateBySource;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayPumpStateSaveInput {
    pathwayId: string;
    flowType: string;
    state: {
        timeBucket: string;
        eventId?: string;
    };
}
declare class DataPathwayPumpStateSaveCommand extends Command<DataPathwayPumpStateSaveInput, DataPathwayPumpStateSaveResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayPumpStateSaveResponse;
}

interface DataPathwayPumpStateSaveBySourceInput {
    pathwayId: string;
    sourceId: string;
    state: {
        timeBucket: string;
        eventId?: string;
    };
}
declare class DataPathwayPumpStateSaveBySourceCommand extends Command<DataPathwayPumpStateSaveBySourceInput, DataPathwayPumpStateSaveResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayPumpStateSaveResponse;
}

interface FetchPumpStatusInput {
    pathwayId: string;
}
declare class FetchPumpStatusCommand extends Command<FetchPumpStatusInput, DataPathwayPumpStatus> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown> | undefined;
    protected parseResponse(rawResponse: unknown): DataPathwayPumpStatus;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayQuotaFetchInput {
    tenant: string;
}
declare class DataPathwayQuotaFetchCommand extends Command<DataPathwayQuotaFetchInput, DataPathwayQuotaWithUsage> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayQuotaWithUsage;
    protected handleClientError(error: ClientError): void;
}

type DataPathwayQuotaListInput = Record<string, never>;
declare class DataPathwayQuotaListCommand extends Command<DataPathwayQuotaListInput, DataPathwayQuotaList> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayQuotaList;
}

interface DataPathwayQuotaSetInput {
    tenant: string;
    maxSlots: {
        small: number;
        medium: number;
        high: number;
    };
}
declare class DataPathwayQuotaSetCommand extends Command<DataPathwayQuotaSetInput, DataPathwayQuotaSetResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwayQuotaSetResponse;
}

interface DataPathwayRestartFetchInput {
    id: string;
}
declare class DataPathwayRestartFetchCommand extends Command<DataPathwayRestartFetchInput, DataPathwayRestartRequest> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayRestartRequest;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwayRestartRequestInput {
    targets: {
        flowTypes?: string[];
        pathwayIds?: string[];
        selector?: {
            tenant?: string;
            labels?: Record<string, string>;
        };
    };
    mode?: "datapumpRestart" | "hardReset";
    position: {
        timeBucket?: string;
        eventId?: string;
    };
    stopAt?: string | null;
    timeoutMs?: number;
    requestedBy: string;
    reason?: string;
}
declare class DataPathwayRestartRequestCommand extends Command<DataPathwayRestartRequestInput, DataPathwayRestartRequestResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwayRestartRequestResponse;
}

interface DataPathwaySlotDeregisterInput {
    id: string;
    reason?: string;
}
declare class DataPathwaySlotDeregisterCommand extends Command<DataPathwaySlotDeregisterInput, DataPathwaySlotMutationResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwaySlotMutationResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwaySlotFetchInput {
    id: string;
}
declare class DataPathwaySlotFetchCommand extends Command<DataPathwaySlotFetchInput, DataPathwaySlot> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwaySlot;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwaySlotHeartbeatInput {
    id: string;
}
declare class DataPathwaySlotHeartbeatCommand extends Command<DataPathwaySlotHeartbeatInput, DataPathwaySlotMutationResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): DataPathwaySlotMutationResponse;
    protected handleClientError(error: ClientError): void;
}

interface DataPathwaySlotListInput {
    class?: "small" | "medium" | "high";
    limit?: number;
    offset?: number;
    sort?: "asc" | "desc";
}
declare class DataPathwaySlotListCommand extends Command<DataPathwaySlotListInput, DataPathwaySlotList> {
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwaySlotList;
}

interface DataPathwaySlotRegisterInput {
    slotId: string;
    podUnitId: string;
    class: "small" | "medium" | "high";
    version: string;
    labels?: Record<string, string>;
}
declare class DataPathwaySlotRegisterCommand extends Command<DataPathwaySlotRegisterInput, DataPathwaySlotMutationResponse> {
    protected retryOnFailure: boolean;
    protected allowedModes: ("apiKey" | "bearer")[];
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): DataPathwaySlotMutationResponse;
}

/**
 * The schema for a permission
 */
declare const UserPermissionSchema: TObject<{
    tenant: TString;
    type: TString;
    id: TString;
    action: TArray<TString>;
}>;
/**
 * The permission type
 */
type UserPermission = Static<typeof UserPermissionSchema>;
/**
 * The input for the user permissions command
 */
interface UserPermissionsInput {
    /** The optional permission type */
    type?: string;
}
/**
 * Get all permissions for the current user
 */
declare class UserPermissionsCommand extends Command<UserPermissionsInput, UserPermission[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserPermission[];
}

declare const PolicyFilterValueSchema: _sinclair_typebox.TUnion<[_sinclair_typebox.TString, _sinclair_typebox.TNumber, _sinclair_typebox.TBoolean, _sinclair_typebox.TNull]>;
declare const PolicyFilterSchema: _sinclair_typebox.TUnion<[_sinclair_typebox.TObject<{
    path: _sinclair_typebox.TString;
    operator: _sinclair_typebox.TLiteral<"equals">;
    value: _sinclair_typebox.TUnion<[_sinclair_typebox.TString, _sinclair_typebox.TNumber, _sinclair_typebox.TBoolean, _sinclair_typebox.TNull]>;
}>, _sinclair_typebox.TObject<{
    path: _sinclair_typebox.TString;
    operator: _sinclair_typebox.TLiteral<"oneOf">;
    values: _sinclair_typebox.TArray<_sinclair_typebox.TUnion<[_sinclair_typebox.TString, _sinclair_typebox.TNumber, _sinclair_typebox.TBoolean, _sinclair_typebox.TNull]>>;
}>, _sinclair_typebox.TObject<{
    path: _sinclair_typebox.TString;
    operator: _sinclair_typebox.TLiteral<"exists">;
    value: _sinclair_typebox.TBoolean;
}>]>;
type PolicyFilterValue = Static<typeof PolicyFilterValueSchema>;
type PolicyFilter = Static<typeof PolicyFilterSchema>;
declare function isEncryptedPayload(payload: unknown): boolean;
declare function matchesPolicyFilters(filters: readonly PolicyFilter[], payload: unknown): boolean;
type EntitlementGrant = {
    policyFrn: string;
    statementId: string;
    resource: string;
    filters?: PolicyFilter[];
};
declare function permitsPayload(grants: readonly EntitlementGrant[], payload: unknown): boolean;

/**
 * The schema for a policy statement document
 */
declare const PolicyStatementSchema: TObject<{
    statementId: TOptional<TString>;
    resource: TString;
    action: TUnion<[TString, TArray<TString>]>;
    filters: TOptional<TArray<typeof PolicyFilterSchema>>;
}>;
/**
 * The schema for a policy
 */
declare const PolicySchema: TObject<{
    id: TString;
    organizationId: TString;
    name: TString;
    version: TString;
    policyDocuments: TArray<typeof PolicyStatementSchema>;
    description: TOptional<TString>;
    principal: TOptional<TString>;
    flowcoreManaged: TBoolean;
    archived: TOptional<TBoolean>;
    frn: TString;
}>;
/**
 * The Policy type
 */
type Policy = Static<typeof PolicySchema>;
/**
 * The Policy Statement type
 */
type PolicyStatement = Static<typeof PolicyStatementSchema>;
/**
 * The input for the policy create command
 */
interface PolicyCreateInput {
    /** The organization id */
    organizationId: string;
    /** The name of the policy */
    name: string;
    /** The version of the policy */
    version: string;
    /** The policy documents */
    policyDocuments: Array<{
        /** The optional statement id */
        statementId?: string;
        /** The resource for this statement */
        resource: string;
        /** The actions for this statement */
        action: string | string[];
        /** Optional plaintext event payload filters. */
        filters?: PolicyFilter[];
    }>;
    /** The description of the policy */
    description?: string;
    /** The principal role that can access the resource */
    principal?: string;
    /** Whether the policy is managed by Flowcore */
    flowcoreManaged?: boolean;
}
/**
 * Create a policy
 */
declare class PolicyCreateCommand extends Command<PolicyCreateInput, Policy> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy;
}

/**
 * The input for the policy list command
 */
interface PolicyListInput {
    /** The organization id */
    organizationId?: string;
}
/**
 * List policies
 */
declare class PolicyListCommand extends Command<PolicyListInput, Policy[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy[];
}

/**
 * The schema for a successful policy validation response.
 *
 * Returned by `POST /api/v1/policies/validate` when the submitted policy
 * payload passes every rule the create and patch paths enforce. Invalid
 * payloads are surfaced as 4xx errors (422 for format / tenant boundary /
 * UUID violations, 404 when the organization is not found) and are not
 * represented in this schema.
 */
declare const PolicyValidateResponseSchema: TObject<{
    valid: TLiteral<true>;
}>;
/**
 * The Policy Validate response type
 */
type PolicyValidateResponse = Static<typeof PolicyValidateResponseSchema>;
/**
 * The input for the policy validate command.
 *
 * Mirrors the service's `validatePolicyBody` DTO: only the fields that are
 * actually validated are required. The command is a dry-run of the same
 * helpers used by `PolicyCreateCommand` and `PolicyUpdateCommand`, so a
 * successful response guarantees the payload would also be accepted by
 * those commands.
 */
interface PolicyValidateInput {
    /** The organization that would own the policy — used to enforce the tenant boundary on policyDocuments resources */
    organizationId: string;
    /** The policy documents to validate */
    policyDocuments: Array<{
        /** The optional statement id */
        statementId?: string;
        /** The resource for this statement */
        resource: string;
        /** The actions for this statement */
        action: string | string[];
        /** Optional plaintext event payload filters. */
        filters?: PolicyFilter[];
    }>;
    /** The optional principal role FRN (cross-tenant is intentionally permitted here) */
    principal?: string;
}
/**
 * Dry-run validate a prospective policy payload.
 *
 * Calls `POST /api/v1/policies/validate`, which runs the same
 * validation helpers as `POST /api/v1/policies/` and
 * `PATCH /api/v1/policies/:id`. A successful response means the same
 * payload would be accepted by the create/update commands. Useful for
 * giving immediate feedback in UIs, CLIs, and SDK consumers before any
 * write actually happens.
 */
declare class PolicyValidateCommand extends Command<PolicyValidateInput, PolicyValidateResponse> {
    /**
     * Whether the command should retry on failure.
     *
     * Disabled because a 422 here indicates an invalid payload — retrying
     * would just re-submit the same bad data.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): PolicyValidateResponse;
}

/**
 * The input for the policy archive command
 */
interface PolicyArchiveInput {
    /** The policy id */
    policyId: string;
}
/**
 * The schema for the archive policy response
 */
declare const ArchivePolicyResponseSchema: TObject<{
    message: TString;
}>;
/**
 * The archive policy response type
 */
type ArchivePolicyResponse = Static<typeof ArchivePolicyResponseSchema>;
/**
 * Archive a policy by ID
 */
declare class PolicyArchiveCommand extends Command<PolicyArchiveInput, ArchivePolicyResponse> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ArchivePolicyResponse;
}

/**
 * The input for the policy get command
 */
interface PolicyGetInput {
    /** The policy id */
    policyId: string;
}
/**
 * Get a policy by ID
 */
declare class PolicyGetCommand extends Command<PolicyGetInput, Policy> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Create a new instance of the command
     * @param policyId - The ID of the policy to get
     */
    constructor(policyId: string);
    /**
     * Create a new instance of the command
     * @param input - The input for the command
     */
    constructor(input: PolicyGetInput);
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy;
}

/**
 * The input for the policy update command
 */
interface PolicyUpdateInput {
    /** The policy id */
    policyId: string;
    /** The organization id */
    organizationId: string;
    /** The name of the policy */
    name: string;
    /** The version of the policy */
    version: string;
    /** The policy documents */
    policyDocuments: PolicyStatement[];
    /** The description of the policy */
    description?: string;
    /** The principal role that can access the resource */
    principal?: string;
    /** Whether the policy is managed by Flowcore */
    flowcoreManaged?: boolean;
}
/**
 * Update a policy by ID
 */
declare class PolicyUpdateCommand extends Command<PolicyUpdateInput, Policy> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    protected getHeaders(): Record<string, string>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy;
}

/**
 * The input for the key policies command
 */
interface KeyPoliciesInput {
    /** The key id */
    keyId: string;
}
/**
 * Fetch policies for a key
 */
declare class KeyPoliciesCommand extends Command<KeyPoliciesInput, Policy[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy[];
}

/**
 * The input for the organization policies command
 */
interface OrganizationPoliciesInput {
    /** The organization id */
    organizationId: string;
}
/**
 * Fetch policies for an organization
 */
declare class OrganizationPoliciesCommand extends Command<OrganizationPoliciesInput, Policy[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy[];
}

/**
 * The schema for a policy-key association
 */
declare const PolicyKeyAssociationSchema: TObject<{
    policyId: TString;
    organizationId: TString;
    keyId: TString;
}>;
/**
 * The schema for a policy-user association
 */
declare const PolicyUserAssociationSchema: TObject<{
    policyId: TString;
    organizationId: TString;
    userId: TString;
}>;
/**
 * The schema for a policy-role association
 */
declare const PolicyRoleAssociationSchema: TObject<{
    policyId: TString;
    organizationId: TString;
    roleId: TString;
}>;
/**
 * The schema for policy associations
 */
declare const PolicyAssociationsSchema: TObject<{
    keys: TArray<typeof PolicyKeyAssociationSchema>;
    users: TArray<typeof PolicyUserAssociationSchema>;
    roles: TArray<typeof PolicyRoleAssociationSchema>;
}>;
/**
 * The policy-key association type
 */
type PolicyKeyAssociation = Static<typeof PolicyKeyAssociationSchema>;
/**
 * The policy-user association type
 */
type PolicyUserAssociation = Static<typeof PolicyUserAssociationSchema>;
/**
 * The policy-role association type
 */
type PolicyRoleAssociation = Static<typeof PolicyRoleAssociationSchema>;
/**
 * The policy associations type
 */
type PolicyAssociations = Static<typeof PolicyAssociationsSchema>;
/**
 * The input for the policy associations command
 */
interface PolicyAssociationsInput {
    /** The policy id */
    policyId: string;
}
/**
 * Fetch associations for a policy
 */
declare class PolicyAssociationsCommand extends Command<PolicyAssociationsInput, PolicyAssociations> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): PolicyAssociations;
}

/**
 * The input for the role policies command
 */
interface RolePoliciesInput {
    /** The role id */
    roleId: string;
}
/**
 * Fetch policies for a role
 */
declare class RolePoliciesCommand extends Command<RolePoliciesInput, Policy[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy[];
}

/**
 * The input for the user policies command
 */
interface UserPoliciesInput {
    /** The user id */
    userId: string;
    /** The optional organization id */
    organizationId?: string;
}
/**
 * Fetch policies for a user
 */
declare class UserPoliciesCommand extends Command<UserPoliciesInput, Policy[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Policy[];
}

/**
 * The schema for a key policy link response
 */
declare const KeyPolicyLinkSchema: TObject<{
    policyId: TString;
    organizationId: TString;
    keyId: TString;
}>;
/**
 * The key policy link response type
 */
type KeyPolicyLink = Static<typeof KeyPolicyLinkSchema>;
/**
 * The input for the link key policy command
 */
interface LinkKeyPolicyInput {
    /** The key id */
    keyId: string;
    /** The policy id */
    policyId: string;
}
/**
 * Link a policy to a key
 */
declare class LinkKeyPolicyCommand extends Command<LinkKeyPolicyInput, KeyPolicyLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): KeyPolicyLink;
}

/**
 * The schema for a role policy link response
 */
declare const RolePolicyLinkSchema: TObject<{
    policyId: TString;
    organizationId: TString;
    roleId: TString;
}>;
/**
 * The role policy link response type
 */
type RolePolicyLink = Static<typeof RolePolicyLinkSchema>;
/**
 * The input for the link role policy command
 */
interface LinkRolePolicyInput {
    /** The role id */
    roleId: string;
    /** The policy id */
    policyId: string;
}
/**
 * Link a policy to a role
 */
declare class LinkRolePolicyCommand extends Command<LinkRolePolicyInput, RolePolicyLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): RolePolicyLink;
}

/**
 * The schema for a user policy link response
 */
declare const UserPolicyLinkSchema: TObject<{
    policyId: TString;
    organizationId: TString;
    userId: TString;
}>;
/**
 * The user policy link response type
 */
type UserPolicyLink = Static<typeof UserPolicyLinkSchema>;
/**
 * The input for the link user policy command
 */
interface LinkUserPolicyInput {
    /** The user id */
    userId: string;
    /** The policy id */
    policyId: string;
}
/**
 * Link a policy to a user
 */
declare class LinkUserPolicyCommand extends Command<LinkUserPolicyInput, UserPolicyLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserPolicyLink;
}

/**
 * The input for the unlink key policy command
 */
interface UnlinkKeyPolicyInput {
    /** The key id */
    keyId: string;
    /** The policy id */
    policyId: string;
}
/**
 * Unlink a policy from a key
 */
declare class UnlinkKeyPolicyCommand extends Command<UnlinkKeyPolicyInput, KeyPolicyLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): KeyPolicyLink;
}

/**
 * The input for the unlink role policy command
 */
interface UnlinkRolePolicyInput {
    /** The role id */
    roleId: string;
    /** The policy id */
    policyId: string;
}
/**
 * Unlink a policy from a role
 */
declare class UnlinkRolePolicyCommand extends Command<UnlinkRolePolicyInput, RolePolicyLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): RolePolicyLink;
}

/**
 * The input for the unlink user policy command
 */
interface UnlinkUserPolicyInput {
    /** The user id */
    userId: string;
    /** The policy id */
    policyId: string;
}
/**
 * Unlink a policy from a user
 */
declare class UnlinkUserPolicyCommand extends Command<UnlinkUserPolicyInput, UserPolicyLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserPolicyLink;
}

/**
 * The schema for a role
 */
declare const RoleSchema: TObject<{
    id: TString;
    organizationId: TString;
    name: TString;
    description: TOptional<TString>;
    flowcoreManaged: TOptional<TBoolean>;
    archived: TOptional<TBoolean>;
}>;
/**
 * The Role type
 */
type Role = Static<typeof RoleSchema>;
/**
 * The input for the role create command
 */
interface RoleCreateInput {
    /** The organization id */
    organizationId: string;
    /** The name of the role */
    name: string;
    /** The description of the role */
    description?: string;
    /** Whether the role is managed by Flowcore */
    flowcoreManaged?: boolean;
}
/**
 * Create a role
 */
declare class RoleCreateCommand extends Command<RoleCreateInput, Role> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Role;
}

/**
 * The input for the key roles command
 */
interface KeyRolesInput {
    /** The key id */
    keyId: string;
}
/**
 * Fetch roles for a key
 */
declare class KeyRolesCommand extends Command<KeyRolesInput, Role[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Role[];
}

/**
 * The input for the organization roles command
 */
interface OrganizationRolesInput {
    /** The organization id */
    organizationId: string;
}
/**
 * Fetch roles for an organization
 */
declare class OrganizationRolesCommand extends Command<OrganizationRolesInput, Role[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Role[];
}

/**
 * The schema for a role-key association
 */
declare const RoleKeyAssociationSchema: TObject<{
    roleId: TString;
    organizationId: TString;
    keyId: TString;
}>;
/**
 * The schema for a role-user association
 */
declare const RoleUserAssociationSchema: TObject<{
    roleId: TString;
    organizationId: TString;
    userId: TString;
}>;
/**
 * The schema for role associations
 */
declare const RoleAssociationsSchema: TObject<{
    keys: TArray<typeof RoleKeyAssociationSchema>;
    users: TArray<typeof RoleUserAssociationSchema>;
}>;
/**
 * The role-key association type
 */
type RoleKeyAssociation = Static<typeof RoleKeyAssociationSchema>;
/**
 * The role-user association type
 */
type RoleUserAssociation = Static<typeof RoleUserAssociationSchema>;
/**
 * The role associations type
 */
type RoleAssociations = Static<typeof RoleAssociationsSchema>;
/**
 * The input for the role associations command
 */
interface RoleAssociationsInput {
    /** The role id */
    roleId: string;
}
/**
 * Fetch associations for a role
 */
declare class RoleAssociationsCommand extends Command<RoleAssociationsInput, RoleAssociations> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): RoleAssociations;
}

/**
 * The input for the user roles command
 */
interface UserRolesInput {
    /** The user id */
    userId: string;
    /** The optional organization id */
    organizationId?: string;
}
/**
 * Fetch roles for a user
 */
declare class UserRolesCommand extends Command<UserRolesInput, Role[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Role[];
}

/**
 * The schema for a key role link response
 */
declare const KeyRoleLinkSchema: TObject<{
    roleId: TString;
    organizationId: TString;
    keyId: TString;
}>;
/**
 * The key role link response type
 */
type KeyRoleLink = Static<typeof KeyRoleLinkSchema>;
/**
 * The input for the link key role command
 */
interface LinkKeyRoleInput {
    /** The key id */
    keyId: string;
    /** The role id */
    roleId: string;
}
/**
 * Link a role to a key
 */
declare class LinkKeyRoleCommand extends Command<LinkKeyRoleInput, KeyRoleLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): KeyRoleLink;
}

/**
 * The schema for a user role link response
 */
declare const UserRoleLinkSchema: TObject<{
    roleId: TString;
    organizationId: TString;
    userId: TString;
}>;
/**
 * The user role link response type
 */
type UserRoleLink = Static<typeof UserRoleLinkSchema>;
/**
 * The input for the link user role command
 */
interface LinkUserRoleInput {
    /** The user id */
    userId: string;
    /** The role id */
    roleId: string;
}
/**
 * Link a role to a user
 */
declare class LinkUserRoleCommand extends Command<LinkUserRoleInput, UserRoleLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserRoleLink;
}

/**
 * The input for the unlink key role command
 */
interface UnlinkKeyRoleInput {
    /** The key id */
    keyId: string;
    /** The role id */
    roleId: string;
}
/**
 * Unlink a role from a key
 */
declare class UnlinkKeyRoleCommand extends Command<UnlinkKeyRoleInput, KeyRoleLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): KeyRoleLink;
}

/**
 * The input for the unlink user role command
 */
interface UnlinkUserRoleInput {
    /** The user id */
    userId: string;
    /** The role id */
    roleId: string;
}
/**
 * Unlink a role from a user
 */
declare class UnlinkUserRoleCommand extends Command<UnlinkUserRoleInput, UserRoleLink> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): UserRoleLink;
}

/**
 * The input for the role list command
 */
interface RoleListInput {
    /** Optional organization id to filter by */
    organizationId?: string;
}
/**
 * List roles for the current user
 */
declare class RoleListCommand extends Command<RoleListInput, Role[]> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Role[];
}

/**
 * The input for the role archive command
 */
interface RoleArchiveInput {
    /** The role id */
    roleId: string;
}
/**
 * The schema for the archive role response
 */
declare const ArchiveRoleResponseSchema: TObject<{
    message: TString;
}>;
/**
 * The archive role response type
 */
type ArchiveRoleResponse = Static<typeof ArchiveRoleResponseSchema>;
/**
 * Archive a role by ID
 */
declare class RoleArchiveCommand extends Command<RoleArchiveInput, ArchiveRoleResponse> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ArchiveRoleResponse;
}

/**
 * The input for the role get command
 */
interface RoleGetInput {
    /** The role id */
    roleId: string;
}
/**
 * Get a role by ID
 */
declare class RoleGetCommand extends Command<RoleGetInput, Role> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Role;
}

/**
 * The input for the role update command
 */
interface RoleUpdateInput {
    /** The role id */
    roleId: string;
    /** The organization id */
    organizationId: string;
    /** The name of the role */
    name: string;
    /** The description of the role */
    description?: string;
    /** Whether the role is managed by Flowcore */
    flowcoreManaged?: boolean;
}
/**
 * Update a role by ID
 */
declare class RoleUpdateCommand extends Command<RoleUpdateInput, Role> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): Role;
}

/**
 * Audit log entry type
 */
declare const AuditLogEntrySchema: TObject<{
    id: TString;
    event: TString;
    resourceName: TString;
    performedBy: TUnion<[TString, TObject<TProperties>, TNull]>;
    timestamp: TString;
    status: TString;
}>;
/**
 * Pagination information
 */
declare const PaginationSchema: TObject<{
    page: TNumber;
    pageSize: TNumber;
    totalItems: TNumber;
    totalPages: TNumber;
}>;
/**
 * Audit log response schema
 */
declare const AuditLogResponseSchema: TObject<{
    logs: TArray<typeof AuditLogEntrySchema>;
    pagination: typeof PaginationSchema;
}>;
/**
 * Audit log entry type
 */
type AuditLogEntry = Static<typeof AuditLogEntrySchema>;
/**
 * Pagination information
 */
type Pagination = Static<typeof PaginationSchema>;
/**
 * Audit log response type
 */
type AuditLogResponse = Static<typeof AuditLogResponseSchema>;
/**
 * The input for the tenant audit logs command
 */
interface TenantAuditLogsInput {
    /** The tenant id */
    tenantId: string;
    /** Page number (1-based) */
    page?: number;
    /** Page size */
    pageSize?: number;
    /** Filter by resource type */
    resourceType?: string;
    /** Filter by user who performed the action */
    performedBy?: string;
    /** Filter by status (success or failure) */
    status?: "success" | "failure";
    /** Filter by start date */
    startDate?: string;
    /** Filter by end date */
    endDate?: string;
}
/**
 * Fetch audit logs for a tenant
 */
declare class TenantAuditLogsCommand extends Command<TenantAuditLogsInput, AuditLogResponse> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): AuditLogResponse;
}

/**
 * The mode of validation
 */
type ValidationMode = "tenant" | "organization";
/**
 * The validation request access item
 */
interface ValidationRequestAccessItem {
    action: string;
    resource: string[];
}
/**
 * The schema for a valid policy
 */
declare const ValidPolicySchema: TObject<{
    policyFrn: TString;
    statementId: TString;
}>;
/**
 * The schema for a validation response
 */
declare const ValidationResponseSchema: TObject<{
    valid: TBoolean;
    checksum: TString;
    validPolicies: TArray<typeof ValidPolicySchema>;
}>;
/**
 * The valid policy type
 */
type ValidPolicy = Static<typeof ValidPolicySchema>;
/**
 * The validation response type
 */
type ValidationResponse = Static<typeof ValidationResponseSchema>;
/**
 * The input for the user validation command
 */
interface ValidateUserInput {
    /** The user id */
    userId: string;
    /** The mode of validation */
    mode: ValidationMode;
    /** The requested access */
    requestedAccess: ValidationRequestAccessItem[];
}
/**
 * Validate if a user can perform actions
 */
declare class ValidateUserCommand extends Command<ValidateUserInput, ValidationResponse> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ValidationResponse;
}

/**
 * The input for the key validation command
 */
interface ValidateKeyInput {
    /** The key id */
    keyId: string;
    /** The mode of validation */
    mode: ValidationMode;
    /** The requested access */
    requestedAccess: ValidationRequestAccessItem[];
}
/**
 * Validate if a key can perform actions
 */
declare class ValidateKeyCommand extends Command<ValidateKeyInput, ValidationResponse> {
    /**
     * Whether the command should retry on failure
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ValidationResponse;
}

interface EntitlementRequestAccessItem {
    action: string | string[];
    resource: string[];
}
declare const EntitlementResponseSchema: _sinclair_typebox.TObject<{
    valid: _sinclair_typebox.TLiteral<true>;
    requestChecksum: _sinclair_typebox.TString;
    entitlementChecksum: _sinclair_typebox.TString;
    cacheTtlSeconds: _sinclair_typebox.TNumber;
    entitlements: _sinclair_typebox.TArray<_sinclair_typebox.TObject<{
        requestIndex: _sinclair_typebox.TNumber;
        grants: _sinclair_typebox.TArray<_sinclair_typebox.TObject<{
            policyFrn: _sinclair_typebox.TString;
            statementId: _sinclair_typebox.TString;
            resource: _sinclair_typebox.TString;
            filters: _sinclair_typebox.TOptional<_sinclair_typebox.TArray<_sinclair_typebox.TUnion<[_sinclair_typebox.TObject<{
                path: _sinclair_typebox.TString;
                operator: _sinclair_typebox.TLiteral<"equals">;
                value: _sinclair_typebox.TUnion<[_sinclair_typebox.TString, _sinclair_typebox.TNumber, _sinclair_typebox.TBoolean, _sinclair_typebox.TNull]>;
            }>, _sinclair_typebox.TObject<{
                path: _sinclair_typebox.TString;
                operator: _sinclair_typebox.TLiteral<"oneOf">;
                values: _sinclair_typebox.TArray<_sinclair_typebox.TUnion<[_sinclair_typebox.TString, _sinclair_typebox.TNumber, _sinclair_typebox.TBoolean, _sinclair_typebox.TNull]>>;
            }>, _sinclair_typebox.TObject<{
                path: _sinclair_typebox.TString;
                operator: _sinclair_typebox.TLiteral<"exists">;
                value: _sinclair_typebox.TBoolean;
            }>]>>>;
        }>>;
    }>>;
}>;
type EntitlementResponse = Static<typeof EntitlementResponseSchema>;
declare function parseEntitlementResponse(rawResponse: unknown): EntitlementResponse;
interface ResolveUserEntitlementsInput {
    userId: string;
    mode: "tenant" | "organization";
    requestedAccess: EntitlementRequestAccessItem[];
}
declare class ResolveUserEntitlementsCommand extends Command<ResolveUserEntitlementsInput, EntitlementResponse> {
    protected retryOnFailure: boolean;
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): EntitlementResponse;
}

interface ResolveKeyEntitlementsInput {
    keyId: string;
    mode: "tenant" | "organization";
    requestedAccess: EntitlementRequestAccessItem[];
}
declare class ResolveKeyEntitlementsCommand extends Command<ResolveKeyEntitlementsInput, EntitlementResponse> {
    protected retryOnFailure: boolean;
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected getBody(): Record<string, unknown>;
    protected parseResponse(rawResponse: unknown): EntitlementResponse;
}

/**
 * Contracts for the Flowcore compute (container) service —
 * `https://compute.api.flowcore.io`.
 *
 * UPSTREAM SOURCE: transcribed BY HAND from the zod contracts in
 * `packages/contracts/src/compute/` of the `flowcore-io/flowcore-container-service`
 * repository, together with the `c.json(...)` calls in the route handlers
 * under `apps/compute-api/src/api/`, at `main` commit `d223298`
 * ("feat(registries): registry detail with synthesis status, and deletion
 * with in-cluster revocation (#39)").
 *
 * The revision-history and deployment-event types below were transcribed
 * later, from `compute/revisions.ts` and `compute/deployment-events.ts` plus
 * `workload-revisions.list.ts` and `workload-events.list.ts`, at `main` commit
 * `5c3858b` — the endpoints shipped in compute-api 1.11.0, after SDK 4.7.0
 * was cut.
 *
 * THERE IS NO GENERATOR AND NO DRIFT GUARD. Nothing in this repository fails
 * when the service changes its contracts, so a change upstream has to be
 * re-read into this file by hand against those two directories.
 *
 * TOLERANCE RULE, applied deliberately and uniformly: a field the upstream
 * zod schema declares with `.default(...)` is `Type.Optional` here, even
 * though the running service materializes it on every response (its
 * projections are `.parse()`d before they are serialized). `parseResponseHelper`
 * THROWS on an unexpected shape, so declaring such a field required would
 * turn every call against a deployment that predates the field into an
 * exception. Optional costs a consumer one `??`; required costs them an
 * outage. Fields the upstream schema declares required without a default are
 * required here.
 *
 * NO CREDENTIAL IS REPRESENTABLE IN ANY RESPONSE TYPE BELOW. The upstream
 * `RegistrySchema` deliberately has no `secret`, no `encryptedAuthToken` and
 * no `dockerconfigjson`; that omission is reproduced here on purpose and must
 * not be "fixed".
 */
type TStringRecord = TRecord<TString, TString>;
/**
 * The body of a compute endpoint that answers `204 No Content`
 * (domain detach, registry remove).
 *
 * `FlowcoreClient` substitutes `{ status: 204 }` for an empty body, so that
 * synthetic object — not `undefined` — is what reaches `parseResponse`.
 */
type TComputeNoContent = TObject<{
    status: TNumber;
}>;
declare const ComputeNoContentSchema: TComputeNoContent;
type ComputeNoContent = Static<typeof ComputeNoContentSchema>;
/** Lifecycle state of a workload. A paused workload reports `stopped`. */
type TComputeWorkloadStatus = TUnion<[
    TLiteral<"pending">,
    TLiteral<"running">,
    TLiteral<"stopped">,
    TLiteral<"failed">,
    TLiteral<"archived">
]>;
declare const ComputeWorkloadStatusSchema: TComputeWorkloadStatus;
type ComputeWorkloadStatus = Static<typeof ComputeWorkloadStatusSchema>;
/** What a workload IS — a long-running service, or a run-to-completion task. Immutable after create. */
type TComputeWorkloadKind = TUnion<[TLiteral<"service">, TLiteral<"job">]>;
declare const ComputeWorkloadKindSchema: TComputeWorkloadKind;
type ComputeWorkloadKind = Static<typeof ComputeWorkloadKindSchema>;
/** Standardized compute slot tiers. */
type TComputeSlotTier = TUnion<[
    TLiteral<"nano">,
    TLiteral<"micro">,
    TLiteral<"small">,
    TLiteral<"medium">,
    TLiteral<"large">
]>;
declare const ComputeSlotTierSchema: TComputeSlotTier;
type ComputeSlotTier = Static<typeof ComputeSlotTierSchema>;
/** Probe handler: HTTP GET. */
type TComputeProbeHttpGet = TObject<{
    path: TOptional<TString>;
    port: TNumber;
    headers: TOptional<TStringRecord>;
}>;
declare const ComputeProbeHttpGetSchema: TComputeProbeHttpGet;
type ComputeProbeHttpGet = Static<typeof ComputeProbeHttpGetSchema>;
/** Probe handler: TCP socket — the safe default handler. */
type TComputeProbeTcpSocket = TObject<{
    port: TNumber;
}>;
declare const ComputeProbeTcpSocketSchema: TComputeProbeTcpSocket;
type ComputeProbeTcpSocket = Static<typeof ComputeProbeTcpSocketSchema>;
/** Probe handler: exec. */
type TComputeProbeExec = TObject<{
    command: TArray<TString>;
}>;
declare const ComputeProbeExecSchema: TComputeProbeExec;
type ComputeProbeExec = Static<typeof ComputeProbeExecSchema>;
/**
 * One probe. Handler resolution order server-side is `httpGet`, then `exec`,
 * then `tcpSocket`; with none given the fallback is a TCP dial of the
 * workload's container port.
 */
type TComputeProbe = TObject<{
    httpGet: TOptional<TComputeProbeHttpGet>;
    tcpSocket: TOptional<TComputeProbeTcpSocket>;
    exec: TOptional<TComputeProbeExec>;
    initialDelaySeconds: TOptional<TNumber>;
    periodSeconds: TOptional<TNumber>;
    timeoutSeconds: TOptional<TNumber>;
    failureThreshold: TOptional<TNumber>;
}>;
declare const ComputeProbeSchema: TComputeProbe;
type ComputeProbe = Static<typeof ComputeProbeSchema>;
/** The tri-probe specification of a workload. */
type TComputeWorkloadProbes = TObject<{
    startup: TOptional<TComputeProbe>;
    readiness: TOptional<TComputeProbe>;
    liveness: TOptional<TComputeProbe>;
}>;
declare const ComputeWorkloadProbesSchema: TComputeWorkloadProbes;
type ComputeWorkloadProbes = Static<typeof ComputeWorkloadProbesSchema>;
/** The pre-sync hook — a Job that must exit 0 before any pod is created. */
type TComputePreSyncSpec = TObject<{
    name: TOptional<TString>;
    image: TString;
    command: TArray<TString>;
    timeoutSeconds: TOptional<TNumber>;
}>;
declare const ComputePreSyncSpecSchema: TComputePreSyncSpec;
type ComputePreSyncSpec = Static<typeof ComputePreSyncSpecSchema>;
/**
 * How the replica count is decided. `manual` — the definition's `replicas` is
 * the count. `hpa` — a HorizontalPodAutoscaler owns it between
 * `minReplicas` and `maxReplicas`.
 */
type TComputeWorkloadScalingMode = TUnion<[TLiteral<"manual">, TLiteral<"hpa">]>;
declare const ComputeWorkloadScalingModeSchema: TComputeWorkloadScalingMode;
type ComputeWorkloadScalingMode = Static<typeof ComputeWorkloadScalingModeSchema>;
/**
 * The scaling block of a workload definition.
 *
 * Every bound is optional at the schema level and required by mode instead:
 * `minReplicas`/`maxReplicas` are meaningless under `manual` and mandatory
 * under `hpa`. The service enforces the mode-dependent rules and answers 422.
 */
type TComputeWorkloadScaling = TObject<{
    mode: TOptional<TComputeWorkloadScalingMode>;
    minReplicas: TOptional<TNumber>;
    maxReplicas: TOptional<TNumber>;
    targetCpuPercent: TOptional<TNumber>;
    targetMemoryPercent: TOptional<TNumber>;
}>;
declare const ComputeWorkloadScalingSchema: TComputeWorkloadScaling;
type ComputeWorkloadScaling = Static<typeof ComputeWorkloadScalingSchema>;
/** One plain environment variable on a workload's container. */
type TComputeWorkloadEnvVar = TObject<{
    name: TString;
    value: TString;
}>;
declare const ComputeWorkloadEnvVarSchema: TComputeWorkloadEnvVar;
type ComputeWorkloadEnvVar = Static<typeof ComputeWorkloadEnvVarSchema>;
/**
 * One environment variable bound to a key in the tenant's ORGANIZATION
 * SECRETS.
 *
 * There is no value field, deliberately. The compute API cannot read an
 * organization secret and never receives one: only the key name travels, and
 * the value is bound inside the cluster from the organization secret store.
 */
type TComputeWorkloadSecretRef = TObject<{
    name: TString;
    secretKey: TString;
}>;
declare const ComputeWorkloadSecretRefSchema: TComputeWorkloadSecretRef;
type ComputeWorkloadSecretRef = Static<typeof ComputeWorkloadSecretRefSchema>;
/**
 * One persistent volume of a workload definition.
 *
 * The claim is ReadWriteOnce on the cluster's DEFAULT StorageClass — there
 * is deliberately no class field, and provisioned `sizeGi` is the only
 * billing dimension. A workload with volumes must run at most one replica
 * under `scaling.mode: "manual"` (the service answers 422 otherwise), and
 * `sizeGi` only ever GROWS: an update or rollback that would shrink a
 * volume is refused, and volumes cannot be added, removed, renamed or
 * remounted after create. Workload DELETE destroys the claims and their
 * data.
 */
type TComputeWorkloadVolume = TObject<{
    name: TString;
    sizeGi: TNumber;
    mountPath: TString;
}>;
declare const ComputeWorkloadVolumeSchema: TComputeWorkloadVolume;
type ComputeWorkloadVolume = Static<typeof ComputeWorkloadVolumeSchema>;
/** Everything the reconciler needs to build a Deployment, a Service and a pre-sync Job. */
type TComputeWorkloadDefinition = TObject<{
    image: TString;
    slotTier: TComputeSlotTier;
    kind: TOptional<TComputeWorkloadKind>;
    replicas: TOptional<TNumber>;
    port: TOptional<TNumber>;
    probes: TOptional<TComputeWorkloadProbes>;
    preSync: TOptional<TComputePreSyncSpec>;
    scaling: TOptional<TComputeWorkloadScaling>;
    env: TOptional<TArray<TComputeWorkloadEnvVar>>;
    secrets: TOptional<TArray<TComputeWorkloadSecretRef>>;
    volumes: TOptional<TArray<TComputeWorkloadVolume>>;
}>;
declare const ComputeWorkloadDefinitionSchema: TComputeWorkloadDefinition;
type ComputeWorkloadDefinition = Static<typeof ComputeWorkloadDefinitionSchema>;
/**
 * A container workload, as served by the API.
 *
 * `definition` is optional: a row written before the definition columns
 * existed carries none of them. `activeRevision` advances only when the
 * reconciler reports the mutation's operation succeeded — never at request
 * time — so a failed pre-sync leaves it pointing at what is still serving.
 */
type TComputeWorkload = TObject<{
    id: TString;
    tenantId: TString;
    name: TString;
    status: TComputeWorkloadStatus;
    readyReplicas: TNumber;
    reason: TOptional<TString>;
    definition: TOptional<TComputeWorkloadDefinition>;
    activeRevision: TOptional<TNumber>;
    rolledBackFrom: TOptional<TNumber>;
    paused: TOptional<TBoolean>;
    createdAt: TString;
    updatedAt: TString;
}>;
declare const ComputeWorkloadSchema: TComputeWorkload;
type ComputeWorkload = Static<typeof ComputeWorkloadSchema>;
/** What produced one recorded execution. */
type TComputeWorkloadRunKind = TUnion<[TLiteral<"batch">, TLiteral<"pre_sync">]>;
declare const ComputeWorkloadRunKindSchema: TComputeWorkloadRunKind;
type ComputeWorkloadRunKind = Static<typeof ComputeWorkloadRunKindSchema>;
/** The lifecycle of one execution. A run whose poll window closes is `failed`. */
type TComputeWorkloadRunStatus = TUnion<[TLiteral<"running">, TLiteral<"succeeded">, TLiteral<"failed">]>;
declare const ComputeWorkloadRunStatusSchema: TComputeWorkloadRunStatus;
type ComputeWorkloadRunStatus = Static<typeof ComputeWorkloadRunStatusSchema>;
/** One recorded execution — an on-demand batch run, or a pre-sync hook. */
type TComputeWorkloadRun = TObject<{
    id: TString;
    workloadId: TString;
    tenantId: TString;
    kind: TComputeWorkloadRunKind;
    name: TString;
    status: TComputeWorkloadRunStatus;
    reason: TOptional<TString>;
    operationId: TOptional<TString>;
    startedAt: TString;
    completedAt: TOptional<TString>;
}>;
declare const ComputeWorkloadRunSchema: TComputeWorkloadRun;
type ComputeWorkloadRun = Static<typeof ComputeWorkloadRunSchema>;
/**
 * A page of run history, newest first. BARE — this endpoint does not use the
 * `{ success: true, ... }` envelope.
 */
type TComputeWorkloadRunList = TObject<{
    runs: TArray<TComputeWorkloadRun>;
    nextCursor: TOptional<TString>;
}>;
declare const ComputeWorkloadRunListSchema: TComputeWorkloadRunList;
type ComputeWorkloadRunList = Static<typeof ComputeWorkloadRunListSchema>;
/** `GET /api/v1/workloads` */
type TComputeWorkloadListResponse = TObject<{
    success: TLiteral<true>;
    workloads: TArray<TComputeWorkload>;
}>;
declare const ComputeWorkloadListResponseSchema: TComputeWorkloadListResponse;
type ComputeWorkloadListResponse = Static<typeof ComputeWorkloadListResponseSchema>;
/** `GET /api/v1/workloads/{workloadId}` and the legacy create command. */
type TComputeWorkloadResponse = TObject<{
    success: TLiteral<true>;
    workload: TComputeWorkload;
}>;
declare const ComputeWorkloadResponseSchema: TComputeWorkloadResponse;
type ComputeWorkloadResponse = Static<typeof ComputeWorkloadResponseSchema>;
/** `POST /api/v1/workloads`, including the cluster-convergence operation. */
type TComputeWorkloadCreateResponse = TObject<{
    success: TLiteral<true>;
    workload: TComputeWorkload;
    operationId: TString;
}>;
declare const ComputeWorkloadCreateResponseSchema: TComputeWorkloadCreateResponse;
type ComputeWorkloadCreateResponse = Static<typeof ComputeWorkloadCreateResponseSchema>;
/** The 202 of PATCH, rollback, pause and resume. */
type TComputeWorkloadMutationResponse = TObject<{
    success: TLiteral<true>;
    workload: TComputeWorkload;
    operationId: TString;
}>;
declare const ComputeWorkloadMutationResponseSchema: TComputeWorkloadMutationResponse;
type ComputeWorkloadMutationResponse = Static<typeof ComputeWorkloadMutationResponseSchema>;
/** The 202 of `DELETE /api/v1/workloads/{workloadId}` — no workload body. */
type TComputeWorkloadDeleteResponse = TObject<{
    success: TLiteral<true>;
    operationId: TString;
}>;
declare const ComputeWorkloadDeleteResponseSchema: TComputeWorkloadDeleteResponse;
type ComputeWorkloadDeleteResponse = Static<typeof ComputeWorkloadDeleteResponseSchema>;
/** The 202 of `POST /api/v1/workloads/{workloadId}/run`. */
type TComputeWorkloadRunResponse = TObject<{
    success: TLiteral<true>;
    run: TComputeWorkloadRun;
    runId: TString;
    operationId: TString;
}>;
declare const ComputeWorkloadRunResponseSchema: TComputeWorkloadRunResponse;
type ComputeWorkloadRunResponse = Static<typeof ComputeWorkloadRunResponseSchema>;
/** Which pipe the line came out of. */
type TComputeLogStreamName = TUnion<[TLiteral<"stdout">, TLiteral<"stderr">]>;
declare const ComputeLogStreamNameSchema: TComputeLogStreamName;
type ComputeLogStreamName = Static<typeof ComputeLogStreamNameSchema>;
/** One indexed log line. */
type TComputeLogEntry = TObject<{
    timestamp: TString;
    podName: TString;
    container: TString;
    level: TString;
    message: TString;
    stream: TComputeLogStreamName;
}>;
declare const ComputeLogEntrySchema: TComputeLogEntry;
type ComputeLogEntry = Static<typeof ComputeLogEntrySchema>;
/** Historical log response. BARE — no `{ success: true }` envelope. */
type TComputeWorkloadLogs = TObject<{
    workloadId: TString;
    container: TUnion<[TString, TNull]>;
    totalMatches: TNumber;
    logs: TArray<TComputeLogEntry>;
}>;
declare const ComputeWorkloadLogsSchema: TComputeWorkloadLogs;
type ComputeWorkloadLogs = Static<typeof ComputeWorkloadLogsSchema>;
/**
 * The `data:` payload of one `event: log` frame on the LIVE SSE stream
 * (`GET /api/v1/workloads/{workloadId}/logs/stream`).
 *
 * Deliberately NOT unified with `ComputeLogEntry`: the service names the
 * fields differently on the two surfaces (`pod`/`line` here, `podName`/
 * `message` on the indexed one), and collapsing them would rename a
 * documented wire field. Heartbeat frames (`event: heartbeat`) carry a bare
 * ISO-8601 string, not this shape, and are never surfaced as log events.
 */
type TComputeLogStreamEvent = TObject<{
    timestamp: TString;
    pod: TString;
    container: TString;
    line: TString;
}>;
declare const ComputeLogStreamEventSchema: TComputeLogStreamEvent;
type ComputeLogStreamEvent = Static<typeof ComputeLogStreamEventSchema>;
/** Lifecycle state of a domain binding. */
type TComputeDomainStatus = TUnion<[
    TLiteral<"pending_verification">,
    TLiteral<"ready">,
    TLiteral<"failed">,
    TLiteral<"detached">
]>;
declare const ComputeDomainStatusSchema: TComputeDomainStatus;
type ComputeDomainStatus = Static<typeof ComputeDomainStatusSchema>;
/** How ownership of the hostname is established. */
type TComputeDomainVerificationType = TUnion<[TLiteral<"cname">, TLiteral<"platform_wildcard">]>;
declare const ComputeDomainVerificationTypeSchema: TComputeDomainVerificationType;
type ComputeDomainVerificationType = Static<typeof ComputeDomainVerificationTypeSchema>;
/** DNS ownership block. */
type TComputeDomainVerification = TObject<{
    type: TComputeDomainVerificationType;
    expectedTarget: TString;
    verified: TBoolean;
}>;
declare const ComputeDomainVerificationSchema: TComputeDomainVerification;
type ComputeDomainVerification = Static<typeof ComputeDomainVerificationSchema>;
/** Certificate state, as OBSERVED from cert-manager. Never a request to issue. */
type TComputeDomainTlsStatus = TUnion<[TLiteral<"pending_issuance">, TLiteral<"issued">, TLiteral<"failed">]>;
declare const ComputeDomainTlsStatusSchema: TComputeDomainTlsStatus;
type ComputeDomainTlsStatus = Static<typeof ComputeDomainTlsStatusSchema>;
/** TLS block. `issuer` and `expiresAt` are omitted until cert-manager reports them. */
type TComputeDomainTls = TObject<{
    status: TComputeDomainTlsStatus;
    secretName: TString;
    issuer: TOptional<TString>;
    expiresAt: TOptional<TString>;
}>;
declare const ComputeDomainTlsSchema: TComputeDomainTls;
type ComputeDomainTls = Static<typeof ComputeDomainTlsSchema>;
/** A domain binding, as served by attach and list. */
type TComputeDomain = TObject<{
    domainId: TString;
    workloadId: TString;
    hostname: TString;
    targetPort: TNumber;
    status: TComputeDomainStatus;
    verification: TComputeDomainVerification;
    tls: TComputeDomainTls;
    createdAt: TString;
}>;
declare const ComputeDomainSchema: TComputeDomain;
type ComputeDomain = Static<typeof ComputeDomainSchema>;
/** `GET /api/v1/workloads/{workloadId}/domains` — live bindings, oldest first. */
type TComputeDomainListResponse = TObject<{
    success: TLiteral<true>;
    domains: TArray<TComputeDomain>;
}>;
declare const ComputeDomainListResponseSchema: TComputeDomainListResponse;
type ComputeDomainListResponse = Static<typeof ComputeDomainListResponseSchema>;
/**
 * The verify response — deliberately NARROWER than `ComputeDomainSchema`:
 * verify reports what was just observed, it does not restate the binding.
 * BARE — no `{ success: true }` envelope.
 */
type TComputeDomainVerifyResponse = TObject<{
    domainId: TString;
    hostname: TString;
    status: TComputeDomainStatus;
    verification: TComputeDomainVerification;
    tls: TComputeDomainTls;
}>;
declare const ComputeDomainVerifyResponseSchema: TComputeDomainVerifyResponse;
type ComputeDomainVerifyResponse = Static<typeof ComputeDomainVerifyResponseSchema>;
/** What kind of asynchronous mutation an operation tracks. */
type TComputeOperationType = TUnion<[
    TLiteral<"workload.deploy">,
    TLiteral<"workload.update">,
    TLiteral<"workload.rollback">,
    TLiteral<"workload.archive">,
    TLiteral<"workload.pause">,
    TLiteral<"workload.resume">,
    TLiteral<"workload.run">
]>;
declare const ComputeOperationTypeSchema: TComputeOperationType;
type ComputeOperationType = Static<typeof ComputeOperationTypeSchema>;
/** Terminal states are `succeeded` and `failed`. */
type TComputeOperationStatus = TUnion<[
    TLiteral<"pending">,
    TLiteral<"in_progress">,
    TLiteral<"succeeded">,
    TLiteral<"failed">
]>;
declare const ComputeOperationStatusSchema: TComputeOperationStatus;
type ComputeOperationStatus = Static<typeof ComputeOperationStatusSchema>;
/** Where in the mutation the reconciler currently is. */
type TComputeOperationPhase = TUnion<[
    TLiteral<"queued">,
    TLiteral<"pre_sync_running">,
    TLiteral<"pre_sync_failed">,
    TLiteral<"deploying">,
    TLiteral<"rolling_out">,
    TLiteral<"tearing_down">,
    TLiteral<"pausing">,
    TLiteral<"resuming">,
    TLiteral<"running">,
    TLiteral<"completed">,
    TLiteral<"failed">
]>;
declare const ComputeOperationPhaseSchema: TComputeOperationPhase;
type ComputeOperationPhase = Static<typeof ComputeOperationPhaseSchema>;
/** The state of one step of an operation. */
type TComputeOperationStepStatus = TUnion<[
    TLiteral<"pending">,
    TLiteral<"running">,
    TLiteral<"succeeded">,
    TLiteral<"failed">
]>;
declare const ComputeOperationStepStatusSchema: TComputeOperationStepStatus;
type ComputeOperationStepStatus = Static<typeof ComputeOperationStepStatusSchema>;
/** The pre-sync job attached to a deploy. */
type TComputeOperationPreSyncProgress = TObject<{
    name: TString;
    status: TComputeOperationStepStatus;
    startedAt: TOptional<TString>;
    completedAt: TOptional<TString>;
}>;
declare const ComputeOperationPreSyncProgressSchema: TComputeOperationPreSyncProgress;
type ComputeOperationPreSyncProgress = Static<typeof ComputeOperationPreSyncProgressSchema>;
/** Rolling-deployment replica counters. */
type TComputeOperationDeploymentProgress = TObject<{
    desiredReplicas: TNumber;
    updatedReplicas: TNumber;
    readyReplicas: TNumber;
}>;
declare const ComputeOperationDeploymentProgressSchema: TComputeOperationDeploymentProgress;
type ComputeOperationDeploymentProgress = Static<typeof ComputeOperationDeploymentProgressSchema>;
/** Progress detail of an operation. */
type TComputeOperationProgress = TObject<{
    preSync: TOptional<TComputeOperationPreSyncProgress>;
    deployment: TOptional<TComputeOperationDeploymentProgress>;
}>;
declare const ComputeOperationProgressSchema: TComputeOperationProgress;
type ComputeOperationProgress = Static<typeof ComputeOperationProgressSchema>;
/** An operation, as served by `GET /api/v1/operations/{operationId}`. BARE — no envelope. */
type TComputeOperation = TObject<{
    operationId: TString;
    workloadId: TString;
    type: TComputeOperationType;
    status: TComputeOperationStatus;
    phase: TComputeOperationPhase;
    progress: TComputeOperationProgress;
    reason: TOptional<TString>;
    createdAt: TString;
    updatedAt: TString;
}>;
declare const ComputeOperationSchema: TComputeOperation;
type ComputeOperation = Static<typeof ComputeOperationSchema>;
/** Why a revision exists. */
type TComputeWorkloadRevisionCause = TUnion<[TLiteral<"created">, TLiteral<"update">, TLiteral<"rollback">]>;
declare const ComputeWorkloadRevisionCauseSchema: TComputeWorkloadRevisionCause;
type ComputeWorkloadRevisionCause = Static<typeof ComputeWorkloadRevisionCauseSchema>;
/**
 * One recorded revision of a workload's definition.
 *
 * `outcome` IS OPTIONAL, AND THAT IS THE CONTRACT — not a tolerance. Upstream
 * reports it at three levels of knowledge:
 *
 *   - the joined operation's status, when there is an operation row;
 *   - `pending`, when the revision names an operation whose row has not
 *     arrived yet;
 *   - ABSENT, when the revision names no operation at all.
 *
 * The third case covers historical `created` revisions written before create
 * operations were API-minted. Declaring `outcome` required here would make
 * `parseResponseHelper` throw while reading those replayed rows.
 *
 * `slotTier` is absent on a row recorded before slot tiers were part of the
 * definition contract — omitted rather than invented, upstream and here.
 */
type TComputeWorkloadRevision = TObject<{
    revision: TNumber;
    image: TString;
    slotTier: TOptional<TComputeSlotTier>;
    cause: TComputeWorkloadRevisionCause;
    isActive: TBoolean;
    rolledBackFrom: TOptional<TNumber>;
    operationId: TOptional<TString>;
    outcome: TOptional<TComputeOperationStatus>;
    outcomeReason: TOptional<TString>;
    createdAt: TString;
}>;
declare const ComputeWorkloadRevisionSchema: TComputeWorkloadRevision;
type ComputeWorkloadRevision = Static<typeof ComputeWorkloadRevisionSchema>;
/**
 * A page of revision history, NEWEST ORDINAL FIRST. BARE — this endpoint does
 * not use the `{ success: true, ... }` envelope.
 */
type TComputeWorkloadRevisionList = TObject<{
    revisions: TArray<TComputeWorkloadRevision>;
    nextCursor: TOptional<TString>;
}>;
declare const ComputeWorkloadRevisionListSchema: TComputeWorkloadRevisionList;
type ComputeWorkloadRevisionList = Static<typeof ComputeWorkloadRevisionListSchema>;
/** The object an event is about — a Deployment, ReplicaSet, Pod, Service, HPA or Job. */
type TComputeDeploymentEventObject = TObject<{
    kind: TString;
    name: TString;
}>;
declare const ComputeDeploymentEventObjectSchema: TComputeDeploymentEventObject;
type ComputeDeploymentEventObject = Static<typeof ComputeDeploymentEventObjectSchema>;
/**
 * One cluster event, normalized across BOTH Kubernetes API groups.
 *
 * `type` is a plain string and NOT an enum: Kubernetes documents `Normal` and
 * `Warning`, but the field is free-form on the wire and a narrower contract
 * here would reject a value the cluster is entitled to send.
 *
 * `firstSeen` and `lastSeen` are optional because an event is entitled to
 * carry neither — the modern group's series fields are absent on a
 * single-occurrence event.
 */
type TComputeDeploymentEvent = TObject<{
    name: TString;
    type: TString;
    reason: TString;
    message: TString;
    count: TNumber;
    object: TComputeDeploymentEventObject;
    source: TOptional<TString>;
    firstSeen: TOptional<TString>;
    lastSeen: TOptional<TString>;
}>;
declare const ComputeDeploymentEventSchema: TComputeDeploymentEvent;
type ComputeDeploymentEvent = Static<typeof ComputeDeploymentEventSchema>;
/**
 * The workload's recent cluster events, most recently seen first. BARE — no
 * `{ success: true, ... }` envelope, and UNPAGINATED by construction.
 *
 * AN EMPTY ARRAY IS A LEGITIMATE ANSWER, never an error: a workload the
 * cluster has had nothing to say about — or nothing within the TTL — answers
 * 200 with `events: []`.
 */
type TComputeWorkloadDeploymentEvents = TObject<{
    workloadId: TString;
    events: TArray<TComputeDeploymentEvent>;
}>;
declare const ComputeWorkloadDeploymentEventsSchema: TComputeWorkloadDeploymentEvents;
type ComputeWorkloadDeploymentEvents = Static<typeof ComputeWorkloadDeploymentEventsSchema>;
/**
 * A registry, sanitized.
 *
 * THERE IS NO `secret` FIELD AND THERE MUST NEVER BE ONE. The upstream
 * contract has no credential-bearing field of any kind — plaintext,
 * ciphertext or encoded — and the service's routes cannot return one. A
 * credential is write-only and rotation-only.
 */
type TComputeRegistry = TObject<{
    registryId: TString;
    name: TString;
    serverUrl: TString;
    username: TString;
    isDefault: TBoolean;
    createdAt: TString;
    updatedAt: TString;
}>;
declare const ComputeRegistrySchema: TComputeRegistry;
type ComputeRegistry = Static<typeof ComputeRegistrySchema>;
/**
 * Whether the credential became a working in-cluster pull Secret.
 *
 * Three values where the EVENT enum has two: `pending` is the projection's
 * NULL — no report from the reconciler has arrived yet.
 */
type TComputeRegistrySynthesisState = TUnion<[TLiteral<"pending">, TLiteral<"synthesized">, TLiteral<"failed">]>;
declare const ComputeRegistrySynthesisStateSchema: TComputeRegistrySynthesisState;
type ComputeRegistrySynthesisState = Static<typeof ComputeRegistrySynthesisStateSchema>;
/** The single-registry read: the sanitized registry plus its synthesis state. */
type TComputeRegistryDetail = TObject<{
    registryId: TString;
    name: TString;
    serverUrl: TString;
    username: TString;
    isDefault: TBoolean;
    createdAt: TString;
    updatedAt: TString;
    synthesisStatus: TComputeRegistrySynthesisState;
    synthesisReason: TOptional<TString>;
    synthesisAt: TOptional<TString>;
}>;
declare const ComputeRegistryDetailSchema: TComputeRegistryDetail;
type ComputeRegistryDetail = Static<typeof ComputeRegistryDetailSchema>;
/** `GET /api/v1/registries` */
type TComputeRegistryListResponse = TObject<{
    success: TLiteral<true>;
    registries: TArray<TComputeRegistry>;
}>;
declare const ComputeRegistryListResponseSchema: TComputeRegistryListResponse;
type ComputeRegistryListResponse = Static<typeof ComputeRegistryListResponseSchema>;
/** `GET /api/v1/registries/{registryId}` */
type TComputeRegistryDetailResponse = TObject<{
    success: TLiteral<true>;
    registry: TComputeRegistryDetail;
}>;
declare const ComputeRegistryDetailResponseSchema: TComputeRegistryDetailResponse;
type ComputeRegistryDetailResponse = Static<typeof ComputeRegistryDetailResponseSchema>;

/**
 * The TLS request block on an attach for a custom hostname.
 */
interface ComputeDomainAttachTls {
    /** Only ACME/Let's Encrypt via cert-manager exists */
    mode: "letsencrypt";
    /** The cert-manager ClusterIssuer (defaults to `letsencrypt-prod` server-side) */
    clusterIssuer?: string;
}
/**
 * Attach a hostname the TENANT owns, proved with a CNAME.
 */
interface ComputeDomainAttachCustomInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** A lowercase fully qualified hostname, e.g. `api.acme.org`. Uppercase is REJECTED, not folded */
    hostname: string;
    /** The container port the ingress routes to */
    targetPort: number;
    /** Certificate issuance options */
    tls?: ComputeDomainAttachTls;
    /** Never set alongside `hostname` — the two branches are an XOR */
    subdomain?: never;
}
/**
 * Attach a single label under the PLATFORM's wildcard zone.
 *
 * TENANT-SCOPED MINT: the served hostname is
 * `<subdomain>-<tenantSlug>.<zone>` — the platform resolves the tenant's
 * slug at attach time and suffixes it, so two tenants asking for the same
 * subdomain never clash. The service answers 422 for a reserved subdomain
 * (`www`, `flowcore`, `usable`), for a scoped label over 63 bytes and for
 * an unresolvable tenant slug, and 409 when the tenant's active wildcard
 * cap is reached. Bindings minted before scoping keep their stored
 * hostnames.
 */
interface ComputeDomainAttachWildcardInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** A single lowercase DNS label — no dots, which would reach outside the platform zone */
    subdomain: string;
    /** The container port the ingress routes to */
    targetPort: number;
    /** Never set alongside `subdomain` — the two branches are an XOR */
    hostname?: never;
    /** Never set for a wildcard subdomain — the platform's wildcard certificate already exists */
    tls?: never;
}
/**
 * The input for the compute domain attach command — custom hostname XOR
 * platform wildcard subdomain.
 */
type ComputeDomainAttachInput = ComputeDomainAttachCustomInput | ComputeDomainAttachWildcardInput;
/**
 * Attach a custom domain or a platform wildcard subdomain to a workload.
 *
 * TWO SUCCESS CODES, both from an awaited write and both carrying the same
 * BARE domain object (no `{ success: true }` envelope):
 * - 201 for a wildcard subdomain — the platform owns the zone and the
 *   wildcard certificate already exists, so the binding is ready on return;
 * - 202 for a custom hostname — the caller still has to publish the CNAME and
 *   cert-manager still has to issue.
 *
 * THERE IS NO `operationId` HERE, so this command has no `waitForOperation`.
 * A custom hostname is followed up with `ComputeDomainVerifyCommand`, which is
 * the surface that performs the live DNS and certificate check.
 *
 * Answers 409 when the hostname is already on a live binding, or when the
 * workload is of kind `job` and has no Service to route to.
 */
declare class ComputeDomainAttachCommand extends Command<ComputeDomainAttachInput, ComputeDomain> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE: an attach mints a domain id, and a second attach of the same
     * hostname answers 409 — a retry of an already-recorded request would
     * surface that conflict as the caller's answer.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request.
     *
     * OVERRIDDEN BECAUSE BOTH BRANCHES OF THE UPSTREAM BODY ARE `.strict()` —
     * that is exactly what makes the union a real XOR. The base implementation
     * would send `workloadId` (a path parameter) inside the JSON, which matches
     * NEITHER branch, so every call would be 422.
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeDomain;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute domain detach command
 */
interface ComputeDomainDetachInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** The domain binding id (full UUID) */
    domainId: string;
}
/**
 * Detach a domain from a workload.
 *
 * Answers `204 No Content`. The service awaits its own write before
 * responding, so on return the hostname is already attachable again; the
 * in-cluster reconciler removes the Ingress rule and Certificate
 * asynchronously. The projection row is MARKED detached, never deleted.
 *
 * `FlowcoreClient` substitutes `{ status: 204 }` for the empty body, and that
 * synthetic object is what this command returns.
 */
declare class ComputeDomainDetachCommand extends Command<ComputeDomainDetachInput, ComputeNoContent> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request. The route takes NO body.
     */
    protected getBody(): undefined;
    /**
     * Parse the response.
     *
     * The endpoint answers 204 with an EMPTY body, which `FlowcoreClient` turns
     * into `{ status: 204 }` before it reaches here — so this schema describes
     * that synthetic object, not anything the service serialized.
     */
    protected parseResponse(rawResponse: unknown): ComputeNoContent;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute domain list command
 */
interface ComputeDomainListInput {
    /** The workload id (full UUID) */
    workloadId: string;
}
/**
 * List the domains attached to a workload, oldest first.
 *
 * LIVE bindings only — a detached binding leaves the list rather than being
 * hidden behind a flag — and served entirely from the projection: this
 * endpoint performs no DNS lookup and reads no cluster state. Use
 * `ComputeDomainVerifyCommand` for a fresh observation. A workload with no
 * domains answers 200 with an empty array.
 *
 * Response envelope: `{ success: true, domains: [...] }`, unwrapped here.
 */
declare class ComputeDomainListCommand extends Command<ComputeDomainListInput, ComputeDomain[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeDomain[];
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute domain verify command
 */
interface ComputeDomainVerifyInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** The domain binding id (full UUID) */
    domainId: string;
}
/**
 * Verify DNS ownership and read the TLS certificate state.
 *
 * Resolves the domain's CNAME and reads the cert-manager Certificate
 * READ-ONLY. This endpoint never issues a certificate and never mutates any
 * Kubernetes resource.
 *
 * EVERY OBSERVED OUTCOME IS A 200, including the unhappy ones: a missing or
 * mismatched CNAME is `verification.verified: false`, a certificate that is
 * not ready yet is `tls.status: "pending_issuance"`, a failed issuance is
 * `tls.status: "failed"`. Only a broken upstream changes the status code —
 * 503 when DNS or the Kubernetes API is unreachable, 502 when either answers
 * badly.
 *
 * The response is a BARE object, deliberately NARROWER than the domain object
 * that attach and list return: verify reports what was just observed, it does
 * not restate the binding.
 */
declare class ComputeDomainVerifyCommand extends Command<ComputeDomainVerifyInput, ComputeDomainVerifyResponse> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request. The route takes NO body.
     */
    protected getBody(): undefined;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeDomainVerifyResponse;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute operation fetch command
 */
interface ComputeOperationFetchInput {
    /** The operation id (full UUID) */
    operationId: string;
}
/**
 * Inspect an asynchronous workload mutation operation.
 *
 * The compute service answers 404 until the in-cluster reconciler files its
 * FIRST progress report for the operation — the API mints the id and emits
 * the event, but it holds no Kubernetes credentials and never seeds an
 * operation row. A 404 shortly after a 202 therefore means "not yet", not
 * "gone"; see `waitForComputeOperation`, which treats it that way.
 *
 * The response is a BARE operation object — this endpoint uses no
 * `{ success: true, ... }` envelope.
 */
declare class ComputeOperationFetchCommand extends Command<ComputeOperationFetchInput, ComputeOperation> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeOperation;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute registry fetch command
 */
interface ComputeRegistryFetchInput {
    /** The registry id (full UUID) */
    registryId: string;
}
/**
 * Inspect a single registry, with whether its credential really reached the
 * tenant's namespace.
 *
 * `synthesisStatus` is what the RECONCILER reported and nothing else: this
 * route never probes the registry, never opens a credential and makes no
 * outbound call. `pending` means no report has arrived yet.
 *
 * A REMOVED registry answers 404, not 410 — indistinguishable from an unknown
 * one, which is the same non-disclosure property the 404-on-denial collapse
 * gives.
 *
 * Response envelope: `{ success: true, registry: {...} }`, unwrapped here —
 * note that register and rotate return the registry BARE instead.
 */
declare class ComputeRegistryFetchCommand extends Command<ComputeRegistryFetchInput, ComputeRegistryDetail> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeRegistryDetail;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute registry list command
 */
interface ComputeRegistryListInput {
    /** The tenant id (full UUID) */
    tenantId: string;
}
/**
 * List a tenant's configured container image registries, sanitized.
 *
 * NO CREDENTIAL IS RETURNED, and none can be: the registry type has no
 * `secret`, no encrypted token and no `dockerconfigjson` field. Credentials
 * are write-only and rotation-only. A tenant with no registries answers 200
 * with an empty array.
 *
 * Response envelope: `{ success: true, registries: [...] }`, unwrapped here.
 */
declare class ComputeRegistryListCommand extends Command<ComputeRegistryListInput, ComputeRegistry[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeRegistry[];
}

/**
 * The input for the compute registry register command
 */
interface ComputeRegistryRegisterInput {
    /** The tenant id (full UUID) — carried in the BODY, not the path */
    tenantId: string;
    /** Human label for the registry entry */
    name: string;
    /**
     * The registry host as a container runtime addresses it, e.g. `ghcr.io` or
     * `registry.internal:5000`. A SCHEME IS REJECTED rather than stripped, and
     * so is uppercase — normalization is the caller's decision to make.
     */
    serverUrl: string;
    /** The robot account the pull credential belongs to */
    username: string;
    /**
     * The pull secret — a PAT, registry password or service principal secret,
     * 8..4096 characters.
     *
     * WRITE-ONLY. It is sealed before it reaches the event payload and no
     * endpoint on the service can read it back; rotation replaces it. It never
     * appears in any response type in this SDK.
     */
    secret: string;
    /** Make this the tenant's default registry (defaults to false) */
    isDefault?: boolean;
}
/**
 * Register container image registry credentials.
 *
 * Answers 201 with the registry READ BACK from the projection — SANITIZED,
 * with no credential field of any kind. The service contacts no registry and
 * creates no Kubernetes Secret; the in-cluster reconciler synthesizes the pull
 * Secret asynchronously, and `ComputeRegistryFetchCommand` reports whether it
 * succeeded.
 *
 * Answers 409 when a registry for the same `serverUrl` is already configured
 * for the tenant.
 *
 * The body is `.strict()` upstream, but NO `getBody()` override is needed
 * here: this route carries its tenancy in the body, so the command's input
 * and the request body are the same object — there is no path parameter to
 * strip.
 *
 * The response body is BARE, with no `{ success: true }` envelope — unlike
 * the registry LIST and the registry DETAIL reads, which both use one.
 */
declare class ComputeRegistryRegisterCommand extends Command<ComputeRegistryRegisterInput, ComputeRegistry> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE: a registration mints a registry id, and a second registration of
     * the same `serverUrl` answers 409 — a retry of an already-recorded request
     * would surface that conflict as the caller's answer.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeRegistry;
}

/**
 * The input for the compute registry remove command
 */
interface ComputeRegistryRemoveInput {
    /** The registry id (full UUID) */
    registryId: string;
}
/**
 * Remove a registry.
 *
 * Answers `204 No Content`. The service awaits its own write before
 * responding, so on return the `serverUrl` is registrable again and a second
 * DELETE answers 404. The row is TOMBSTONED, never deleted — the registration
 * and every rotation stay readable for support.
 *
 * REMOVAL IS UNCONDITIONAL: no workload reference is checked and no new
 * default is elected. Running pods are unaffected; a pull from that host fails
 * only when the kubelet next pulls. The in-cluster credential is revoked by
 * the reconciler asynchronously.
 *
 * `FlowcoreClient` substitutes `{ status: 204 }` for the empty body, and that
 * synthetic object is what this command returns.
 */
declare class ComputeRegistryRemoveCommand extends Command<ComputeRegistryRemoveInput, ComputeNoContent> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request. The route takes NO body.
     */
    protected getBody(): undefined;
    /**
     * Parse the response.
     *
     * The endpoint answers 204 with an EMPTY body, which `FlowcoreClient` turns
     * into `{ status: 204 }` before it reaches here.
     */
    protected parseResponse(rawResponse: unknown): ComputeNoContent;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute registry rotate command
 */
interface ComputeRegistryRotateInput {
    /** The registry id (full UUID) */
    registryId: string;
    /**
     * The NEW pull secret, 8..4096 characters.
     *
     * Rotation replaces the credential; it does not re-describe the registry.
     * The previous secret is never returned and never becomes readable.
     */
    secret: string;
}
/**
 * Rotate a registry's credentials.
 *
 * Answers 200 with the sanitized registry read back from the projection, so
 * `updatedAt` is the REAL rotation timestamp rather than a wall-clock guess.
 * The in-cluster pull Secret is patched by the reconciler; no pod rolls.
 *
 * The response body is BARE, with no `{ success: true }` envelope.
 */
declare class ComputeRegistryRotateCommand extends Command<ComputeRegistryRotateInput, ComputeRegistry> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request.
     *
     * OVERRIDDEN BECAUSE THE UPSTREAM BODY IS `.strict()` AND DELIBERATELY
     * NARROW — `{ secret }` and nothing else, so that an attempt to smuggle a
     * `serverUrl` or `isDefault` change through the rotation path is a 422. The
     * base implementation would send `registryId`, a path parameter, inside the
     * JSON and every call would be refused.
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeRegistry;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute workload events list command
 */
interface ComputeWorkloadEventsListInput {
    /** The workload id (full UUID) */
    workloadId: string;
}
/**
 * List a workload's recent KUBERNETES deployment events, most recently seen
 * first.
 *
 * These are cluster events, not Flowcore events: the workload's Deployment,
 * Service and autoscaler, its ReplicaSets, its pods and its pre-sync and run
 * Jobs, read live across both Kubernetes API groups, merged and deduplicated.
 * The namespace and every object name are derived SERVER-SIDE from the
 * workload projection, so there is deliberately no namespace or selector
 * parameter here.
 *
 * NO PAGINATION, and none is needed: THE WINDOW IS THE CLUSTER'S. Kubernetes
 * reaps events on its own TTL — roughly an hour on this platform — and nothing
 * older survives; the service persists nothing to widen it.
 *
 * AN EMPTY `events` ARRAY IS A NORMAL ANSWER, not an error: a workload the
 * cluster has had nothing to say about within the TTL answers 200 with an
 * empty list. The response is a BARE object, with no `{ success: true }`
 * envelope.
 */
declare class ComputeWorkloadEventsListCommand extends Command<ComputeWorkloadEventsListInput, ComputeWorkloadDeploymentEvents> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadDeploymentEvents;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute workload logs fetch command
 */
interface ComputeWorkloadLogsFetchInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** ISO-8601 lower bound */
    since?: string;
    /** ISO-8601 upper bound */
    until?: string;
    /** Free-text search over the message */
    search?: string;
    /** Maximum number of lines, 1..1000 (defaults to 100 server-side) */
    limit?: number;
    /** Restrict to one container by name */
    container?: string;
}
/**
 * Query indexed historical container logs for a workload.
 *
 * The tenant namespace and the `flowcore.io/workload-id` pod label are derived
 * SERVER-SIDE from the workload projection and cannot be widened by the
 * caller, so there is deliberately no namespace or label parameter here.
 *
 * This is the HISTORICAL, indexed surface. The live SSE stream
 * (`GET /api/v1/workloads/{workloadId}/logs/stream`) is NOT covered by this
 * SDK — it needs a streaming transport this client does not have.
 *
 * The response is a BARE object, with no `{ success: true }` envelope.
 */
declare class ComputeWorkloadLogsFetchCommand extends Command<ComputeWorkloadLogsFetchInput, ComputeWorkloadLogs> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadLogs;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute workload log stream command
 */
interface ComputeWorkloadLogStreamInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** Restrict to one container by name; defaults server-side to the pod's first container */
    container?: string;
    /** How much history to replay before following, 0..1000 (defaults to 100 server-side) */
    tailLines?: number;
}
/**
 * An active live log stream.
 *
 * Mirrors `ActiveStreamInterface` from `websocket-command.ts` — the SDK's
 * existing streaming shape — minus `send`, because SSE is one-directional.
 */
interface ComputeWorkloadLogStream {
    /**
     * An Observable emitting one value per `event: log` frame, in wire order.
     *
     * Reading only STARTS on the first subscription, so no frame is dropped
     * between the connection opening and the caller subscribing. From then on it
     * is hot and shared: a second, later subscriber joins mid-stream and sees
     * only what arrives after it.
     *
     * Completes when the server closes the stream or `disconnect()` is called,
     * and errors if the stream breaks mid-flight. `event: heartbeat` frames keep
     * the connection alive and are deliberately NOT emitted here.
     */
    output$: Observable<ComputeLogStreamEvent>;
    /**
     * Closes the stream. Aborts the underlying fetch — the server sees the
     * disconnect and tears down its upstream Kubernetes followers — and
     * completes `output$`. Idempotent.
     */
    disconnect(): void;
}
declare class ComputeWorkloadLogStreamCommand extends CustomCommand<ComputeWorkloadLogStreamInput, ComputeWorkloadLogStream> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Custom execute method — opens the SSE connection and returns the stream
     */
    protected customExecute(client: FlowcoreClient): Promise<ComputeWorkloadLogStream>;
}

/**
 * The input for the compute workload revisions list command
 */
interface ComputeWorkloadRevisionsListInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** Page size (defaults to the service's own page size) */
    limit?: number;
    /** Opaque cursor from a previous page's `nextCursor` */
    cursor?: string;
}
/**
 * List a workload's revision history, newest ordinal first.
 *
 * Every definition the workload has ever been recorded with: the revision
 * seeded at creation (`cause: "created"`), one per update and one per
 * rollback. A rollback is a NEW revision carrying the ordinal it restored
 * from — history is never edited.
 *
 * `outcome` is read from the operation that carried the revision to the
 * cluster, so a revision recorded but never promoted (a failed pre-sync hook,
 * say) is distinguishable from one merely superseded. IT IS ABSENT on a
 * `created` revision, which mints no operation at all — check for it before
 * reading it.
 *
 * PAGINATED, like `ComputeWorkloadRunsListCommand`: revision history is
 * unbounded by construction and nothing ever removes a row. Feed `nextCursor`
 * back as `cursor`; it is absent on the last page. The response is a BARE
 * object, with no `{ success: true }` envelope.
 */
declare class ComputeWorkloadRevisionsListCommand extends Command<ComputeWorkloadRevisionsListInput, ComputeWorkloadRevisionList> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadRevisionList;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute workload runs list command
 */
interface ComputeWorkloadRunsListInput {
    /** The workload id (full UUID) */
    workloadId: string;
    /** Page size, 1..200 (defaults to 50 server-side) */
    limit?: number;
    /** Opaque cursor from a previous page's `nextCursor` */
    cursor?: string;
}
/**
 * List a workload's run history, newest first.
 *
 * Every execution the platform has run for the workload: on-demand batch runs
 * (`kind: "batch"`) AND the pre-sync hooks its creates, updates and rollbacks
 * gated on (`kind: "pre_sync"`).
 *
 * PAGINATED, unlike `ComputeWorkloadListCommand` — run history is unbounded by
 * construction and nothing ever removes a row. Feed `nextCursor` back as
 * `cursor`; it is absent on the last page. The response is a BARE object, with
 * no `{ success: true }` envelope.
 */
declare class ComputeWorkloadRunsListCommand extends Command<ComputeWorkloadRunsListInput, ComputeWorkloadRunList> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadRunList;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute workload create command
 */
interface ComputeWorkloadCreateInput {
    /** The tenant id (full UUID) */
    tenantId: string;
    /** The name of the workload */
    name: string;
    /**
     * The full definition. `image` and `slotTier` are required — they have no
     * safe default, so a request without them is 422.
     */
    definition: ComputeWorkloadDefinition;
}
/**
 * Create a workload.
 *
 * Answers 201 with the workload READ BACK from the projection, not a
 * `{ status: "processing" }` stub: the service awaits its own
 * `workload.created.0` write before responding. Revision 1 is active from
 * birth. The cluster rollout that follows is observable through
 * `ComputeWorkloadFetchCommand`.
 *
 * Response envelope: `{ success: true, workload: {...} }`, unwrapped here.
 */
declare class ComputeWorkloadCreateCommand extends Command<ComputeWorkloadCreateInput, ComputeWorkload> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE: a create mints a workload id server-side, so a retried 502 would
     * deploy the same workload twice.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkload;
}

/**
 * Create a workload and retain the operation that carries it to the cluster.
 *
 * The original create command keeps returning only the workload for backward
 * compatibility. New integrations should use this command so they can poll
 * cluster convergence from the API-minted `operationId`.
 */
declare class ComputeWorkloadCreateTrackedCommand extends Command<ComputeWorkloadCreateInput, ComputeWorkloadCreateResponse> {
    protected retryOnFailure: boolean;
    protected getMethod(): string;
    protected getBaseUrl(): string;
    protected getPath(): string;
    protected parseResponse(rawResponse: unknown): ComputeWorkloadCreateResponse;
}

/**
 * The default poll budget, in milliseconds (10 minutes).
 *
 * DELIBERATELY MUCH LONGER than the 25 seconds `DataCoreRequestDeleteCommand`
 * allows itself. A compute mutation is a pre-sync hook (whose own timeout
 * defaults to 300 seconds and may be set as high as 3600) followed by a
 * rolling update, so 25 seconds would time out on a perfectly healthy deploy.
 */
declare const DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS = 600000;
/** The default gap between polls, in milliseconds. */
declare const DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS = 1000;
/**
 * The wait options every 202-returning compute command accepts.
 */
interface ComputeOperationWaitOptions {
    /**
     * Poll `GET /api/v1/operations/{operationId}` until the operation reaches a
     * terminal state before resolving (default: false)
     */
    waitForOperation?: boolean;
    /**
     * How long to keep polling, in milliseconds
     * (default: {@link DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS}, 10 minutes)
     */
    operationTimeoutMs?: number;
    /**
     * How long to sleep between polls, in milliseconds
     * (default: {@link DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS}, 1 second)
     */
    operationPollIntervalMs?: number;
}
/**
 * The 202 body of PATCH, rollback, pause and resume, plus the terminal
 * operation when `waitForOperation` was set.
 */
interface ComputeWorkloadMutationOutput {
    /** Always true */
    success: true;
    /** The workload as it stands NOW — the new revision is promoted by the cluster's verdict */
    workload: ComputeWorkload;
    /** The operation the cluster convergence is tracked under (full UUID) */
    operationId: string;
    /** The terminal operation. Present ONLY when `waitForOperation` was set */
    operation?: ComputeOperation;
}
/**
 * The 202 body of `DELETE /api/v1/workloads/{workloadId}`, plus the terminal
 * operation when `waitForOperation` was set.
 */
interface ComputeWorkloadDeleteOutput {
    /** Always true */
    success: true;
    /** The operation the teardown is tracked under (full UUID) */
    operationId: string;
    /** The terminal operation. Present ONLY when `waitForOperation` was set */
    operation?: ComputeOperation;
}
/**
 * The 202 body of `POST /api/v1/workloads/{workloadId}/run`, plus the
 * terminal operation when `waitForOperation` was set.
 */
interface ComputeWorkloadRunOutput {
    /** Always true */
    success: true;
    /** The run row, already listed by `GET /runs` */
    run: ComputeWorkloadRun;
    /** The run id (full UUID) */
    runId: string;
    /** The operation the run is tracked under (full UUID) */
    operationId: string;
    /** The terminal operation. Present ONLY when `waitForOperation` was set */
    operation?: ComputeOperation;
}
/**
 * Poll a compute operation until it reaches a terminal state.
 *
 * Modelled on the `processResponse` loop of `DataCoreRequestDeleteCommand`,
 * with TWO deliberate deviations from that template:
 *
 * 1. AN EARLY 404 IS "NOT YET", NOT "GONE". The compute API mints the
 *    operation id and emits the event, but the operation ROW is written by
 *    the `compute-operation.0/operation.updated.0` handler only once the
 *    in-cluster reconciler files its first progress report. Between the 202
 *    and that report the endpoint answers 404, and treating that as a
 *    terminal answer would make every wait fail on a healthy deploy. So a
 *    `NotFoundException` is swallowed and the poll continues.
 *
 * 2. THE BUDGET IS LONGER AND CONFIGURABLE, AND EXHAUSTING IT THROWS. The
 *    delete template gives itself a hardcoded 25 seconds and then returns the
 *    original response as if nothing happened. A rolling update gated on a
 *    pre-sync hook routinely runs longer than that, and silently returning
 *    "done" for an operation still in flight is worse here than it is there:
 *    the caller's next action is usually to treat the new revision as live.
 *    So the budget defaults to 10 minutes, is overridable per call, and a
 *    timeout raises a {@link CommandError} naming the last state observed.
 *
 * A FAILED operation is RETURNED, not thrown: `failed` is a terminal answer
 * to the question that was asked, and `reason` explains it. Only the absence
 * of an answer within the budget is an error.
 */
declare function waitForComputeOperation(client: FlowcoreClient, commandName: string, operationId: string, options: ComputeOperationWaitOptions): Promise<ComputeOperation>;

/**
 * The input for the compute workload delete command
 */
interface ComputeWorkloadDeleteInput extends ComputeOperationWaitOptions {
    /** The workload id (full UUID) */
    workloadId: string;
}
/**
 * Delete a workload and cascade its domain bindings.
 *
 * Answers 202 with the teardown's operation id and NO workload body. Every
 * live domain binding is released first, then the workload leaves
 * `GET /api/v1/workloads` immediately; the in-cluster reconciler removes the
 * Deployment, the Service, the autoscaler and the Jobs asynchronously.
 *
 * `GET /api/v1/workloads/{workloadId}` keeps resolving the workload while the
 * teardown runs, reporting it `archived`.
 */
declare class ComputeWorkloadDeleteCommand extends Command<ComputeWorkloadDeleteInput, ComputeWorkloadDeleteOutput> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request.
     *
     * The route takes NO body. Left to the base implementation it would send
     * the whole input — the path parameter and the client-side wait knobs — as
     * JSON on a DELETE.
     */
    protected getBody(): undefined;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadDeleteOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Optionally wait for the teardown to finish
     */
    protected processResponse(client: FlowcoreClient, response: ComputeWorkloadDeleteOutput): Promise<ComputeWorkloadDeleteOutput>;
}

/**
 * The input for the compute workload fetch command
 */
interface ComputeWorkloadFetchInput {
    /** The workload id (full UUID) */
    workloadId: string;
}
/**
 * Fetch a single workload.
 *
 * A DELETED workload is deliberately still served, reporting `archived`, so
 * that a client holding the 202 of a delete can keep resolving it while the
 * teardown runs.
 *
 * Response envelope: `{ success: true, workload: {...} }`, unwrapped here.
 */
declare class ComputeWorkloadFetchCommand extends Command<ComputeWorkloadFetchInput, ComputeWorkload> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkload;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
}

/**
 * The input for the compute workload list command
 */
interface ComputeWorkloadListInput {
    /** The tenant id (full UUID) */
    tenantId: string;
}
/**
 * List a tenant's workloads, newest first.
 *
 * Deleted workloads are excluded server-side. The response is wrapped in the
 * `{ success: true, workloads: [...] }` envelope; this command unwraps it.
 */
declare class ComputeWorkloadListCommand extends Command<ComputeWorkloadListInput, ComputeWorkload[]> {
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkload[];
}

/**
 * The input for the compute workload pause command
 */
interface ComputeWorkloadPauseInput extends ComputeOperationWaitOptions {
    /** The workload id (full UUID) */
    workloadId: string;
}
/**
 * Pause a workload, keeping its configuration.
 *
 * The reconciler patches ONLY the Deployment's `spec.replicas` to 0 — nothing
 * is deleted and no definition field changes, so the workload reports status
 * `stopped` with `paused: true` while its full configuration stays visible.
 * A pause mints no revision, so it never appears in the rollback history.
 *
 * Answers 409 for a job-kind workload (it has no Deployment) and for a
 * workload that is already paused.
 */
declare class ComputeWorkloadPauseCommand extends Command<ComputeWorkloadPauseInput, ComputeWorkloadMutationOutput> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE: a pause mints an operation id, and the service answers 409 to a
     * second pause — a retry of an already-recorded request would surface that
     * conflict as the caller's answer.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request. The route takes NO body.
     */
    protected getBody(): undefined;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadMutationOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Optionally wait for the scale-down to finish
     */
    protected processResponse(client: FlowcoreClient, response: ComputeWorkloadMutationOutput): Promise<ComputeWorkloadMutationOutput>;
}

/**
 * The input for the compute workload resume command
 */
interface ComputeWorkloadResumeInput extends ComputeOperationWaitOptions {
    /** The workload id (full UUID) */
    workloadId: string;
}
/**
 * Resume a paused workload unchanged.
 *
 * The reconciler runs the SAME tenant quota pre-flight a create runs before
 * scaling the Deployment back: pausing frees the tenant's quota mechanically,
 * so the headroom a resume needs may have been taken while it was paused. A
 * REFUSED RESUME IS NOT AN ERROR ON THIS CALL — it still answers 202, and the
 * operation then fails with the quota reason while the workload stays paused.
 * Pass `waitForOperation: true` (or poll the operation) to see that outcome.
 *
 * Answers 409 for a job-kind workload and for a workload that is not paused.
 */
declare class ComputeWorkloadResumeCommand extends Command<ComputeWorkloadResumeInput, ComputeWorkloadMutationOutput> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE: a resume mints an operation id, and the service answers 409 to a
     * second resume — a retry of an already-recorded request would surface that
     * conflict as the caller's answer.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request. The route takes NO body.
     */
    protected getBody(): undefined;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadMutationOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Optionally wait for the scale-up to finish
     */
    protected processResponse(client: FlowcoreClient, response: ComputeWorkloadMutationOutput): Promise<ComputeWorkloadMutationOutput>;
}

/**
 * The input for the compute workload rollback command
 */
interface ComputeWorkloadRollbackInput extends ComputeOperationWaitOptions {
    /** The workload id (full UUID) */
    workloadId: string;
}
/**
 * Roll a workload back to its previous revision.
 *
 * History is append-only, so this APPENDS a revision rather than rewinding
 * the counter: rolling back to revision 1 from revision 2 makes revision 3
 * active with revision 1's definition, and the workload then reports
 * `activeRevision: 3, rolledBackFrom: 1`.
 *
 * Answers 409 when there is no earlier revision to restore.
 */
declare class ComputeWorkloadRollbackCommand extends Command<ComputeWorkloadRollbackInput, ComputeWorkloadMutationOutput> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE: a rollback mints a revision and an operation id, and re-runs the
     * target revision's pre-sync hook.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request.
     *
     * The route takes NO body — the target revision is derived server-side.
     */
    protected getBody(): undefined;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadMutationOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Optionally wait for the cluster to converge
     */
    protected processResponse(client: FlowcoreClient, response: ComputeWorkloadMutationOutput): Promise<ComputeWorkloadMutationOutput>;
}

/**
 * The input for the compute workload run command
 */
interface ComputeWorkloadRunInput extends ComputeOperationWaitOptions {
    /** The workload id (full UUID) — must be a workload of kind `job` */
    workloadId: string;
}
/**
 * Run a batch job workload on demand.
 *
 * The API mints BOTH the run id (which names the Kubernetes Job, `run-<runId>`)
 * and the operation id, and awaits its own write, so the 202 names a run that
 * `ComputeWorkloadRunsListCommand` already lists. The reconciler then runs the
 * tenant's quota pre-flight, creates the Job and polls it to completion.
 *
 * Answers 409 for a service-kind workload.
 */
declare class ComputeWorkloadRunCommand extends Command<ComputeWorkloadRunInput, ComputeWorkloadRunOutput> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE: a run mints a run id and spends the tenant's compute quota, so a
     * retried 502 would start the job twice.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request. The route takes NO body.
     */
    protected getBody(): undefined;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadRunOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Optionally wait for the run to reach a terminal state
     */
    protected processResponse(client: FlowcoreClient, response: ComputeWorkloadRunOutput): Promise<ComputeWorkloadRunOutput>;
}

/**
 * The input for the compute workload update command
 */
interface ComputeWorkloadUpdateInput extends ComputeOperationWaitOptions {
    /** The workload id (full UUID) */
    workloadId: string;
    /** New container image */
    image?: string;
    /** New compute slot tier */
    slotTier?: ComputeSlotTier;
    /** New replica count, 1..50. Zero is not accepted here — that is what pause is for */
    replicas?: number;
    /** New container port */
    port?: number;
    /** Replaces the probe block */
    probes?: ComputeWorkloadProbes;
    /** Replaces the pre-sync hook */
    preSync?: ComputePreSyncSpec;
    /** Replaces the scaling block WHOLESALE — it is not merged into the stored one */
    scaling?: ComputeWorkloadScaling;
    /**
     * Replaces the environment variables WHOLESALE, like `scaling` above.
     * Sending `[]` CLEARS every variable the previous revision set — that is
     * how a variable is removed, as there is no per-key patch.
     */
    env?: ComputeWorkloadEnvVar[];
    /** Replaces the organization-secret bindings wholesale, same rule as `env` */
    secrets?: ComputeWorkloadSecretRef[];
    /**
     * The volume list, GROWTH-ONLY: the same set of volumes (same names, same
     * mount paths) with each `sizeGi` equal or larger. The service answers 422
     * to an add, a remove, a rename, a mountPath move or a shrink — volumes
     * are declared at create and destroyed only by workload DELETE.
     */
    volumes?: ComputeWorkloadVolume[];
}
/**
 * Update a workload's definition.
 *
 * Answers 202: the change is RECORDED as a new revision and the returned
 * workload is the one still serving. The revision is promoted only when the
 * reconciler reports the returned operation `succeeded`, so a workload whose
 * pre-sync hook fails keeps reporting the previous image — poll the operation
 * (or pass `waitForOperation: true`) before treating the new definition as
 * live.
 *
 * Switching `scaling.mode` from `hpa` to `manual` additionally requires
 * `replicas` in the same call; the service answers 422 without it.
 */
declare class ComputeWorkloadUpdateCommand extends Command<ComputeWorkloadUpdateInput, ComputeWorkloadMutationOutput> {
    /**
     * Whether the command should retry on failure.
     *
     * FALSE. A PATCH looks idempotent and is not: each call MINTS A REVISION
     * and an operation id server-side, and re-applying a revision re-runs the
     * workload's pre-sync hook. A retried 502 whose original request had
     * already been recorded would append a second identical revision and run
     * the migration hook twice.
     */
    protected retryOnFailure: boolean;
    /**
     * Get the method
     */
    protected getMethod(): string;
    /**
     * Get the base url
     */
    protected getBaseUrl(): string;
    /**
     * Get the path
     */
    protected getPath(): string;
    /**
     * Get the body for the request.
     *
     * OVERRIDDEN BECAUSE THE UPSTREAM BODY IS `.strict()`. The base
     * implementation sends the WHOLE input, which would put `workloadId` (a
     * path parameter) and the client-side `waitForOperation` /
     * `operationTimeoutMs` / `operationPollIntervalMs` knobs into the JSON —
     * and every one of them is a key `UpdateWorkloadRequestSchema` does not
     * list, so the service would answer 422 on the very first call.
     */
    protected getBody(): Record<string, unknown>;
    /**
     * Parse the response
     */
    protected parseResponse(rawResponse: unknown): ComputeWorkloadMutationOutput;
    /**
     * Handle the client error
     */
    protected handleClientError(error: ClientError): void;
    /**
     * Optionally wait for the cluster to converge
     */
    protected processResponse(client: FlowcoreClient, response: ComputeWorkloadMutationOutput): Promise<ComputeWorkloadMutationOutput>;
}

type Logger = {
    debug: (message: string, meta?: Record<string, unknown>) => void;
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string | Error, meta?: Record<string, unknown>) => void;
};

/**
 * Represents an event notification from the Flowcore system
 */
type NotificationEvent = {
    pattern: string;
    data: {
        tenant: string;
        eventId: string;
        dataCoreId: string;
        flowType: string;
        eventType: string;
        validTime: string;
    };
};
/**
 * Interface for OIDC authentication client
 */
type OidcClient$1 = {
    getToken: () => Promise<{
        accessToken: string;
    }>;
};
/**
 * Configuration options for the NotificationClient
 */
type NotificationClientOptions = {
    reconnectInterval: number;
    maxReconnects?: number;
    maxEvents?: number;
    logger?: Logger;
};
interface NotificationClientAuthOptionsBearer {
    oidcClient: OidcClient$1;
}
interface NotificationClientAuthOptionsApiKey {
    apiKey: string;
    apiKeyId?: string;
}
type NotificationClientAuthOptions = NotificationClientAuthOptionsBearer | NotificationClientAuthOptionsApiKey;
/**
 * Client for handling WebSocket connections to the Flowcore notification system.
 * Manages connection lifecycle, authentication, and event handling.
 */
declare class NotificationClient {
    private readonly observer;
    private readonly authOptions;
    private readonly subscriptionSpec;
    private url;
    private webSocket;
    private options;
    private logger;
    private eventCount;
    private reconnectInterval;
    private reconnectAttempts;
    private _isOpen;
    private _isConnecting;
    /**
     * Which handshake carries the credential.
     *
     * `subprotocol` is tried first and is the one that does NOT put the
     * credential in the URL. `query` is the legacy transport, kept only so this
     * client still works against a server that has not shipped subprotocol
     * support yet.
     */
    private authTransport;
    /** True once a handshake has settled, so the fallback is probed at most once. */
    private transportSettled;
    /**
     * Creates a new NotificationClient instance
     * @param observer - RxJS Subject for emitting notification events
     * @param authOptions - Auth options for the client
     * @param subscriptionSpec - Specification for what notifications to subscribe to
     * @param options - Configuration options for the client
     */
    constructor(observer: Subject<NotificationEvent>, authOptions: NotificationClientAuthOptions, subscriptionSpec: {
        tenant: string;
        dataCore: string;
        flowType?: string;
        eventType?: string;
    }, options?: Partial<NotificationClientOptions>);
    /**
     * Is the websocket connection open
     */
    get isOpen(): boolean;
    /**
     * Is the websocket connection currently connecting
     */
    get isConnecting(): boolean;
    /**
     * Establishes WebSocket connection and sets up event handlers
     */
    connect(): Promise<void>;
    /**
     * Decides WHERE the credential travels, for the transport currently selected.
     *
     * This is the whole security property of this client, isolated so it can be
     * asserted directly: on the `subprotocol` transport the returned query is
     * EMPTY. An ingress access log records the request line, so a credential in
     * the query string is written to disk in plaintext and is readable by
     * everyone with log access — for a long-lived `fc_` key that is a full
     * tenant compromise sitting in a log index.
     */
    private buildCredentialHandshake;
    /**
     * True when the subprotocol handshake has just failed for the first time.
     *
     * The fallback is probed at most ONCE per client. After it settles, a later
     * failure is a real failure and goes through normal reconnect handling.
     */
    private shouldFallBackToQueryTransport;
    /**
     * Switches to the legacy query-string transport and reconnects immediately.
     *
     * This does NOT count as a reconnect attempt: no backoff is consumed and the
     * caller sees one continuous connection attempt.
     */
    private fallBackToQueryTransport;
    /**
     * Parses and dispatches a single raw notification frame.
     *
     * Runs inside the WebSocket `onmessage` callback, where any thrown error is
     * uncaught and crashes the host process. Notification frames can occasionally
     * be malformed (non-JSON, empty/absent `message`, truncated payloads, or
     * non-event control frames), so every parse is guarded — a bad frame is logged
     * and skipped instead of taking down the whole connection/process.
     */
    private handleMessage;
    /**
     * Attempts to reconnect to the WebSocket server using exponential backoff
     */
    private attemptReconnect;
    /**
     * Closes the WebSocket connection
     */
    disconnect(): void;
    /**
     * Overrides the base WebSocket URL for testing or different environments
     * @param url - The new base URL to use
     */
    overrideBaseUrl(url: string): void;
}

/**
 * Interface for OIDC authentication client (reused from NotificationClient context)
 */
type OidcClient = {
    getToken: () => Promise<{
        accessToken: string;
    }>;
};
/**
 * Configuration options for the WebSocketClient
 */
type WebSocketClientOptions = {
    /** Interval between reconnect attempts (ms). Defaults to 1000. */
    reconnectInterval?: number;
    /** Maximum number of reconnect attempts. Defaults to undefined (infinite). */
    maxReconnects?: number;
    /** Optional logger instance. */
    logger?: Logger;
};
interface MinimalWebSocket {
    readyState: number;
    onopen: (() => void) | null;
    onmessage: ((event: {
        data: string | ArrayBuffer | Buffer;
    }) => void) | null;
    onclose: ((event: {
        code: number;
        reason: string;
        wasClean: boolean;
    }) => void) | null;
    onerror: ((event: Event) => void) | null;
    send(data: string): void;
    close(code?: number, reason?: string): void;
}
type WebSocketFactory = (url: string) => MinimalWebSocket;
/**
 * Generic client for managing a single, persistent WebSocket connection based on a command.
 * Handles connection lifecycle, authentication, reconnection, and message sending/receiving.
 */
declare class WebSocketClient {
    private readonly authOptions;
    private overrideBaseUrl;
    private webSocket;
    private options;
    private logger;
    private reconnectInterval;
    private reconnectAttempts;
    private _isOpen;
    private _isConnecting;
    private webSocketFactory;
    private internalSubject;
    private currentCommand;
    private currentConfig;
    /**
     * Creates a new WebSocketClient instance.
     * @param authOptions - Authentication options (Bearer token via OIDC client or API Key).
     * @param options - Configuration options for the client.
     * @param webSocketFactory - Optional WebSocket factory for testing.
     */
    constructor(authOptions: ClientOptions, options?: WebSocketClientOptions, webSocketFactory?: WebSocketFactory);
    /**
     * Override the base URL provided by commands.
     * @param baseUrl - The new base URL to use (e.g., "wss://staging-server.api.flowcore.io").
     */
    setBaseUrl(baseUrl: string): void;
    /**
     * Returns true if the WebSocket connection is currently open.
     */
    get isOpen(): boolean;
    /**
     * Returns true if the client is currently attempting to establish a WebSocket connection.
     */
    get isConnecting(): boolean;
    /**
     * Establishes WebSocket connection based on the provided command.
     * Disconnects any existing connection before starting the new one.
     * @param command - The command defining the stream connection details.
     * @returns An interface to interact with the active stream.
     */
    connect<Config, SendPayload>(command: WebSocketCommand<Config, SendPayload>): Promise<ActiveStreamInterface<SendPayload>>;
    /**
     * Sets up the WebSocket event handlers (onopen, onmessage, onclose, onerror).
     */
    private setupEventHandlers;
    /**
     * Attempts to reconnect to the WebSocket server using exponential backoff.
     * Requires `currentConfig` to be set.
     */
    private attemptReconnect;
    /**
     * Sends a message to the currently connected WebSocket.
     * @param message - The message object to send (e.g., { content: "user input" }).
     */
    private sendMessage;
    /**
     * Closes the WebSocket connection gracefully.
     */
    disconnect(): void;
    /**
     * Implements the Disposable interface for clean resource management.
     */
    [Symbol.dispose](): void;
}

/**
 * An error thrown when the response from the server is invalid
 */
declare class InvalidResponseException extends Error {
    readonly errors: Record<string, string>;
    constructor(message: string, errors: Record<string, string>);
}

/**
 * An error thrown when a resource is not found
 */
declare class NotFoundException extends Error {
    constructor(resource: string, filters: Record<string, string>);
}

/**
 * An error thrown when the command fails
 */
declare class CommandError extends Error {
    constructor(commandName: string, message: string);
}

/**
 * Helper method for parsing the response
 */
declare const parseResponseHelper: <T extends TSchema>(schema: T, response: unknown) => Static<T>;

export { type ActiveStreamInterface, type AddContextItem, type AddContextItemsRequest, type AiStreamConfig, type ApiKey, ApiKeyCreateCommand, type ApiKeyCreateInput, ApiKeyDeleteCommand, type ApiKeyDeleteInput, ApiKeyEditCommand, type ApiKeyEditInput, ApiKeyFetchCommand, type ApiKeyFetchInput, ApiKeyListCommand, type ApiKeyListInput, ApiKeyValidateCommand, type ApiKeyValidateInput, ApiKeyValidateWithTenantIdCommand, type ApiKeyValidateWithTenantIdInput, type ApiKeyValidation, type ApiKeyWithValue, type ArchivePolicyResponse, ArchivePolicyResponseSchema, type ArchiveRoleResponse, ArchiveRoleResponseSchema, type Artifact, type ArtifactContentChunk, type ArtifactContentDeltaChunk, type ArtifactDataChunk, type ArtifactEndChunk, ArtifactGetCommand, type ArtifactGetCommandInput, type ArtifactStartChunk, type ArtifactUrlChunk, type AuditLogEntry, AuditLogEntrySchema, type AuditLogResponse, AuditLogResponseSchema, type AwsMarketplaceCustomer, type AwsMarketplaceCustomerResolve, AwsMarketplaceCustomerResolveCommand, type AwsMarketplaceCustomerResolveInput, type AwsMarketplaceDedicatedClusterType, type AwsMarketplaceLink, type AwsMarketplaceLinkCreate, AwsMarketplaceLinkCreateCommand, type AwsMarketplaceLinkCreateInput, type AwsMarketplaceLinkDelete, AwsMarketplaceLinkDeleteCommand, type AwsMarketplaceLinkDeleteInput, type AwsMarketplaceLinkFetch, AwsMarketplaceLinkFetchCommand, type AwsMarketplaceLinkFetchInput, type AwsMarketplaceLinkList, AwsMarketplaceLinkListCommand, type AwsMarketplaceLinkListInput, type AwsMarketplaceProductMode, type AwsMarketplaceProductProperties, ClientError, type ClientOptions, Command, CommandError, type ComputeDeploymentEvent, type ComputeDeploymentEventObject, ComputeDeploymentEventObjectSchema, ComputeDeploymentEventSchema, type ComputeDomain, ComputeDomainAttachCommand, type ComputeDomainAttachCustomInput, type ComputeDomainAttachInput, type ComputeDomainAttachTls, type ComputeDomainAttachWildcardInput, ComputeDomainDetachCommand, type ComputeDomainDetachInput, ComputeDomainListCommand, type ComputeDomainListInput, type ComputeDomainListResponse, ComputeDomainListResponseSchema, ComputeDomainSchema, type ComputeDomainStatus, ComputeDomainStatusSchema, type ComputeDomainTls, ComputeDomainTlsSchema, type ComputeDomainTlsStatus, ComputeDomainTlsStatusSchema, type ComputeDomainVerification, ComputeDomainVerificationSchema, type ComputeDomainVerificationType, ComputeDomainVerificationTypeSchema, ComputeDomainVerifyCommand, type ComputeDomainVerifyInput, type ComputeDomainVerifyResponse, ComputeDomainVerifyResponseSchema, type ComputeLogEntry, ComputeLogEntrySchema, type ComputeLogStreamEvent, ComputeLogStreamEventSchema, type ComputeLogStreamName, ComputeLogStreamNameSchema, type ComputeNoContent, ComputeNoContentSchema, type ComputeOperation, type ComputeOperationDeploymentProgress, ComputeOperationDeploymentProgressSchema, ComputeOperationFetchCommand, type ComputeOperationFetchInput, type ComputeOperationPhase, ComputeOperationPhaseSchema, type ComputeOperationPreSyncProgress, ComputeOperationPreSyncProgressSchema, type ComputeOperationProgress, ComputeOperationProgressSchema, ComputeOperationSchema, type ComputeOperationStatus, ComputeOperationStatusSchema, type ComputeOperationStepStatus, ComputeOperationStepStatusSchema, type ComputeOperationType, ComputeOperationTypeSchema, type ComputeOperationWaitOptions, type ComputePreSyncSpec, ComputePreSyncSpecSchema, type ComputeProbe, type ComputeProbeExec, ComputeProbeExecSchema, type ComputeProbeHttpGet, ComputeProbeHttpGetSchema, ComputeProbeSchema, type ComputeProbeTcpSocket, ComputeProbeTcpSocketSchema, type ComputeRegistry, type ComputeRegistryDetail, type ComputeRegistryDetailResponse, ComputeRegistryDetailResponseSchema, ComputeRegistryDetailSchema, ComputeRegistryFetchCommand, type ComputeRegistryFetchInput, ComputeRegistryListCommand, type ComputeRegistryListInput, type ComputeRegistryListResponse, ComputeRegistryListResponseSchema, ComputeRegistryRegisterCommand, type ComputeRegistryRegisterInput, ComputeRegistryRemoveCommand, type ComputeRegistryRemoveInput, ComputeRegistryRotateCommand, type ComputeRegistryRotateInput, ComputeRegistrySchema, type ComputeRegistrySynthesisState, ComputeRegistrySynthesisStateSchema, type ComputeSlotTier, ComputeSlotTierSchema, type ComputeWorkload, ComputeWorkloadCreateCommand, type ComputeWorkloadCreateInput, type ComputeWorkloadCreateResponse, ComputeWorkloadCreateResponseSchema, ComputeWorkloadCreateTrackedCommand, type ComputeWorkloadDefinition, ComputeWorkloadDefinitionSchema, ComputeWorkloadDeleteCommand, type ComputeWorkloadDeleteInput, type ComputeWorkloadDeleteOutput, type ComputeWorkloadDeleteResponse, ComputeWorkloadDeleteResponseSchema, type ComputeWorkloadDeploymentEvents, ComputeWorkloadDeploymentEventsSchema, type ComputeWorkloadEnvVar, ComputeWorkloadEnvVarSchema, ComputeWorkloadEventsListCommand, type ComputeWorkloadEventsListInput, ComputeWorkloadFetchCommand, type ComputeWorkloadFetchInput, type ComputeWorkloadKind, ComputeWorkloadKindSchema, ComputeWorkloadListCommand, type ComputeWorkloadListInput, type ComputeWorkloadListResponse, ComputeWorkloadListResponseSchema, type ComputeWorkloadLogStream, ComputeWorkloadLogStreamCommand, type ComputeWorkloadLogStreamInput, type ComputeWorkloadLogs, ComputeWorkloadLogsFetchCommand, type ComputeWorkloadLogsFetchInput, ComputeWorkloadLogsSchema, type ComputeWorkloadMutationOutput, type ComputeWorkloadMutationResponse, ComputeWorkloadMutationResponseSchema, ComputeWorkloadPauseCommand, type ComputeWorkloadPauseInput, type ComputeWorkloadProbes, ComputeWorkloadProbesSchema, type ComputeWorkloadResponse, ComputeWorkloadResponseSchema, ComputeWorkloadResumeCommand, type ComputeWorkloadResumeInput, type ComputeWorkloadRevision, type ComputeWorkloadRevisionCause, ComputeWorkloadRevisionCauseSchema, type ComputeWorkloadRevisionList, ComputeWorkloadRevisionListSchema, ComputeWorkloadRevisionSchema, ComputeWorkloadRevisionsListCommand, type ComputeWorkloadRevisionsListInput, ComputeWorkloadRollbackCommand, type ComputeWorkloadRollbackInput, type ComputeWorkloadRun, ComputeWorkloadRunCommand, type ComputeWorkloadRunInput, type ComputeWorkloadRunKind, ComputeWorkloadRunKindSchema, type ComputeWorkloadRunList, ComputeWorkloadRunListSchema, type ComputeWorkloadRunOutput, type ComputeWorkloadRunResponse, ComputeWorkloadRunResponseSchema, ComputeWorkloadRunSchema, type ComputeWorkloadRunStatus, ComputeWorkloadRunStatusSchema, ComputeWorkloadRunsListCommand, type ComputeWorkloadRunsListInput, type ComputeWorkloadScaling, type ComputeWorkloadScalingMode, ComputeWorkloadScalingModeSchema, ComputeWorkloadScalingSchema, ComputeWorkloadSchema, type ComputeWorkloadSecretRef, ComputeWorkloadSecretRefSchema, type ComputeWorkloadStatus, ComputeWorkloadStatusSchema, ComputeWorkloadUpdateCommand, type ComputeWorkloadUpdateInput, type ComputeWorkloadVolume, ComputeWorkloadVolumeSchema, ContainerRegistListCommand, ContainerRegistryCreateCommand, type ContainerRegistryCreateInput, type ContainerRegistryCreateOutput, ContainerRegistryDeleteCommand, type ContainerRegistryDeleteInput, ContainerRegistryFetchCommand, type ContainerRegistryFetchInput, type ContainerRegistryFetchTenantInput, ContainerRegistryUpdateCommand, type ContextAddItemChunk, ContextAddItemCommand, type ContextAddItemCommandInput, type ContextAddItemCommandOutput, type ContextItem, ContextRemoveItemCommand, type ContextRemoveItemCommandInput, type ContextRemoveItemCommandOutput, type ContextUpdateResponse, type Conversation, type ConversationCreatedChunk, ConversationDeleteCommand, type ConversationDeleteCommandInput, type ConversationDeleteCommandOutput, type ConversationDeleteResponse, ConversationGetCommand, type ConversationGetCommandInput, type ConversationGetCommandOutput, ConversationListCommand, type ConversationListCommandInput, type ConversationListCommandOutput, type ConversationListResponse, type ConversationMetadata, ConversationStreamCommand, type ConversationStreamConfig, type ConversationStreamSendPayload, CustomCommand, DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS, DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS, type DataCore, DataCoreCreateCommand, type DataCoreCreateInput, DataCoreExistsCommand, type DataCoreExistsInput, type DataCoreExistsOutput, type DataCoreFetchByIdInput, type DataCoreFetchByNameAndTenantIdInput, type DataCoreFetchByNameAndTenantInput, DataCoreFetchCommand, type DataCoreFetchInput, DataCoreListCommand, type DataCoreListInput, DataCoreRequestDeleteCommand, type DataCoreRequestDeleteInput, type DataCoreRequestDeleteOutput, DataCoreUpdateCommand, type DataCoreUpdateInput, type DataPathway, type DataPathwayAssignment, DataPathwayAssignmentCompleteCommand, type DataPathwayAssignmentCompleteInput, DataPathwayAssignmentExpireLeasesCommand, type DataPathwayAssignmentExpireLeasesInput, DataPathwayAssignmentFetchCommand, type DataPathwayAssignmentFetchInput, DataPathwayAssignmentHeartbeatCommand, type DataPathwayAssignmentHeartbeatInput, type DataPathwayAssignmentList, DataPathwayAssignmentListCommand, type DataPathwayAssignmentListInput, type DataPathwayAssignmentNext, DataPathwayAssignmentNextCommand, type DataPathwayAssignmentNextInput, type DataPathwayCapacity, DataPathwayCapacityFetchCommand, type DataPathwayCapacityFetchInput, type DataPathwayCommand, DataPathwayCommandDispatchConfigUpdateCommand, type DataPathwayCommandDispatchConfigUpdateInput, DataPathwayCommandDispatchPauseCommand, type DataPathwayCommandDispatchPauseInput, DataPathwayCommandDispatchRestartCommand, type DataPathwayCommandDispatchRestartInput, DataPathwayCommandDispatchResumeCommand, type DataPathwayCommandDispatchResumeInput, DataPathwayCommandDispatchStopCommand, type DataPathwayCommandDispatchStopInput, DataPathwayCommandFetchCommand, type DataPathwayCommandFetchInput, type DataPathwayCommandList, DataPathwayCommandPendingByPathwayCommand, type DataPathwayCommandPendingByPathwayInput, DataPathwayCommandPendingCommand, type DataPathwayCommandPendingInput, type DataPathwayCommandResponse, DataPathwayCommandUpdateStatusByPathwayCommand, type DataPathwayCommandUpdateStatusByPathwayInput, DataPathwayCommandUpdateStatusCommand, type DataPathwayCommandUpdateStatusInput, DataPathwayCreateCommand, type DataPathwayCreateInput, DataPathwayDeleteCommand, type DataPathwayDeleteInput, DataPathwayDeliveryLogBatchCommand, type DataPathwayDeliveryLogBatchInput, DataPathwayDeliveryLogListCommand, type DataPathwayDeliveryLogListInput, DataPathwayDisableCommand, type DataPathwayDisableInput, type DataPathwayExpireLeasesResponse, DataPathwayFetchByNameCommand, type DataPathwayFetchByNameInput, DataPathwayFetchCommand, type DataPathwayFetchInput, DataPathwayHealthCheckCommand, type DataPathwayHealthCheckInput, type DataPathwayList, DataPathwayListCommand, type DataPathwayListInput, DataPathwayMetricsFetchCommand, type DataPathwayMetricsFetchInput, type DataPathwayMutationResponse, type DataPathwayPumpState, DataPathwayPumpStateFetchBySourceCommand, type DataPathwayPumpStateFetchBySourceInput, DataPathwayPumpStateFetchCommand, type DataPathwayPumpStateFetchInput, DataPathwayPumpStateSaveBySourceCommand, type DataPathwayPumpStateSaveBySourceInput, DataPathwayPumpStateSaveCommand, type DataPathwayPumpStateSaveInput, type DataPathwayPumpStateSaveResponse, type DataPathwayQuota, DataPathwayQuotaFetchCommand, type DataPathwayQuotaFetchInput, type DataPathwayQuotaList, DataPathwayQuotaListCommand, type DataPathwayQuotaListInput, DataPathwayQuotaSetCommand, type DataPathwayQuotaSetInput, type DataPathwayQuotaSetResponse, type DataPathwayQuotaWithUsage, DataPathwayRestartFetchCommand, type DataPathwayRestartFetchInput, type DataPathwayRestartRequest, DataPathwayRestartRequestCommand, type DataPathwayRestartRequestInput, type DataPathwayRestartRequestResponse, type DataPathwaySlot, DataPathwaySlotDeregisterCommand, type DataPathwaySlotDeregisterInput, DataPathwaySlotFetchCommand, type DataPathwaySlotFetchInput, DataPathwaySlotHeartbeatCommand, type DataPathwaySlotHeartbeatInput, type DataPathwaySlotList, DataPathwaySlotListCommand, type DataPathwaySlotListInput, type DataPathwaySlotMutationResponse, DataPathwaySlotRegisterCommand, type DataPathwaySlotRegisterInput, DataPathwayUpsertByNameCommand, type DataPathwayUpsertByNameInput, type DataPathwayUpsertByNameResponse, DataPathwayUpsertByNameResponseSchema, type EntitlementGrant, type EntitlementRequestAccessItem, type EntitlementResponse, EntitlementResponseSchema, type ErrorChunk, EventListCommand, type EventListInput, type EventListOutput, type EventType, EventTypeCreateCommand, type EventTypeCreateInput, EventTypeExistsCommand, type EventTypeExistsInput, type EventTypeExistsOutput, type EventTypeFetchByIdInput, type EventTypeFetchByNameInput, EventTypeFetchCommand, type EventTypeFetchInput, EventTypeInfoCommand, type EventTypeInfoInput, type EventTypeInfoOutput, EventTypeListCommand, type EventTypeListInput, EventTypeListRemovedSensitiveDataCommand, type EventTypeListRemovedSensitiveDataInput, EventTypeRemoveSensitiveDataCommand, type EventTypeRemoveSensitiveDataInput, EventTypeRequestDeleteCommand, type EventTypeRequestDeleteInput, type EventTypeRequestDeleteOutput, EventTypeRequestTruncateCommand, type EventTypeRequestTruncateInput, type EventTypeRequestTruncateOutput, EventTypeSchema, type EventTypeSensitiveDataMask, type EventTypeSensitiveDataMaskParsed, EventTypeSensitiveDataMaskParsedSchema, EventTypeSensitiveDataMaskSchema, EventTypeUpdateCommand, type EventTypeUpdateInput, EventsFetchCommand, type EventsFetchEventsInput, type EventsFetchEventsOutput, EventsFetchTimeBucketsByNamesCommand, type EventsFetchTimeBucketsByNamesInput, type EventsFetchTimeBucketsByNamesOutput, FetchPumpStatusCommand, type FetchPumpStatusInput, type FlowType, FlowTypeCreateCommand, type FlowTypeCreateInput, FlowTypeExistsCommand, type FlowTypeExistsInput, type FlowTypeExistsOutput, type FlowTypeFetchByIdInput, type FlowTypeFetchByNameInput, FlowTypeFetchCommand, type FlowTypeFetchInput, FlowTypeListCommand, type FlowTypeListInput, FlowTypeRequestDeleteCommand, type FlowTypeRequestDeleteInput, type FlowTypeRequestDeleteOutput, FlowTypeUpdateCommand, type FlowTypeUpdateInput, FlowcoreClient, type FlowcoreEvent, type InfoChunk, IngestBatchCommand, type IngestBatchInput, type IngestBatchOutput, IngestEventCommand, type IngestEventInput, type IngestEventOutput, InvalidResponseException, KeyPoliciesCommand, type KeyPoliciesInput, type KeyPolicyLink, KeyPolicyLinkSchema, type KeyRoleLink, KeyRoleLinkSchema, KeyRolesCommand, type KeyRolesInput, LinkKeyPolicyCommand, type LinkKeyPolicyInput, LinkKeyRoleCommand, type LinkKeyRoleInput, LinkRolePolicyCommand, type LinkRolePolicyInput, LinkUserPolicyCommand, type LinkUserPolicyInput, LinkUserRoleCommand, type LinkUserRoleInput, type MarkdownDeltaChunk, type Message, NotFoundException, NotificationClient, type NotificationClientOptions, type NotificationEvent, type OidcClient, OrganizationPoliciesCommand, type OrganizationPoliciesInput, OrganizationRolesCommand, type OrganizationRolesInput, type Pagination, PaginationSchema, type PathwayConfig, type Permission, PermissionsListCommand, type PermissionsListInput, type Policy, PolicyArchiveCommand, type PolicyArchiveInput, type PolicyAssociations, PolicyAssociationsCommand, type PolicyAssociationsInput, PolicyAssociationsSchema, PolicyCreateCommand, type PolicyCreateInput, type PolicyFilter, PolicyFilterSchema, type PolicyFilterValue, PolicyFilterValueSchema, PolicyGetCommand, type PolicyGetInput, type PolicyKeyAssociation, PolicyKeyAssociationSchema, PolicyListCommand, type PolicyListInput, type PolicyRoleAssociation, PolicyRoleAssociationSchema, PolicySchema, type PolicyStatement, PolicyStatementSchema, PolicyUpdateCommand, type PolicyUpdateInput, type PolicyUserAssociation, PolicyUserAssociationSchema, PolicyValidateCommand, type PolicyValidateInput, type PolicyValidateResponse, PolicyValidateResponseSchema, type PumpConfig, type RemoveContextItemRequest, ResolveKeyEntitlementsCommand, type ResolveKeyEntitlementsInput, ResolveUserEntitlementsCommand, type ResolveUserEntitlementsInput, type Role, RoleArchiveCommand, type RoleArchiveInput, type RoleAssociations, RoleAssociationsCommand, type RoleAssociationsInput, RoleAssociationsSchema, RoleCreateCommand, type RoleCreateInput, RoleGetCommand, type RoleGetInput, type RoleKeyAssociation, RoleKeyAssociationSchema, RoleListCommand, type RoleListInput, RolePoliciesCommand, type RolePoliciesInput, type RolePolicyLink, RolePolicyLinkSchema, RoleSchema, RoleUpdateCommand, type RoleUpdateInput, type RoleUserAssociation, RoleUserAssociationSchema, type Secret, SecretCreateCommand, type SecretCreateInput, SecretDeleteCommand, type SecretDeleteInput, SecretEditCommand, type SecretEditInput, SecretFetchCommand, type SecretFetchInput, SecretListCommand, type SecretListInput, type SecurityCreatePAT, SecurityCreatePATCommand, type SecurityDeletePAT, SecurityDeletePATCommand, type SecurityDeletePATResponse, type SecurityExchangePAT, SecurityExchangePATCommand, type SecurityExchangePATResponse, type SecurityGetPAT, SecurityGetPATCommand, SecurityListPATCommand, SendPumpPulseCommand, type SendPumpPulseInput, type SensitiveDataDefinition, SensitiveDataDefinitionSchema, type ServiceAccount, ServiceAccountCreateCommand, type ServiceAccountCreateInput, ServiceAccountDeleteCommand, type ServiceAccountDeleteInput, ServiceAccountEditCommand, type ServiceAccountEditInput, ServiceAccountFetchCommand, type ServiceAccountFetchInput, ServiceAccountListCommand, type ServiceAccountListInput, ServiceAccountRotateSecretCommand, type ServiceAccountRotateSecretInput, type ServiceAccountSecretRotation, type ServiceAccountWithSecret, type StreamChunk, type TComputeDeploymentEvent, type TComputeDeploymentEventObject, type TComputeDomain, type TComputeDomainListResponse, type TComputeDomainStatus, type TComputeDomainTls, type TComputeDomainTlsStatus, type TComputeDomainVerification, type TComputeDomainVerificationType, type TComputeDomainVerifyResponse, type TComputeLogEntry, type TComputeLogStreamEvent, type TComputeLogStreamName, type TComputeNoContent, type TComputeOperation, type TComputeOperationDeploymentProgress, type TComputeOperationPhase, type TComputeOperationPreSyncProgress, type TComputeOperationProgress, type TComputeOperationStatus, type TComputeOperationStepStatus, type TComputeOperationType, type TComputePreSyncSpec, type TComputeProbe, type TComputeProbeExec, type TComputeProbeHttpGet, type TComputeProbeTcpSocket, type TComputeRegistry, type TComputeRegistryDetail, type TComputeRegistryDetailResponse, type TComputeRegistryListResponse, type TComputeRegistrySynthesisState, type TComputeSlotTier, type TComputeWorkload, type TComputeWorkloadCreateResponse, type TComputeWorkloadDefinition, type TComputeWorkloadDeleteResponse, type TComputeWorkloadDeploymentEvents, type TComputeWorkloadEnvVar, type TComputeWorkloadKind, type TComputeWorkloadListResponse, type TComputeWorkloadLogs, type TComputeWorkloadMutationResponse, type TComputeWorkloadProbes, type TComputeWorkloadResponse, type TComputeWorkloadRevision, type TComputeWorkloadRevisionCause, type TComputeWorkloadRevisionList, type TComputeWorkloadRun, type TComputeWorkloadRunKind, type TComputeWorkloadRunList, type TComputeWorkloadRunResponse, type TComputeWorkloadRunStatus, type TComputeWorkloadScaling, type TComputeWorkloadScalingMode, type TComputeWorkloadSecretRef, type TComputeWorkloadStatus, type TComputeWorkloadVolume, type Tenant, TenantAuditLogsCommand, type TenantAuditLogsInput, TenantCreateCommand, type TenantCreateInput, TenantDisableSensitiveDataCommand, type TenantDisableSensitiveDataInput, type TenantDisableSensitiveDataResponse, TenantEnableSensitiveDataCommand, type TenantEnableSensitiveDataInput, type TenantEnableSensitiveDataResponse, type TenantFetchByIdInput, type TenantFetchByNameInput, TenantFetchCommand, type TenantFetchInput, type TenantInstance, type TenantInstanceFetchByIdInput, type TenantInstanceFetchByNameInput, TenantInstanceFetchCommand, type TenantInstanceFetchInput, TenantListCommand, type TenantListInput, type TenantPreview, TenantPreviewCommand, type TenantPreviewInput, type TenantTranslateNameToId, TenantTranslateNameToIdCommand, type TenantTranslateNameToIdInput, TenantTranslateNameToIdSchema, TenantUpdateCommand, type TenantUpdateInput, TenantUserAddCommand, type TenantUserAddInput, TenantUserListCommand, type TenantUserListInput, type TenantUserListOutput, TenantUserRemoveCommand, type TenantUserRemoveInput, TimeBucketListCommand, type TimeBucketListInput, type TimeBucketListOutput, type TitleUpdateChunk, type ToolErrorChunk, type ToolInputChunk, type ToolOutputChunk, type ToolStartChunk, UnlinkKeyPolicyCommand, type UnlinkKeyPolicyInput, UnlinkKeyRoleCommand, type UnlinkKeyRoleInput, UnlinkRolePolicyCommand, type UnlinkRolePolicyInput, UnlinkUserPolicyCommand, type UnlinkUserPolicyInput, UnlinkUserRoleCommand, type UnlinkUserRoleInput, UserDeleteCommand, type UserDeleteInput, type UserDeleteOutput, UserInitializeInKeycloakCommand, type UserInitializeInKeycloakInput, type UserInitializeInKeycloakOutput, UserInviteToTenantCommand, type UserInviteToTenantInput, type UserInviteToTenantOutput, type UserPermission, UserPermissionSchema, UserPermissionsCommand, type UserPermissionsInput, UserPoliciesCommand, type UserPoliciesInput, type UserPolicyLink, UserPolicyLinkSchema, type UserRoleLink, UserRoleLinkSchema, UserRolesCommand, type UserRolesInput, type ValidPolicy, ValidPolicySchema, ValidateKeyCommand, type ValidateKeyInput, ValidateUserCommand, type ValidateUserInput, type ValidationMode, type ValidationRequestAccessItem, type ValidationResponse, ValidationResponseSchema, type Variable, VariableCreateCommand, type VariableCreateInput, VariableDeleteCommand, type VariableDeleteInput, VariableEditCommand, type VariableEditInput, VariableFetchCommand, type VariableFetchInput, VariableListCommand, type VariableListInput, type VirtualConfig, WebSocketClient, type WebSocketClientOptions, type WebSocketCommand, isEncryptedPayload, matchesPolicyFilters, parseEntitlementResponse, parseResponseHelper, permitsPayload, waitForComputeOperation };
