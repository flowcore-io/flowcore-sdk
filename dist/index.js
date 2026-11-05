import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { Subject, Observable } from 'rxjs';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/exceptions/command-error.ts
var CommandError;
var init_command_error = __esm({
  "src/exceptions/command-error.ts"() {
    CommandError = class extends Error {
      constructor(commandName, message) {
        super(`Command "${commandName}" failed with: ${message}`);
      }
    };
  }
});

// src/utils/local-cache.ts
var LocalCache;
var init_local_cache = __esm({
  "src/utils/local-cache.ts"() {
    LocalCache = class {
      constructor(defaultTtlMs) {
        this.defaultTtlMs = defaultTtlMs;
      }
      defaultTtlMs;
      cache = /* @__PURE__ */ new Map();
      timers = /* @__PURE__ */ new Map();
      get(key) {
        return this.cache.get(key);
      }
      set(key, value, ttlMs) {
        clearTimeout(this.timers.get(key));
        this.cache.set(key, value);
        if (ttlMs ?? this.defaultTtlMs) {
          const timer = setTimeout(() => this.cache.delete(key), ttlMs ?? this.defaultTtlMs);
          this.timers.set(key, timer);
        }
      }
      delete(key) {
        clearTimeout(this.timers.get(key));
        this.cache.delete(key);
      }
      clear() {
        for (const key of this.timers.keys()) {
          clearTimeout(this.timers.get(key));
        }
        this.cache.clear();
        this.timers.clear();
      }
    };
  }
});

// src/common/tenant.cache.ts
var tenantCache;
var init_tenant_cache = __esm({
  "src/common/tenant.cache.ts"() {
    init_local_cache();
    tenantCache = new LocalCache(60 * 1e3);
  }
});
var TenantSchema, TenantListItemSchema, TenantUserSchema, TenantPreviewSchema, TenantInstanceSchema;
var init_tenant = __esm({
  "src/contracts/tenant.ts"() {
    TenantSchema = Type.Object({
      id: Type.String(),
      name: Type.String(),
      displayName: Type.String(),
      description: Type.String(),
      websiteUrl: Type.String(),
      isDedicated: Type.Boolean(),
      dedicated: Type.Union([
        Type.Null(),
        Type.Object({
          status: Type.Union([
            Type.Literal("ready"),
            Type.Literal("degraded"),
            Type.Literal("offline")
          ]),
          configuration: Type.Object({
            domain: Type.String(),
            configurationRepoUrl: Type.String(),
            configurationRepoCredentials: Type.Union([Type.String(), Type.Null()])
          })
        })
      ]),
      sensitiveDataEnabled: Type.Optional(Type.Boolean())
    });
    TenantListItemSchema = Type.Object({
      id: Type.String(),
      name: Type.String(),
      displayName: Type.String(),
      description: Type.String(),
      websiteUrl: Type.String(),
      isDedicated: Type.Boolean(),
      sensitiveDataEnabled: Type.Boolean(),
      domain: Type.Union([Type.String(), Type.Null()]),
      permissions: Type.Array(Type.String())
    });
    TenantUserSchema = Type.Object({
      id: Type.String(),
      username: Type.String(),
      email: Type.String(),
      firstName: Type.Union([Type.String(), Type.Null()]),
      lastName: Type.Union([Type.String(), Type.Null()])
    });
    TenantPreviewSchema = Type.Object({
      displayName: Type.String(),
      websiteUrl: Type.String(),
      description: Type.String()
    });
    TenantInstanceSchema = Type.Object({
      isDedicated: Type.Boolean(),
      instance: Type.Union([
        Type.Null(),
        Type.Object({
          status: Type.String(),
          domain: Type.String()
        })
      ])
    });
  }
});

// src/exceptions/not-found.ts
var NotFoundException;
var init_not_found = __esm({
  "src/exceptions/not-found.ts"() {
    NotFoundException = class extends Error {
      constructor(resource, filters) {
        super(`${resource} not found: ${JSON.stringify(filters)}`);
      }
    };
  }
});

// src/exceptions/invalid-response.ts
var InvalidResponseException;
var init_invalid_response = __esm({
  "src/exceptions/invalid-response.ts"() {
    InvalidResponseException = class extends Error {
      constructor(message, errors) {
        const errorString = JSON.stringify(errors);
        super(`${message}: ${errorString.slice(0, 1e3)}`);
        this.errors = errors;
        this.errors = errors;
      }
      errors;
    };
  }
});
var parseResponseHelper;
var init_parse_response_helper = __esm({
  "src/utils/parse-response-helper.ts"() {
    init_invalid_response();
    parseResponseHelper = (schema, response) => {
      if (!Value.Check(schema, response)) {
        const parseErrors = Value.Errors(schema, response);
        const errors = {};
        for (const error of parseErrors) {
          errors[error.path] = error.message;
        }
        throw new InvalidResponseException("Invalid response", errors);
      }
      return response;
    };
  }
});

// src/commands/tenant/tenant-instance.fetch.ts
var tenant_instance_fetch_exports = {};
__export(tenant_instance_fetch_exports, {
  TenantInstanceFetchCommand: () => TenantInstanceFetchCommand
});
var TenantInstanceFetchCommand;
var init_tenant_instance_fetch = __esm({
  "src/commands/tenant/tenant-instance.fetch.ts"() {
    init_command();
    init_tenant();
    init_not_found();
    init_parse_response_helper();
    TenantInstanceFetchCommand = class extends Command {
      /**
       * Get the method
       */
      getMethod() {
        return "GET";
      }
      /**
       * Get the base url
       */
      getBaseUrl() {
        return "https://tenant.api.flowcore.io";
      }
      /**
       * Get the path
       */
      getPath() {
        if ("tenantId" in this.input && this.input.tenantId) {
          return `/api/v1/tenants/by-id/${this.input.tenantId}/instance`;
        }
        return `/api/v1/tenants/by-name/${this.input.tenant}/instance`;
      }
      /**
       * Parse the response
       */
      parseResponse(rawResponse) {
        return parseResponseHelper(TenantInstanceSchema, rawResponse);
      }
      /**
       * Handle the client error
       */
      handleClientError(error) {
        if (error.status === 404) {
          throw new NotFoundException("Tenant", {
            [this.input.tenantId ? "id" : "name"]: this.input.tenantId ?? this.input.tenant
          });
        }
        throw error;
      }
    };
  }
});

// src/common/command.ts
var Command;
var init_command = __esm({
  "src/common/command.ts"() {
    init_command_error();
    init_tenant_cache();
    Command = class {
      /**
       * Whether the command should retry on failure
       */
      retryOnFailure = true;
      /**
       * The dedicated subdomain for the command
       */
      dedicatedSubdomain;
      /**
       * The allowed modes for the command
       */
      allowedModes = ["apiKey", "bearer"];
      /**
       * The input for the command
       */
      input;
      /**
       * The client auth options
       */
      clientAuthOptions = {};
      constructor(input) {
        this.input = input;
      }
      /**
       * Set the client auth options - this is called by the FlowcoreClient
       * before executing the command
       */
      setClientAuthOptions(options) {
        Object.assign(this.clientAuthOptions, options);
      }
      /**
       * Get the dedicated base URL
       */
      async getDedicatedBaseUrl(client) {
        if (!this.dedicatedSubdomain) {
          return null;
        }
        const inputTenant = typeof this.input === "object" && this.input !== null && "tenant" in this.input && typeof this.input.tenant === "string" && this.input.tenant;
        if (!inputTenant) {
          return null;
        }
        let tenant = tenantCache.get(inputTenant);
        if (!tenant) {
          const { TenantInstanceFetchCommand: TenantInstanceFetchCommand2 } = await Promise.resolve().then(() => (init_tenant_instance_fetch(), tenant_instance_fetch_exports));
          tenant = await client.execute(new TenantInstanceFetchCommand2({ tenant: inputTenant }));
          tenantCache.set(inputTenant, tenant);
        }
        if (!tenant.isDedicated) {
          return null;
        }
        if (!tenant.instance?.domain) {
          throw new CommandError(this.constructor.name, `Tenant ${inputTenant} does not have a dedicated domain configured`);
        }
        return `https://${this.dedicatedSubdomain}.${tenant.instance.domain}`;
      }
      /**
       * Get the method for the request
       */
      getMethod() {
        return "POST";
      }
      /**
       * Get the path for the request
       */
      getPath() {
        return "/";
      }
      /**
       * Get the body for the request
       */
      getBody() {
        if (this.getMethod() === "GET") {
          return void 0;
        }
        return this.input ?? void 0;
      }
      /**
       * Get the headers for the request
       */
      getHeaders() {
        return typeof this.getBody() === "object" ? {
          "Content-Type": "application/json"
        } : {};
      }
      /**
       * Handle the client error
       */
      handleClientError(error) {
        throw error;
      }
      /**
       * Get the request object
       */
      async getRequest(client, direct) {
        return {
          allowedModes: this.allowedModes,
          body: this.getBody(),
          headers: this.getHeaders(),
          baseUrl: direct ? this.getBaseUrl() : await this.getDedicatedBaseUrl(client) ?? this.getBaseUrl(),
          path: this.getPath(),
          method: this.getMethod(),
          parseResponse: this.parseResponse.bind(this),
          processResponse: this.processResponse.bind(this),
          handleClientError: this.handleClientError.bind(this),
          retryOnFailure: this.retryOnFailure
        };
      }
      /**
       * Wait for the response
       */
      async processResponse(_client, response) {
        return response;
      }
    };
  }
});

// src/commands/ai-agent-coordinator/artifact-get.command.ts
init_command();
init_not_found();
init_parse_response_helper();
var ArtifactSchema = Type.Object({
  artifactId: Type.String({ example: "artifact_code_123" }),
  artifactType: Type.Union([
    Type.Literal("code"),
    Type.Literal("markdown"),
    Type.Literal("table"),
    Type.Literal("visualization"),
    Type.Literal("html"),
    Type.Literal("mermaid")
  ], { description: "Type of artifact" }),
  title: Type.String({ example: "Example Code Snippet" }),
  content: Type.Optional(Type.String({ description: "String content" })),
  data: Type.Optional(Type.Unknown({ description: "JSON data" })),
  url: Type.Optional(Type.String({ format: "uri", description: "URL content" }))
});
var ArtifactGetCommand = class extends Command {
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://ai-coordinator.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/artifacts/${this.input.artifactId}`;
  }
  getHeaders() {
    return {
      "Accept": "application/json"
    };
  }
  parseResponse(rawResponse) {
    const response = parseResponseHelper(ArtifactSchema, rawResponse);
    return response;
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Artifact", { id: this.input.artifactId });
    }
    throw error;
  }
};

// src/commands/ai-agent-coordinator/context-add-item.command.ts
init_command();
var service = "ai-coordinator";
var baseUrl = `https://${service}.api.flowcore.io`;
var ContextAddItemCommand = class extends Command {
  getBaseUrl() {
    return baseUrl;
  }
  getMethod() {
    return "POST";
  }
  getPath() {
    return `/api/v1/conversations/${this.input.conversationId}/context/add`;
  }
  getBody() {
    return { items: this.input.items };
  }
  // Headers will be handled by base class based on getBody()
  parseResponse(response) {
    const data = response;
    if (data?.context && Array.isArray(data.context)) {
      return data;
    } else {
      throw new Error("Invalid response format for ContextAddItemCommand");
    }
  }
};

// src/commands/ai-agent-coordinator/context-remove-item.command.ts
init_command();
var service2 = "ai-coordinator";
var baseUrl2 = `https://${service2}.api.flowcore.io`;
var ContextRemoveItemCommand = class extends Command {
  getBaseUrl() {
    return baseUrl2;
  }
  getMethod() {
    return "POST";
  }
  getPath() {
    return `/api/v1/conversations/${this.input.conversationId}/context/remove`;
  }
  getBody() {
    return { itemId: this.input.itemId };
  }
  parseResponse(response) {
    const data = response;
    if (data?.context && Array.isArray(data.context)) {
      return data;
    } else {
      throw new Error("Invalid response format for ContextRemoveItemCommand");
    }
  }
};

// src/commands/ai-agent-coordinator/conversation-delete.command.ts
init_command();
var service3 = "ai-coordinator";
var baseUrl3 = `https://${service3}.api.flowcore.io`;
var ConversationDeleteCommand = class extends Command {
  getBaseUrl() {
    return baseUrl3;
  }
  getMethod() {
    return "DELETE";
  }
  getPath() {
    return `/api/v1/conversations/${this.input.conversationId}`;
  }
  // No need to override getBody or getHeaders for DELETE with no body
  parseResponse(response) {
    const data = response;
    if (data?.message) {
      return data;
    } else {
      throw new Error("Invalid response format for ConversationDeleteCommand");
    }
  }
  // No specific error handling needed for DELETE beyond the base implementation (re-throw)
};

// src/commands/ai-agent-coordinator/conversation-get.command.ts
init_command();

// src/exceptions/client-error.ts
var ClientError = class extends Error {
  constructor(message, status, command, body) {
    super(`${command} failed with ${status}: ${body ? JSON.stringify(body) : message}`);
    this.status = status;
    this.command = command;
    this.body = body;
  }
  status;
  command;
  body;
};

// src/exceptions/index.ts
init_invalid_response();
init_not_found();
init_command_error();

// src/commands/ai-agent-coordinator/conversation-get.command.ts
var service4 = "ai-coordinator";
var baseUrl4 = `https://${service4}.api.flowcore.io`;
var ConversationGetCommand = class extends Command {
  getBaseUrl() {
    return baseUrl4;
  }
  getMethod() {
    return "GET";
  }
  getPath() {
    return `/api/v1/conversations/${this.input.conversationId}`;
  }
  parseResponse(response) {
    const data = response;
    if (data?.id) {
      return data;
    } else {
      throw new Error("Invalid response format for ConversationGetCommand");
    }
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException(
        "Conversation",
        { conversationId: this.input.conversationId }
      );
    }
    throw error;
  }
};

// src/commands/ai-agent-coordinator/conversation-list.command.ts
init_command();
var service5 = "ai-coordinator";
var baseUrl5 = `https://${service5}.api.flowcore.io`;
var ConversationListCommand = class extends Command {
  constructor() {
    super({});
  }
  getBaseUrl() {
    return baseUrl5;
  }
  getMethod() {
    return "GET";
  }
  getPath() {
    return `/api/v1/conversations`;
  }
  parseResponse(response) {
    const data = response;
    if (data && Array.isArray(data.conversations)) {
      return data.conversations;
    } else {
      throw new Error("Invalid response format for ConversationListCommand");
    }
  }
};

// src/commands/ai-agent-coordinator/conversation-stream.command.ts
var ConversationStreamCommand = class {
  config;
  constructor(config) {
    if (!config.conversationId) {
      throw new Error("conversationId is required in the config for ConversationStreamCommand");
    }
    this.config = config;
  }
  /** Get the configuration object for the command. */
  getConfig() {
    return this.config;
  }
  /** Get the base WebSocket URL. */
  getWebSocketBaseUrl() {
    return "wss://ai-coordinator.api.flowcore.io";
  }
  /** Get the WebSocket path segment. */
  getWebSocketPathSegment() {
    return `api/v1/stream/${this.config.conversationId ? `${this.config.conversationId}` : ""}`;
  }
  /** Serializer function for outgoing payloads. */
  serializeSendPayload(payload) {
    return JSON.stringify({
      type: "message",
      // Example type, adjust as needed
      payload
      // Send the original payload nested
    });
  }
};

// src/commands/tenant/tenant.disable-sensitive-data.ts
init_command();
init_not_found();
init_parse_response_helper();
var responseSchema = Type.Object({
  sensitiveDataEnabled: Type.Boolean()
});
var TenantDisableSensitiveDataCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/disable-sensitive-data`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        id: this.input.tenantId
      });
    }
    throw error;
  }
};

// src/commands/tenant/tenant.enable-sensitive-data.ts
init_command();
init_not_found();
init_parse_response_helper();
var responseSchema2 = Type.Object({
  sensitiveDataEnabled: Type.Boolean()
});
var TenantEnableSensitiveDataCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/enable-sensitive-data`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema2, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        id: this.input.tenantId
      });
    }
    throw error;
  }
};

// src/commands/tenant/tenant.create.ts
init_command();
init_tenant();
init_parse_response_helper();
var responseSchema3 = Type.Object({
  ...TenantSchema.properties,
  dedicated: Type.Union([
    Type.Null(),
    Type.Object({
      // parse as string to avoid SDK failures if new statuses are added
      status: Type.String(),
      configuration: Type.Object({
        domain: Type.String(),
        configurationRepoUrl: Type.String(),
        configurationRepoCredentials: Type.String()
      })
    })
  ]),
  configured: Type.Boolean(),
  sensitiveDataEnabled: Type.Boolean()
});
var TenantCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants`;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    const { tenantSlug, description, displayName } = this.input;
    return {
      tenant_slug: tenantSlug,
      ...description !== void 0 && { description },
      ...displayName !== void 0 && { displayName }
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema3, rawResponse);
    return response;
  }
};

// src/commands/tenant/tenant.fetch.ts
init_command();
init_tenant();
init_not_found();
init_parse_response_helper();
var responseSchema4 = Type.Object({
  ...TenantSchema.properties,
  dedicated: Type.Union([
    Type.Null(),
    Type.Object({
      // parse as string to prevent sdk to fail when new status are added
      status: Type.String(),
      configuration: Type.Object({
        domain: Type.String(),
        configurationRepoUrl: Type.String(),
        configurationRepoCredentials: Type.Union([Type.String(), Type.Null()])
      })
    })
  ])
});
var TenantFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    if ("tenantId" in this.input) {
      return `/api/v1/tenants/by-id/${this.input.tenantId}`;
    }
    return `/api/v1/tenants/by-name/${this.input.tenant}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema4, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        [this.input.tenantId ? "id" : "name"]: this.input.tenantId ?? this.input.tenant
      });
    }
    throw error;
  }
};

// src/commands/index.ts
init_tenant_instance_fetch();

// src/commands/tenant/tenant.list.ts
init_command();
init_tenant();
init_parse_response_helper();
var TenantListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const query = new URLSearchParams();
    if (this.input.page !== void 0) {
      query.set("page", this.input.page.toString());
    }
    if (this.input.limit !== void 0) {
      query.set("limit", this.input.limit.toString());
    }
    if (this.input.ids !== void 0) {
      const ids = Array.isArray(this.input.ids) ? this.input.ids.join(",") : this.input.ids;
      query.set("ids", ids);
    }
    const qs = query.toString();
    return qs ? `/api/v1/tenants/list?${qs}` : `/api/v1/tenants/list`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Array(TenantListItemSchema), rawResponse);
    return response;
  }
};

// src/commands/tenant/tenant.update.ts
init_command();
init_tenant();
init_command_error();
init_not_found();
init_parse_response_helper();
var responseSchema5 = Type.Object({
  ...TenantSchema.properties,
  dedicated: Type.Union([
    Type.Null(),
    Type.Object({
      // parse as string to prevent sdk to fail when new status are added
      status: Type.String(),
      configuration: Type.Object({
        domain: Type.String(),
        configurationRepoUrl: Type.String(),
        configurationRepoCredentials: Type.String()
      })
    })
  ]),
  configured: Type.Boolean(),
  sensitiveDataEnabled: Type.Boolean()
});
var TenantUpdateCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}`;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    const { tenantId: _tenantId, ...payload } = this.input;
    const updateFields = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== void 0)
    );
    if (Object.keys(updateFields).length === 0) {
      throw new CommandError(this.constructor.name, "No fields to update");
    }
    return updateFields;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema5, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", { id: this.input.tenantId });
    }
    throw error;
  }
};

// src/commands/tenant/tenant.user-add.ts
init_command();
init_parse_response_helper();
var TenantUserAddCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/add-user`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean()
      }),
      rawResponse
    );
    return response.success;
  }
};

// src/commands/tenant/tenant.user-remove.ts
init_command();
init_parse_response_helper();
var TenantUserRemoveCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/remove-user`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean()
      }),
      rawResponse
    );
    return response.success;
  }
};

// src/common/command-custom.ts
init_command();
var CustomCommand = class extends Command {
  /**
   * Get the base URL for the request
   */
  getBaseUrl() {
    return "NONE";
  }
  /**
   * Get the request object
   */
  async getRequest(client, direct) {
    return {
      ...await super.getRequest(client, direct),
      customExecute: this.customExecute.bind(this)
    };
  }
  /**
   * Parse the response
   */
  parseResponse(response) {
    return response;
  }
};

// src/commands/iam/tenant/user-managed-roles.ts
init_command();
init_parse_response_helper();
var TenantUserManagedRolesSchema = Type.Record(
  Type.String(),
  Type.Array(Type.String())
);
var TenantUserManagedRolesCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/user-managed-roles`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(TenantUserManagedRolesSchema, rawResponse);
    return response;
  }
};

// src/commands/tenant/tenant.user-list-inner.ts
init_command();
init_tenant();
init_parse_response_helper();
var TenantUserListInnerCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/users`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Array(TenantUserSchema), rawResponse);
    return response;
  }
};

// src/commands/tenant/tenant.user-list.ts
var TenantUserListCommand = class extends CustomCommand {
  /**
   * Custom execute method
   */
  async customExecute(client) {
    const usersCommand = new TenantUserListInnerCommand({
      tenantId: this.input.tenantId
    });
    const tenantUserManagedRolesCommand = new TenantUserManagedRolesCommand({
      tenantId: this.input.tenantId
    });
    const [users, tenantUserManagedRoles] = await Promise.all([
      client.execute(usersCommand),
      client.execute(tenantUserManagedRolesCommand)
    ]);
    return users.map((user) => ({
      ...user,
      managedRoles: tenantUserManagedRoles[user.id] || []
    }));
  }
};

// src/commands/tenant/tenant.translate-name-to-id.ts
init_command();
init_not_found();
init_parse_response_helper();
var TenantTranslateNameToIdSchema = Type.Object({
  id: Type.String(),
  name: Type.String()
});
var TenantTranslateNameToIdCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/translate-name-to-id/${this.input.tenant}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(TenantTranslateNameToIdSchema, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", {
        tenant: this.input.tenant
      });
    }
    throw error;
  }
};

// src/commands/tenant/tenant.preview.ts
init_command();
init_tenant();
init_not_found();
init_parse_response_helper();
var TenantPreviewCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/preview/${this.input.name}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(TenantPreviewSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Tenant", { name: this.input.name });
    }
    throw error;
  }
};

// src/commands/api-key/api-key.create.ts
init_command();
init_parse_response_helper();
var ApiKeySchema = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  maskedApiKey: Type.String(),
  createdAt: Type.String(),
  lastUsedAt: Type.Union([Type.String(), Type.Null()])
});
var ApiKeyWithValueSchema = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  maskedApiKey: Type.String(),
  createdAt: Type.String(),
  lastUsedAt: Type.Union([Type.String(), Type.Null()]),
  apiKey: Type.String()
});
var ApiKeyValidationSchema = Type.Object({
  valid: Type.Boolean(),
  apiKeyId: Type.Optional(Type.String()),
  tenantId: Type.Optional(Type.String())
});

// src/commands/api-key/api-key.create.ts
var ApiKeyCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/api-keys";
  }
  /**
   * The allowed modes for the command. Api-key mode requires tenant-store >=
   * the release that accepts AuthType.ApiKey on the api-key management routes;
   * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
   */
  allowedModes = ["apiKey", "bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ApiKeyWithValueSchema, rawResponse);
  }
};

// src/commands/api-key/api-key.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ApiKeyFetchCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/api-keys/${this.input.apiKeyId}`;
  }
  /**
   * The allowed modes for the command. Api-key mode requires tenant-store >=
   * the release that accepts AuthType.ApiKey on the api-key management routes;
   * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
   */
  allowedModes = ["apiKey", "bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ApiKeySchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("ApiKey", { id: this.input.apiKeyId });
    }
    throw error;
  }
};

// src/commands/api-key/api-key.edit.ts
init_command();
init_parse_response_helper();
var ApiKeyEditCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/api-keys/${this.input.apiKeyId}`;
  }
  /**
   * The allowed modes for the command. Api-key mode requires tenant-store >=
   * the release that accepts AuthType.ApiKey on the api-key management routes;
   * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
   */
  allowedModes = ["apiKey", "bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ApiKeySchema, rawResponse);
  }
};

// src/commands/api-key/api-key.delete.ts
init_command();
var ApiKeyDeleteCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/api-keys/${this.input.apiKeyId}`;
  }
  /**
   * The allowed modes for the command. Api-key mode requires tenant-store >=
   * the release that accepts AuthType.ApiKey on the api-key management routes;
   * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
   */
  allowedModes = ["apiKey", "bearer"];
  /**
   * Parse the response
   */
  parseResponse(_rawResponse) {
    return true;
  }
};

// src/commands/api-key/api-key.list.ts
init_command();
init_parse_response_helper();
var ApiKeyListCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/api-keys?tenantId=${this.input.tenantId}`;
  }
  /**
   * The allowed modes for the command. Api-key mode requires tenant-store >=
   * the release that accepts AuthType.ApiKey on the api-key management routes;
   * authorization is still gated by IAM grants on frn::<tenantId>:tenant.
   */
  allowedModes = ["apiKey", "bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(ApiKeySchema), rawResponse);
  }
};

// src/commands/api-key/api-key.validate.ts
init_command();
init_parse_response_helper();
var ApiKeyValidateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/api-keys/validate";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ApiKeyValidationSchema, rawResponse);
  }
};

// src/commands/api-key/api-key.validate-with-tenant-id.ts
init_command();
init_parse_response_helper();
var ApiKeyValidateWithTenantIdCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/api-keys/validate-with-tenant-id";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ApiKeyValidationSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-customer.resolve.ts
init_command();
Type.Union([
  Type.Literal("managed"),
  Type.Literal("self-hosted")
]);
Type.Record(
  Type.String(),
  Type.Optional(Type.String())
);
var AwsMarketplaceProductModeSchema = Type.Union([
  Type.Literal("basic"),
  Type.Literal("dedicated")
]);
var AwsMarketplaceCustomerSchema = Type.Object({
  customerId: Type.String(),
  productCode: Type.String(),
  accountId: Type.String(),
  metadata: Type.String(),
  productMode: AwsMarketplaceProductModeSchema
});
var AwsMarketplaceLinkSchema = Type.Object({
  linkingId: Type.String(),
  awsCustomerId: Type.String(),
  awsProductCode: Type.String(),
  awsAccountId: Type.String(),
  tenant: Type.Union([Type.String(), Type.Null()]),
  tenantId: Type.String(),
  contactInfo: Type.Union([Type.String(), Type.Null()]),
  productProperties: Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()]),
  linkedAt: Type.String()
});
var AwsMarketplaceCustomerResolveSchema = Type.Object({
  success: Type.Boolean(),
  customer: AwsMarketplaceCustomerSchema
});
var AwsMarketplaceLinkCreateSchema = Type.Object({
  success: Type.Boolean(),
  linkingId: Type.String(),
  status: Type.Literal("linked")
});
var AwsMarketplaceLinkListSchema = Type.Object({
  success: Type.Boolean(),
  links: Type.Array(AwsMarketplaceLinkSchema)
});
var AwsMarketplaceLinkFetchSchema = Type.Object({
  success: Type.Boolean(),
  link: AwsMarketplaceLinkSchema
});
var AwsMarketplaceLinkDeleteSchema = Type.Object({
  success: Type.Boolean(),
  linkingId: Type.String(),
  status: Type.Literal("unlinked")
});

// src/commands/aws-marketplace/aws-marketplace-customer.resolve.ts
init_parse_response_helper();
var AwsMarketplaceCustomerResolveCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   */
  retryOnFailure = false;
  /**
   * Get the method.
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url.
   */
  getBaseUrl() {
    return "https://subscription-2.api.flowcore.io";
  }
  /**
   * Get the path.
   */
  getPath() {
    return "/api/v1/aws-marketplace/customers/resolve";
  }
  /**
   * Parse the response.
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(AwsMarketplaceCustomerResolveSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.create.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   */
  retryOnFailure = false;
  /**
   * The allowed modes for the command.
   */
  allowedModes = ["bearer"];
  /**
   * Get the method.
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url.
   */
  getBaseUrl() {
    return "https://subscription-2.api.flowcore.io";
  }
  /**
   * Get the path.
   */
  getPath() {
    return "/api/v1/aws-marketplace/links";
  }
  /**
   * Parse the response.
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(AwsMarketplaceLinkCreateSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.delete.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkDeleteCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   */
  retryOnFailure = false;
  /**
   * The allowed modes for the command.
   */
  allowedModes = ["bearer"];
  /**
   * Get the method.
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url.
   */
  getBaseUrl() {
    return "https://subscription-2.api.flowcore.io";
  }
  /**
   * Get the path.
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.reason) queryParams.set("reason", this.input.reason);
    const query = queryParams.toString();
    return `/api/v1/aws-marketplace/links/${this.input.linkingId}${query ? `?${query}` : ""}`;
  }
  /**
   * Get the body.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response.
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(AwsMarketplaceLinkDeleteSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.fetch.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkFetchCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   */
  retryOnFailure = false;
  /**
   * The allowed modes for the command.
   */
  allowedModes = ["bearer"];
  /**
   * Get the method.
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url.
   */
  getBaseUrl() {
    return "https://subscription-2.api.flowcore.io";
  }
  /**
   * Get the path.
   */
  getPath() {
    return `/api/v1/aws-marketplace/links/${this.input.linkingId}`;
  }
  /**
   * Parse the response.
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(AwsMarketplaceLinkFetchSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.list.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkListCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   */
  retryOnFailure = false;
  /**
   * The allowed modes for the command.
   */
  allowedModes = ["bearer"];
  /**
   * Get the method.
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url.
   */
  getBaseUrl() {
    return "https://subscription-2.api.flowcore.io";
  }
  /**
   * Get the path.
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.tenant) queryParams.set("tenant", this.input.tenant);
    if (this.input.tenantId) queryParams.set("tenantId", this.input.tenantId);
    if (this.input.awsCustomerId) queryParams.set("awsCustomerId", this.input.awsCustomerId);
    if (this.input.awsProductCode) queryParams.set("awsProductCode", this.input.awsProductCode);
    return `/api/v1/aws-marketplace/links?${queryParams.toString()}`;
  }
  /**
   * Parse the response.
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(AwsMarketplaceLinkListSchema, rawResponse);
  }
};

// src/commands/secret/secret.create.ts
init_command();
init_parse_response_helper();
var SecretSchema = Type.Object({
  tenantId: Type.String(),
  key: Type.String(),
  description: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()])
});

// src/commands/secret/secret.create.ts
var SecretCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/secrets`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(SecretSchema, rawResponse);
  }
};

// src/commands/secret/secret.delete.ts
init_command();
var SecretDeleteCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/secrets/${this.input.key}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(_rawResponse) {
    return true;
  }
};

// src/commands/secret/secret.edit.ts
init_command();
init_parse_response_helper();
var SecretEditCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/secrets/${this.input.key}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(SecretSchema, rawResponse);
  }
};

// src/commands/secret/secret.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var SecretFetchCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/secrets/${this.input.key}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(SecretSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Secret", { tenantId: this.input.tenantId, key: this.input.key });
    }
    throw error;
  }
};

// src/commands/secret/secret.list.ts
init_command();
init_parse_response_helper();
var SecretListCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/secrets`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(SecretSchema), rawResponse);
  }
};

// src/commands/service-account/service-account.create.ts
init_command();
var ServiceAccountSchema = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  linkedUserId: Type.String(),
  clientId: Type.String(),
  isAdmin: Type.Boolean(),
  enabled: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()]),
  lastRotatedAt: Type.Union([Type.String(), Type.Null()])
});
var ServiceAccountWithSecretSchema = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  linkedUserId: Type.String(),
  clientId: Type.String(),
  isAdmin: Type.Boolean(),
  enabled: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()]),
  lastRotatedAt: Type.Union([Type.String(), Type.Null()]),
  clientSecret: Type.String()
});
var ServiceAccountSecretRotationSchema = Type.Object({
  id: Type.String(),
  clientId: Type.String(),
  clientSecret: Type.String()
});

// src/commands/service-account/service-account.create.ts
init_parse_response_helper();
var ServiceAccountCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/service-accounts";
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ServiceAccountWithSecretSchema, rawResponse);
  }
};

// src/commands/service-account/service-account.delete.ts
init_command();
var ServiceAccountDeleteCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/service-accounts/${this.input.serviceAccountId}`;
  }
  /**
   * Get the body
   */
  getBody() {
    return void 0;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse() {
    return true;
  }
};

// src/commands/service-account/service-account.edit.ts
init_command();
init_parse_response_helper();
var ServiceAccountEditCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/service-accounts/${this.input.serviceAccountId}`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      ...this.input.description !== void 0 ? { description: this.input.description } : {},
      ...this.input.enabled !== void 0 ? { enabled: this.input.enabled } : {}
    };
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ServiceAccountSchema, rawResponse);
  }
};

// src/commands/service-account/service-account.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ServiceAccountFetchCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/service-accounts/${this.input.serviceAccountId}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ServiceAccountSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("ServiceAccount", { id: this.input.serviceAccountId });
    }
    throw error;
  }
};

// src/commands/service-account/service-account.list.ts
init_command();
init_parse_response_helper();
var ServiceAccountListCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams({
      tenantId: this.input.tenantId
    });
    return `/api/v1/service-accounts?${queryParams.toString()}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(ServiceAccountSchema), rawResponse);
  }
};

// src/commands/service-account/service-account.rotate-secret.ts
init_command();
init_parse_response_helper();
var ServiceAccountRotateSecretCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/service-accounts/${this.input.serviceAccountId}/rotate-secret`;
  }
  /**
   * Get the body
   */
  getBody() {
    return void 0;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ServiceAccountSecretRotationSchema, rawResponse);
  }
};

// src/commands/variable/variable.create.ts
init_command();
init_parse_response_helper();
var VariableSchema = Type.Object({
  tenantId: Type.String(),
  key: Type.String(),
  description: Type.String(),
  value: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.Union([Type.String(), Type.Null()])
});

// src/commands/variable/variable.create.ts
var VariableCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/variables`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(VariableSchema, rawResponse);
  }
};

// src/commands/variable/variable.delete.ts
init_command();
var VariableDeleteCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/variables/${this.input.key}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse() {
    return true;
  }
};

// src/commands/variable/variable.edit.ts
init_command();
init_parse_response_helper();
var VariableEditCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/variables/${this.input.key}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(VariableSchema, rawResponse);
  }
};

// src/commands/variable/variable.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var VariableFetchCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/variables/${this.input.key}`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(VariableSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Variable", { tenantId: this.input.tenantId, key: this.input.key });
    }
    throw error;
  }
};

// src/commands/variable/variable.list.ts
init_command();
init_parse_response_helper();
var VariableListCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://tenant-store.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/tenants/${this.input.tenantId}/variables`;
  }
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(VariableSchema), rawResponse);
  }
};

// src/commands/data-core/data-core.create.ts
init_command();
var DataCoreSchema = Type.Object({
  /** Unique identifier for the data core */
  id: Type.String(),
  /** ID of the tenant that owns this data core */
  tenantId: Type.String(),
  /** Name of the tenant that owns this data core */
  tenant: Type.String(),
  /** Name of the data core */
  name: Type.String(),
  /** Description of the data core's purpose and contents */
  description: Type.String(),
  /** Access control setting - determines if the data core is public or private */
  accessControl: Type.Union([Type.Literal("public"), Type.Literal("private")]),
  /** Protection against accidental deletion */
  deleteProtection: Type.Boolean(),
  /** Indicates if the data core is currently being deleted */
  isDeleting: Type.Boolean(),
  /** Indicates if the data core is managed by Flowcore platform */
  isFlowcoreManaged: Type.Boolean()
});
var DataCoreWithAccessSchema = Type.Object({
  ...DataCoreSchema.properties,
  access: Type.Array(
    Type.Union([Type.Literal("read"), Type.Literal("write"), Type.Literal("fetch"), Type.Literal("ingest")])
  )
});

// src/commands/data-core/data-core.create.ts
init_parse_response_helper();
var DataCoreCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://data-core-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/data-cores`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(DataCoreSchema, rawResponse);
  }
};

// src/commands/data-core/data-core.exists.ts
init_command();
init_parse_response_helper();
var DataCoreExistsCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://data-core-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/data-cores/${this.input.dataCoreId}/exists`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Object({ exists: Type.Boolean() }), rawResponse);
    return response;
  }
};

// src/commands/data-core/data-core.fetch.ts
init_command();
init_parse_response_helper();
init_not_found();
function isDataCoreFetchByIdInput(input) {
  return "dataCoreId" in input;
}
function isDataCoreFetchByNameAndTenantIdInput(input) {
  return "tenantId" in input;
}
function isDataCoreFetchByNameAndTenantInput(input) {
  return "tenant" in input;
}
var DataCoreFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://data-core-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    if (isDataCoreFetchByIdInput(this.input)) {
      return `/api/v1/data-cores/${this.input.dataCoreId}`;
    }
    const queryParams = new URLSearchParams();
    if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
      queryParams.set("tenantId", this.input.tenantId);
    }
    if (isDataCoreFetchByNameAndTenantInput(this.input)) {
      queryParams.set("tenant", this.input.tenant);
    }
    queryParams.set("name", this.input.dataCore);
    return `/api/v1/data-cores?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    if (isDataCoreFetchByIdInput(this.input)) {
      const response2 = parseResponseHelper(DataCoreSchema, rawResponse);
      return response2;
    }
    const response = parseResponseHelper(Type.Array(DataCoreSchema), rawResponse);
    if (response.length === 0) {
      if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenantId: this.input.tenantId });
      } else {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenant: this.input.tenant });
      }
    }
    return response[0];
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      if (isDataCoreFetchByIdInput(this.input)) {
        throw new NotFoundException("DataCore", { id: this.input.dataCoreId });
      } else if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenantId: this.input.tenantId });
      } else {
        throw new NotFoundException("DataCore", { name: this.input.dataCore, tenant: this.input.tenant });
      }
    }
    throw error;
  }
};

// src/commands/data-core/data-core.list.ts
init_command();
init_parse_response_helper();
var responseSchema6 = Type.Object({
  ...DataCoreWithAccessSchema.properties,
  access: Type.Array(Type.String())
});
var DataCoreListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://data-core-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.tenantId) {
      queryParams.set("tenantId", this.input.tenantId);
    }
    if (this.input.tenant) {
      queryParams.set("tenant", this.input.tenant);
    }
    if (this.input.name) {
      queryParams.set("name", this.input.name);
    }
    if (this.input.page !== void 0) {
      queryParams.set("page", this.input.page.toString());
    }
    if (this.input.limit !== void 0) {
      queryParams.set("limit", this.input.limit.toString());
    }
    if (this.input.ids !== void 0) {
      const ids = Array.isArray(this.input.ids) ? this.input.ids.join(",") : this.input.ids;
      queryParams.set("ids", ids);
    }
    const qs = queryParams.toString();
    return qs ? `/api/v1/data-cores?${qs}` : "/api/v1/data-cores";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(responseSchema6), rawResponse);
  }
};

// src/commands/data-core/data-core.request-delete.ts
init_command();
init_parse_response_helper();
init_not_found();
var DataCoreRequestDeleteCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "delete-manager";
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://delete-manager.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/data-cores/${this.input.dataCoreId}/request-delete`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean()
      }),
      rawResponse
    );
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataCore", {
        "id": this.input.dataCoreId
      });
    }
    throw error;
  }
  /**
   * Wait for the response (timeout: 25 seconds)
   */
  async processResponse(client, response) {
    if (!this.input.waitForDelete) {
      return response;
    }
    const start = Date.now();
    while (Date.now() - start < 25e3) {
      const response2 = await client.execute(
        new DataCoreExistsCommand({
          dataCoreId: this.input.dataCoreId
        })
      );
      if (!response2.exists) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return response;
  }
};

// src/commands/data-core/data-core.update.ts
init_command();
init_parse_response_helper();
init_command_error();
var DataCoreUpdateCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://data-core-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/data-cores/${this.input.dataCoreId}`;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    const { dataCoreId: _dataCoreId, ...payload } = this.input;
    if (Object.keys(payload).length === 0) {
      throw new CommandError(this.constructor.name, "No fields to update");
    }
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(DataCoreSchema, rawResponse);
  }
};

// src/commands/flow-type/flow-type.create.ts
init_command();
var FlowTypeSchema = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  name: Type.String(),
  description: Type.String(),
  isDeleting: Type.Boolean()
});

// src/commands/flow-type/flow-type.create.ts
init_parse_response_helper();
var FlowTypeCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://flow-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/flow-types`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(FlowTypeSchema, rawResponse);
  }
};

// src/commands/flow-type/flow-type.exists.ts
init_command();
init_parse_response_helper();
var FlowTypeExistsCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://flow-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/flow-types/${this.input.flowTypeId}/exists`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Object({ exists: Type.Boolean() }), rawResponse);
    return response;
  }
};

// src/commands/flow-type/flow-type.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var FlowTypeFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://flow-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    if ("flowTypeId" in this.input) {
      return `/api/v1/flow-types/${this.input.flowTypeId}`;
    }
    const queryParams = new URLSearchParams();
    queryParams.set("dataCoreId", this.input.dataCoreId);
    queryParams.set("name", this.input.flowType);
    return `/api/v1/flow-types?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    if ("flowTypeId" in this.input) {
      const response2 = parseResponseHelper(FlowTypeSchema, rawResponse);
      return response2;
    }
    const response = parseResponseHelper(Type.Array(FlowTypeSchema), rawResponse);
    if (response.length === 0) {
      throw new NotFoundException("FlowType", { name: this.input.flowType });
    }
    return response[0];
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("FlowType", {
        [this.input.flowTypeId ? "id" : "name"]: this.input.flowTypeId ?? this.input.flowType
      });
    }
    throw error;
  }
};

// src/commands/flow-type/flow-type.list.ts
init_command();
init_parse_response_helper();
var FlowTypeListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://flow-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    queryParams.set("dataCoreId", this.input.dataCoreId);
    return `/api/v1/flow-types?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Array(FlowTypeSchema), rawResponse);
    return response;
  }
};

// src/commands/flow-type/flow-type.request-delete.ts
init_command();
init_not_found();
init_parse_response_helper();
var FlowTypeRequestDeleteCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "delete-manager";
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://delete-manager.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/flow-types/${this.input.flowTypeId}/request-delete`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean()
      }),
      rawResponse
    );
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("FlowType", {
        "id": this.input.flowTypeId
      });
    }
    throw error;
  }
  /**
   * Wait for the response (timeout: 25 seconds)
   */
  async processResponse(client, response) {
    if (!this.input.waitForDelete) {
      return response;
    }
    const start = Date.now();
    while (Date.now() - start < 25e3) {
      const response2 = await client.execute(
        new FlowTypeExistsCommand({
          flowTypeId: this.input.flowTypeId
        })
      );
      if (!response2.exists) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return response;
  }
};

// src/commands/flow-type/flow-type.update.ts
init_command();
init_parse_response_helper();
var FlowTypeUpdateCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://flow-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/flow-types/${this.input.flowTypeId}`;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    const { flowTypeId: _flowTypeId, ...payload } = this.input;
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(FlowTypeSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.create.ts
init_command();
var DetailedSensitiveDataFieldSchema = Type.Object({
  type: Type.Union([
    Type.Literal("string"),
    Type.Literal("number"),
    Type.Literal("boolean"),
    Type.Literal("object"),
    Type.Literal("array")
  ]),
  faker: Type.Optional(Type.String()),
  args: Type.Optional(Type.Array(Type.Unknown())),
  length: Type.Optional(Type.Number()),
  pattern: Type.Optional(Type.String()),
  redact: Type.Optional(
    Type.Object({
      char: Type.String({ minLength: 1, maxLength: 1 }),
      length: Type.Number({ minimum: 1 })
    })
  ),
  min: Type.Optional(Type.Number()),
  max: Type.Optional(Type.Number()),
  precision: Type.Optional(Type.Number()),
  count: Type.Optional(Type.Number()),
  items: Type.Optional(Type.Unknown()),
  properties: Type.Optional(
    Type.Record(
      Type.String(),
      Type.Unknown()
    )
  )
});
var SensitiveDataDefinitionSchema = Type.Union([
  Type.Literal(true),
  Type.Union([Type.Literal("string"), Type.Literal("number"), Type.Literal("boolean")]),
  DetailedSensitiveDataFieldSchema,
  Type.Record(Type.String(), Type.Unknown())
]);
var EventTypeSensitiveDataMaskSchema = Type.Object({
  key: Type.String(),
  schema: Type.Record(Type.String(), SensitiveDataDefinitionSchema)
});
Type.Array(
  Type.Object({
    path: Type.String(),
    definition: Type.Object({
      type: Type.Union([
        Type.Literal("string"),
        Type.Literal("number"),
        Type.Literal("boolean"),
        Type.Literal("object"),
        Type.Literal("array")
      ]),
      faker: Type.Optional(Type.String()),
      args: Type.Array(Type.Unknown()),
      length: Type.Optional(Type.Number()),
      pattern: Type.Optional(Type.String()),
      min: Type.Optional(Type.Number()),
      max: Type.Optional(Type.Number()),
      precision: Type.Optional(Type.Number()),
      count: Type.Optional(Type.Number()),
      items: Type.Optional(Type.Unknown()),
      properties: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      redact: Type.Optional(
        Type.Object({
          char: Type.String(),
          length: Type.Number()
        })
      )
    })
  })
);
var EventTypeSchema = Type.Object({
  /** Unique identifier for the event type */
  id: Type.String(),
  /** ID of the tenant that owns this event type */
  tenantId: Type.String(),
  /** ID of the data core this event type belongs to */
  dataCoreId: Type.String(),
  /** ID of the flow type this event type belongs to */
  flowTypeId: Type.String(),
  /** Name of the event type */
  name: Type.String(),
  /** Description of the event type */
  description: Type.String(),
  /** Indicates if the event type is currently being truncated */
  isTruncating: Type.Boolean(),
  /** Indicates if the event type is currently being deleted */
  isDeleting: Type.Boolean(),
  /** Creation timestamp */
  createdAt: Type.String(),
  /** Last update timestamp */
  updatedAt: Type.Union([Type.String(), Type.Null()]),
  /** SensitiveData mask configuration */
  sensitiveDataMask: Type.Optional(Type.Union([EventTypeSensitiveDataMaskSchema, Type.Null()])),
  /** Indicates if SensitiveData handling is enabled */
  sensitiveDataEnabled: Type.Optional(Type.Boolean())
});
Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  flowTypeId: Type.String(),
  eventTypeId: Type.String(),
  parentKey: Type.String(),
  key: Type.String(),
  type: Type.String(),
  application: Type.String(),
  createdAt: Type.String()
});
var EventTypeRemoveSensitiveDataSchema = Type.Object({
  success: Type.Boolean(),
  id: Type.String()
});
var EventTypeListRemovedSensitiveDataItemSchema = Type.Object({
  id: Type.String(),
  tenantId: Type.String(),
  dataCoreId: Type.String(),
  flowTypeId: Type.String(),
  eventTypeId: Type.String(),
  application: Type.String(),
  parentKey: Type.String(),
  key: Type.String(),
  type: Type.String(),
  createdAt: Type.String()
});
var EventTypeListRemovedSensitiveDataResponseSchema = Type.Object({
  data: Type.Array(EventTypeListRemovedSensitiveDataItemSchema),
  pagination: Type.Object({
    page: Type.Number(),
    pageSize: Type.Number(),
    hasNextPage: Type.Boolean(),
    hasPreviousPage: Type.Boolean()
  })
});

// src/commands/event-type/event-type.create.ts
init_parse_response_helper();
var EventTypeCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://event-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/event-types`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(EventTypeSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.exists.ts
init_command();
init_parse_response_helper();
var EventTypeExistsCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://event-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/event-types/${this.input.eventTypeId}/exists`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Object({ exists: Type.Boolean() }), rawResponse);
    return response;
  }
};

// src/commands/event-type/event-type.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var EventTypeFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://event-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    if ("eventTypeId" in this.input) {
      return `/api/v1/event-types/${this.input.eventTypeId}`;
    }
    const queryParams = new URLSearchParams();
    queryParams.set("flowTypeId", this.input.flowTypeId);
    queryParams.set("name", this.input.eventType);
    return `/api/v1/event-types?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    if ("eventTypeId" in this.input) {
      const response2 = parseResponseHelper(EventTypeSchema, rawResponse);
      return response2;
    }
    const response = parseResponseHelper(Type.Array(EventTypeSchema), rawResponse);
    if (response.length === 0) {
      throw new NotFoundException("EventType", { name: this.input.eventType });
    }
    return response[0];
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("EventType", {
        [this.input.eventTypeId ? "id" : "name"]: this.input.eventTypeId ?? this.input.eventType
      });
    }
    throw error;
  }
};

// src/commands/events/event.list.ts
init_command();
init_parse_response_helper();
var FlowcoreEventSchema = Type.Object({
  eventId: Type.String(),
  timeBucket: Type.String(),
  tenant: Type.String(),
  dataCoreId: Type.String(),
  flowType: Type.String(),
  eventType: Type.String(),
  metadata: Type.Record(Type.String(), Type.Unknown()),
  payload: Type.Record(Type.String(), Type.Unknown()),
  validTime: Type.String()
});

// src/commands/events/event.list.ts
var responseSchema7 = Type.Object({
  events: Type.Array(FlowcoreEventSchema),
  nextCursor: Type.Optional(Type.String())
});
var EventListCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "event-source";
  /**
   * Get the method for the request
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url for the request
   */
  getBaseUrl() {
    return "https://event-source.api.flowcore.io";
  }
  /**
   * Get the path for the request
   */
  getPath() {
    const query = new URLSearchParams();
    const eventTypeIds = Array.isArray(this.input.eventTypeId) ? this.input.eventTypeId : [this.input.eventTypeId];
    for (const eventTypeId of eventTypeIds) {
      query.append("eventTypeId", eventTypeId);
    }
    query.set("timeBucket", this.input.timeBucket);
    this.input.cursor && query.set("cursor", this.input.cursor.toString());
    this.input.pageSize && query.set("pageSize", this.input.pageSize.toString());
    this.input.fromEventId && query.set("fromEventId", this.input.fromEventId);
    this.input.afterEventId && query.set("afterEventId", this.input.afterEventId);
    this.input.toEventId && query.set("toEventId", this.input.toEventId);
    this.input.order && query.set("order", this.input.order);
    this.input.includeSensitiveData && query.set("includeSensitiveData", this.input.includeSensitiveData.toString());
    return `/api/v1/events?${query.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema7, rawResponse);
    return response;
  }
};

// src/commands/events/time-bucket.list.ts
init_command();
init_parse_response_helper();
var responseSchema8 = Type.Object({
  timeBuckets: Type.Array(Type.String()),
  nextCursor: Type.Optional(Type.Number())
});
var TimeBucketListCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "event-source";
  /**
   * Get the method for the request
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url for the request
   */
  getBaseUrl() {
    return "https://event-source.api.flowcore.io";
  }
  /**
   * Get the path for the request
   */
  getPath() {
    const queryParams = new URLSearchParams();
    const eventTypeIds = Array.isArray(this.input.eventTypeId) ? this.input.eventTypeId : [this.input.eventTypeId];
    for (const eventTypeId of eventTypeIds) {
      queryParams.append("eventTypeId", eventTypeId);
    }
    this.input.fromTimeBucket && queryParams.set("fromTimeBucket", this.input.fromTimeBucket);
    this.input.toTimeBucket && queryParams.set("toTimeBucket", this.input.toTimeBucket);
    this.input.order && queryParams.set("order", this.input.order);
    this.input.pageSize && queryParams.set("pageSize", this.input.pageSize.toString());
    this.input.cursor && queryParams.set("cursor", this.input.cursor.toString());
    return `/api/v1/time-buckets?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema8, rawResponse);
    return response;
  }
};

// src/commands/event-type/event-type.info.ts
var EventTypeInfoCommand = class extends CustomCommand {
  /**
   * Custom execute method
   */
  async customExecute(client) {
    const lastEventsLimit = this.input.limit ?? 5;
    const firstTimeBucketCommand = new TimeBucketListCommand({
      tenant: this.input.tenant,
      eventTypeId: this.input.eventTypeId,
      order: "asc",
      pageSize: 1
    });
    const lastTimeBucketCommand = new TimeBucketListCommand({
      tenant: this.input.tenant,
      eventTypeId: this.input.eventTypeId,
      order: "desc",
      pageSize: Math.max(lastEventsLimit, 100)
    });
    const [firstTimeBucketResponse, lastTimeBucketResponse] = await Promise.all([
      client.execute(firstTimeBucketCommand),
      client.execute(lastTimeBucketCommand)
    ]);
    const firstTimeBucket = firstTimeBucketResponse.timeBuckets[0];
    const lastTimeBucket = lastTimeBucketResponse.timeBuckets[0];
    if (!firstTimeBucket || !lastTimeBucket) {
      return {
        firstTimeBucket: void 0,
        lastTimeBucket: void 0,
        lastEvents: []
      };
    }
    const lastEvents = [];
    const minLastEventLimit = Math.max(lastEventsLimit, lastEventsLimit * 3);
    for (const timeBucket of lastTimeBucketResponse.timeBuckets) {
      let cursor;
      do {
        const eventListResponse = await client.execute(
          new EventListCommand({
            eventTypeId: this.input.eventTypeId,
            timeBucket,
            pageSize: minLastEventLimit - lastEvents.length,
            order: "desc",
            tenant: this.input.tenant,
            ...cursor && { cursor },
            ...this.input.includeSensitiveData && { includeSensitiveData: true }
          })
        );
        lastEvents.push(...eventListResponse.events);
        cursor = eventListResponse.nextCursor;
      } while (cursor && lastEvents.length < lastEventsLimit);
      if (lastEvents.length >= lastEventsLimit) {
        break;
      }
    }
    if (lastEvents.length > lastEventsLimit) {
      lastEvents.length = lastEventsLimit;
    }
    return {
      firstTimeBucket,
      lastTimeBucket,
      lastEvents
    };
  }
};

// src/commands/event-type/event-type.list-removed-sensitive-data.ts
init_command();
init_parse_response_helper();
var EventTypeListRemovedSensitiveDataCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://event-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    this.input.dataCoreId && queryParams.set("dataCoreId", this.input.dataCoreId);
    this.input.flowTypeId && queryParams.set("flowTypeId", this.input.flowTypeId);
    this.input.eventTypeId && queryParams.set("eventTypeId", this.input.eventTypeId);
    this.input.parentKey && queryParams.set("parentKey", this.input.parentKey);
    this.input.application && queryParams.set("application", this.input.application);
    this.input.page && queryParams.set("page", this.input.page.toString());
    this.input.pageSize && queryParams.set("pageSize", this.input.pageSize.toString());
    this.input.type && queryParams.set("type", this.input.type);
    this.input.sort && queryParams.set("sort", this.input.sort);
    this.input.createdAtFrom && queryParams.set("createdAtFrom", this.input.createdAtFrom);
    this.input.createdAtTo && queryParams.set("createdAtTo", this.input.createdAtTo);
    return `/api/v1/event-types/sensitive-data/${this.input.tenantId}?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(EventTypeListRemovedSensitiveDataResponseSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.list.ts
init_command();
init_parse_response_helper();
var EventTypeListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://event-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    queryParams.set("flowTypeId", this.input.flowTypeId);
    return `/api/v1/event-types?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Array(EventTypeSchema), rawResponse);
    return response;
  }
};

// src/commands/event-type/event-type.remove-sensitive-data.ts
init_command();
init_parse_response_helper();
var EventTypeRemoveSensitiveDataCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://event-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/event-types/sensitive-data/remove`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(EventTypeRemoveSensitiveDataSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.request-delete.ts
init_command();
init_not_found();
init_parse_response_helper();
var EventTypeRequestDeleteCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "delete-manager";
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://delete-manager.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/event-types/${this.input.eventTypeId}/request-delete`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean()
      }),
      rawResponse
    );
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("EventType", {
        [this.input.eventTypeId ? "id" : "name"]: this.input.eventTypeId ?? this.input.eventTypeId
      });
    }
    throw error;
  }
  /**
   * Wait for the response (timeout: 25 seconds)
   */
  async processResponse(client, response) {
    if (!this.input.waitForDelete) {
      return response;
    }
    const start = Date.now();
    while (Date.now() - start < 25e3) {
      const response2 = await client.execute(
        new EventTypeExistsCommand({
          eventTypeId: this.input.eventTypeId
        })
      );
      if (!response2.exists) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return response;
  }
};

// src/commands/event-type/event-type.request-truncate.ts
init_command();
init_not_found();
init_parse_response_helper();
var EventTypeRequestTruncateCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "delete-manager";
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://delete-manager.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/event-types/${this.input.eventTypeId}/request-truncate`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(
      Type.Object({
        success: Type.Boolean()
      }),
      rawResponse
    );
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("EventType", {
        [this.input.eventTypeId ? "id" : "name"]: this.input.eventTypeId ?? this.input.eventTypeId
      });
    }
    throw error;
  }
  /**
   * Wait for the response (timeout: 25 seconds)
   */
  async processResponse(client, response) {
    if (!this.input.waitForTruncate) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    const start = Date.now();
    while (Date.now() - start < 25e3) {
      const response2 = await client.execute(
        new EventTypeFetchCommand({
          eventTypeId: this.input.eventTypeId
        })
      );
      if (response2.isTruncating) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return response;
  }
};

// src/commands/event-type/event-type.update.ts
init_command();
init_parse_response_helper();
var EventTypeUpdateCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://event-type-2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/event-types/${this.input.eventTypeId}`;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    const { eventTypeId: _, ...payload } = this.input;
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(EventTypeSchema, rawResponse);
  }
};

// src/commands/ingestion/ingest.batch.ts
init_command();
init_parse_response_helper();
var responseSchema9 = Type.Object({
  eventIds: Type.Array(Type.String()),
  success: Type.Boolean()
});
var IngestBatchCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "webhook";
  allowedModes = ["apiKey"];
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url for the request
   */
  getBaseUrl() {
    if (this.input.tenantName === "flowcore") {
      return "https://flowcore.webhook.flowcore.io";
    }
    return "https://webhook.api.flowcore.io";
  }
  getHeaders() {
    const metadata = this.input.metadata && Object.keys(this.input.metadata).length > 0 ? this.input.metadata : void 0;
    if (metadata && this.input.ttl) {
      metadata["ttl-on/stored-event"] = "true";
    }
    if (metadata && this.input.isEphemeral) {
      metadata["do-not-archive-on/stored-event"] = "true";
    }
    const authHeader = this.clientAuthOptions.apiKey || null;
    return {
      "Content-Type": "application/json",
      ...this.input.flowcoreManaged && { "X-Flowcore-Managed": "true" },
      ...metadata && { "x-flowcore-metadata-json": btoa(JSON.stringify(metadata)) },
      ...this.input.eventTime && { "x-flowcore-event-time": this.input.eventTime },
      ...this.input.validTime && { "x-flowcore-valid-time": this.input.validTime },
      ...authHeader && { "Authorization": authHeader }
    };
  }
  /**
   * Get the path for the request
   */
  getPath() {
    return `/events/${this.input.tenantName}/${this.input.dataCoreId}/${this.input.flowTypeName}/${this.input.eventTypeName}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema9, rawResponse);
    return response;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    return this.input.events;
  }
};

// src/commands/ingestion/ingest.event.ts
init_command();
init_parse_response_helper();
var responseSchema10 = Type.Object({
  eventId: Type.String(),
  success: Type.Boolean()
});
var IngestEventCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "webhook";
  allowedModes = ["apiKey"];
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url for the request
   */
  getBaseUrl() {
    if (this.input.tenantName === "flowcore") {
      return "https://flowcore.webhook.flowcore.io";
    }
    return "https://webhook.api.flowcore.io";
  }
  getHeaders() {
    const metadata = this.input.metadata && Object.keys(this.input.metadata).length > 0 ? this.input.metadata : void 0;
    if (metadata && this.input.ttl) {
      metadata["ttl-on/stored-event"] = "true";
    }
    if (metadata && this.input.isEphemeral) {
      metadata["do-not-archive-on/stored-event"] = "true";
    }
    const authHeader = this.clientAuthOptions.apiKey || null;
    return {
      "Content-Type": "application/json",
      ...this.input.flowcoreManaged && { "X-Flowcore-Managed": "true" },
      ...metadata && { "x-flowcore-metadata-json": btoa(JSON.stringify(metadata)) },
      ...this.input.eventTime && { "x-flowcore-event-time": this.input.eventTime },
      ...this.input.validTime && { "x-flowcore-valid-time": this.input.validTime },
      ...authHeader && { "Authorization": authHeader }
    };
  }
  /**
   * Get the path for the request
   */
  getPath() {
    return `/event/${this.input.tenantName}/${this.input.dataCoreId}/${this.input.flowTypeName}/${this.input.eventTypeName}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema10, rawResponse);
    return response;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    return this.input.eventData;
  }
};

// src/commands/events/events.fetch-time-buckets-by-names.ts
init_command();
init_parse_response_helper();
var responseSchema11 = Type.Object({
  timeBuckets: Type.Array(Type.String()),
  nextCursor: Type.Optional(Type.Number())
});
var EventsFetchTimeBucketsByNamesCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "event-source";
  /**
   * Get the base url for the request
   */
  getBaseUrl() {
    return "https://event-source.api.flowcore.io";
  }
  /**
   * Get the path for the request
   */
  getPath() {
    return "/api/v1/time-buckets/by-names";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema11, rawResponse);
    return response;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    const { ...rest } = this.input;
    return rest;
  }
};

// src/commands/events/events.fetch.ts
init_command();
init_parse_response_helper();
var responseSchema12 = Type.Object({
  events: Type.Array(FlowcoreEventSchema),
  nextCursor: Type.Optional(Type.String())
});
var EventsFetchCommand = class extends Command {
  /**
   * The dedicated subdomain for the command
   */
  dedicatedSubdomain = "event-source";
  /**
   * Get the base url for the request
   */
  getBaseUrl() {
    return "https://event-source.api.flowcore.io";
  }
  /**
   * Get the path for the request
   */
  getPath() {
    const query = {
      ...this.input.cursor ? { cursor: this.input.cursor.toString() } : {},
      ...this.input.pageSize ? { pageSize: this.input.pageSize.toString() } : {},
      ...this.input.fromEventId ? { fromEventId: this.input.fromEventId } : {},
      ...this.input.afterEventId ? { afterEventId: this.input.afterEventId } : {},
      ...this.input.toEventId ? { toEventId: this.input.toEventId } : {},
      ...this.input.includeSensitiveData ? { includeSensitiveData: this.input.includeSensitiveData.toString() } : {}
    };
    return `/api/v1/events?${new URLSearchParams(query).toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema12, rawResponse);
    return response;
  }
  /**
   * Get the body for the request
   */
  getBody() {
    return {
      tenant: this.input.tenant,
      dataCoreId: this.input.dataCoreId,
      flowType: this.input.flowType,
      eventTypes: this.input.eventTypes,
      timeBucket: this.input.timeBucket
    };
  }
};

// src/commands/container-registry/container-registry.create.ts
init_command();
var ContainerRegistrySchema = Type.Object({
  tenantId: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  username: Type.Optional(Type.String()),
  id: Type.String()
});
var ContainerRegistryCreateSchema = Type.Object({
  id: Type.String()
});
var ContainerRegistryDeleteSchema = Type.Object({
  status: Type.Number()
});
var ContainerRegistryListSchema = Type.Array(ContainerRegistrySchema);

// src/commands/container-registry/container-registry.create.ts
init_parse_response_helper();
var ContainerRegistryCreateCommand = class extends Command {
  /**
   * GET the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://registry.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/container`;
  }
  /**
   * Parse the response
   */
  parseResponse(response) {
    return parseResponseHelper(ContainerRegistryCreateSchema, response);
  }
};

// src/commands/container-registry/container-registry.delete.ts
init_command();
init_parse_response_helper();
var ContainerRegistryDeleteCommand = class extends Command {
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://registry.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/container/${this.input.containerId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(response) {
    return parseResponseHelper(ContainerRegistryDeleteSchema, response);
  }
};

// src/commands/container-registry/container-registry.fetch.ts
init_command();
init_parse_response_helper();
var ContainerRegistryFetchCommand = class extends Command {
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://registry.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/container/${this.input.containerId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(response) {
    return parseResponseHelper(ContainerRegistrySchema, response);
  }
};

// src/commands/container-registry/container-registry.list.ts
init_command();
init_parse_response_helper();
var ContainerRegistListCommand = class extends Command {
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://registry.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/container/tenants/${this.input.tenantId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(response) {
    return parseResponseHelper(ContainerRegistryListSchema, response);
  }
};

// src/commands/container-registry/container-registry.update.ts
init_command();
init_parse_response_helper();
var ContainerRegistryUpdateCommand = class extends Command {
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://registry.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/container/${this.input.containerId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(response) {
    return parseResponseHelper(ContainerRegistrySchema, response);
  }
};

// src/commands/security/pat.create.ts
init_command();
var PATSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  token: Type.Optional(Type.String()),
  createdAt: Type.String()
});

// src/commands/security/pat.create.ts
init_parse_response_helper();
var SecurityCreatePATCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://security2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/pat`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(PATSchema, rawResponse);
  }
};

// src/commands/security/pat.delete.ts
init_command();
init_parse_response_helper();
var SecurityDeletePATCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://security2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/pat/${this.input.id}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(
      Type.Object({
        success: Type.Boolean()
      }),
      rawResponse
    );
  }
};

// src/commands/security/pat.exchange.ts
init_command();
init_parse_response_helper();
var SecurityExchangePATCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://security2.api.flowcore.io";
  }
  getHeaders() {
    const headers = super.getHeaders();
    headers["x-flowcore-pat"] = this.input.pat;
    return headers;
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/pat/exchange/${this.input.username}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(
      Type.Object({
        accessToken: Type.String()
      }),
      rawResponse
    );
  }
};

// src/commands/security/pat.get.ts
init_command();
init_parse_response_helper();
var SecurityGetPATCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://security2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/pat/${this.input.id}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(PATSchema, rawResponse);
  }
};

// src/commands/security/pat.list.ts
init_command();
init_parse_response_helper();
var SecurityListPATCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://security2.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/pat`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(PATSchema), rawResponse);
  }
};

// src/commands/security/permissions.list.ts
init_command();
init_parse_response_helper();
var PermissionSchema = Type.Object({
  tenant: Type.String(),
  type: Type.String(),
  id: Type.String(),
  action: Type.Array(
    Type.Union([
      Type.Literal("read"),
      Type.Literal("write"),
      Type.Literal("ingest"),
      Type.Literal("fetch"),
      Type.Literal("sensitive-data-fetch"),
      Type.String()
    ])
  )
});

// src/commands/security/permissions.list.ts
var responseSchema13 = Type.Object({
  ...PermissionSchema.properties,
  // parse as string to prevent sdk to fail when new actions are added
  action: Type.Array(Type.String())
});
var PermissionsListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.type) {
      queryParams.set("type", this.input.type);
    }
    return `/api/v1/permissions?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(Type.Array(responseSchema13), rawResponse);
    return response;
  }
};

// src/commands/user/user.initialize-in-keycloak.ts
init_command();
init_parse_response_helper();
var responseSchema14 = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String()
});
var UserInitializeInKeycloakCommand = class extends Command {
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Get the base URL for the request
   */
  getBaseUrl() {
    return "https://user-2.api.flowcore.io";
  }
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the path for the request
   */
  getPath() {
    return "/api/users";
  }
  /**
   * Get the body for the request (must be an empty JSON object)
   */
  getBody() {
    return {
      // intentionally empty
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema14, rawResponse);
    return response;
  }
};

// src/commands/user/user.delete.ts
init_command();
init_parse_response_helper();
var responseSchema15 = Type.Object({
  id: Type.String()
});
var UserDeleteCommand = class extends Command {
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Get the base URL for the request
   */
  getBaseUrl() {
    return "https://user-2.api.flowcore.io";
  }
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the path for the request
   */
  getPath() {
    return `/api/users`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema15, rawResponse);
    return response;
  }
};

// src/commands/user/user.invite-to-tenant.ts
init_command();
init_parse_response_helper();
var responseSchema16 = Type.Object({
  success: Type.Boolean(),
  tenantName: Type.String(),
  invitedEmail: Type.String()
});
var UserInviteToTenantCommand = class extends Command {
  /**
   * The allowed modes for the command
   */
  allowedModes = ["bearer"];
  /**
   * Get the base URL for the request
   */
  getBaseUrl() {
    return "https://user-2.api.flowcore.io";
  }
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the path for the request
   */
  getPath() {
    return "/api/users/invitations";
  }
  /**
   * Get the body for the request
   */
  getBody() {
    return {
      tenantName: this.input.tenantName,
      userEmail: this.input.userEmail
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = parseResponseHelper(responseSchema16, rawResponse);
    return response;
  }
};

// src/commands/data-pathways/assignment.complete.ts
init_command();
var DataPathwayAssignmentCompleteCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/complete`;
  }
  parseResponse(_rawResponse) {
    return null;
  }
};

// src/commands/data-pathways/assignment.expire-leases.ts
init_command();
var SizeClassEnum = Type.Union([Type.Literal("small"), Type.Literal("medium"), Type.Literal("high")]);
var EndpointConfigSchema = Type.Object({
  url: Type.String(),
  authHeaders: Type.Optional(Type.Record(Type.String(), Type.String()))
});
var BackoffConfigSchema = Type.Optional(
  Type.Object({
    initialMs: Type.Optional(Type.Integer()),
    maxMs: Type.Optional(Type.Integer()),
    multiplier: Type.Optional(Type.Number())
  })
);
var TimeoutConfigSchema = Type.Optional(
  Type.Object({
    deliveryMs: Type.Optional(Type.Integer()),
    fetchMs: Type.Optional(Type.Integer())
  })
);
var SourceConfigSchema = Type.Object({
  id: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  flowType: Type.String(),
  eventTypes: Type.Array(Type.String()),
  endpoints: Type.Array(EndpointConfigSchema),
  batchSize: Type.Optional(Type.Integer()),
  maxInFlight: Type.Optional(Type.Integer()),
  backoff: BackoffConfigSchema,
  timeouts: TimeoutConfigSchema
});
var DataSourceConfigSchema = Type.Object({
  tenant: Type.String(),
  dataCore: Type.String()
});
var AuthConfigSchema = Type.Object({
  apiKey: Type.String()
});
var PathwayConfigSchema = Type.Object({
  sources: Type.Array(SourceConfigSchema)
});
var PumpConfigSchema = Type.Object({
  sources: Type.Array(SourceConfigSchema),
  dataSource: DataSourceConfigSchema,
  auth: Type.Optional(AuthConfigSchema)
});
var PathwayTypeSchema = Type.Optional(Type.Union([Type.Literal("managed"), Type.Literal("virtual")]));
var VirtualConfigSchema = Type.Object({
  flowTypes: Type.Optional(Type.Array(Type.String()))
});
var DeliveryStateSchema = Type.Union([Type.Literal("active"), Type.Literal("paused")]);
var DataPathwaySchema = Type.Object({
  id: Type.String(),
  tenant: Type.String(),
  name: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dataCore: Type.String(),
  sizeClass: SizeClassEnum,
  type: PathwayTypeSchema,
  enabled: Type.Boolean(),
  priority: Type.Integer(),
  version: Type.Integer(),
  labels: Type.Record(Type.String(), Type.String()),
  config: Type.Optional(PathwayConfigSchema),
  virtualConfig: Type.Optional(VirtualConfigSchema),
  deliveryState: Type.Optional(DeliveryStateSchema),
  deliveryPauseTargets: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  createdAt: Type.String(),
  updatedAt: Type.String()
});
var DataPathwayListSchema = Type.Object({
  pathways: Type.Array(DataPathwaySchema),
  total: Type.Integer()
});
var DataPathwayMutationResponseSchema = Type.Object({
  pathwayId: Type.String(),
  status: Type.String(),
  apiKey: Type.Optional(Type.String())
});
var DataPathwaySlotSchema = Type.Object({
  id: Type.String(),
  podUnitId: Type.String(),
  class: SizeClassEnum,
  labels: Type.Record(Type.String(), Type.String()),
  lastSeen: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String()
});
var DataPathwaySlotListSchema = Type.Object({
  slots: Type.Array(DataPathwaySlotSchema),
  total: Type.Integer()
});
var DataPathwaySlotMutationResponseSchema = Type.Object({
  slotId: Type.String(),
  status: Type.String()
});
var DataPathwayAssignmentSchema = Type.Object({
  id: Type.String(),
  pathwayId: Type.String(),
  slotId: Type.String(),
  generation: Type.Integer(),
  leaseTTL: Type.String(),
  status: Type.String(),
  config: PumpConfigSchema,
  createdAt: Type.String(),
  updatedAt: Type.String()
});
var AssignmentNextInnerSchema = Type.Object({
  assignmentId: Type.String(),
  pathwayId: Type.String(),
  slotId: Type.String(),
  generation: Type.Integer(),
  config: PumpConfigSchema,
  leaseTTL: Type.String(),
  status: Type.String()
});
var DataPathwayAssignmentNextSchema = Type.Object({
  assignment: Type.Union([AssignmentNextInnerSchema, Type.Null()])
});
var DataPathwayAssignmentListSchema = Type.Object({
  assignments: Type.Array(DataPathwayAssignmentSchema),
  total: Type.Integer()
});
var DataPathwayExpireLeasesResponseSchema = Type.Object({
  expired: Type.Integer()
});
var DataPathwayCommandSchema = Type.Object({
  id: Type.String(),
  restartRequestId: Type.Union([Type.String(), Type.Null()]),
  assignmentId: Type.String(),
  type: Type.String(),
  generation: Type.Integer(),
  position: Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
  stopAt: Type.Union([Type.String(), Type.Null()]),
  timeoutMs: Type.Union([Type.Integer(), Type.Null()]),
  phase: Type.String(),
  reason: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String()
});
var DataPathwayCommandListSchema = Type.Object({
  commands: Type.Array(DataPathwayCommandSchema)
});
var DataPathwayCommandResponseSchema = Type.Object({
  commandId: Type.String(),
  phase: Type.String()
});
var DataPathwayCommandDetailSchema = Type.Object({
  id: Type.String(),
  restartRequestId: Type.Union([Type.String(), Type.Null()]),
  assignmentId: Type.Union([Type.String(), Type.Null()]),
  pathwayId: Type.Union([Type.String(), Type.Null()]),
  type: Type.String(),
  generation: Type.Union([Type.Integer(), Type.Null()]),
  position: Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
  stopAt: Type.Union([Type.String(), Type.Null()]),
  timeoutMs: Type.Union([Type.Integer(), Type.Null()]),
  phase: Type.String(),
  reason: Type.Union([Type.String(), Type.Null()]),
  details: Type.Union([Type.String(), Type.Null()]),
  config: Type.Union([Type.Record(Type.String(), Type.Unknown()), Type.Null()]),
  sourceFlowTypes: Type.Union([Type.Array(Type.String()), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String()
});
var DataPathwayRestartRequestResponseSchema = Type.Object({
  restartRequestId: Type.String(),
  acceptedTargets: Type.Array(Type.String()),
  skippedTargets: Type.Array(Type.String())
});
var DataPathwayRestartRequestSchema = Type.Object({
  id: Type.String(),
  targets: Type.Record(Type.String(), Type.Unknown()),
  mode: Type.String(),
  position: Type.Record(Type.String(), Type.Unknown()),
  status: Type.String(),
  requestedBy: Type.String(),
  reason: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String()
});
var SlotCountSchema = Type.Object({
  free: Type.Integer(),
  used: Type.Integer()
});
var ThreeClassIntegersSchema = Type.Object({
  small: Type.Integer(),
  medium: Type.Integer(),
  high: Type.Integer()
});
var DataPathwayCapacitySchema = Type.Object({
  slots: Type.Object({
    small: SlotCountSchema,
    medium: SlotCountSchema,
    high: SlotCountSchema
  }),
  pendingAssignments: ThreeClassIntegersSchema
});
var DataPathwayQuotaSchema = Type.Object({
  tenant: Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  createdAt: Type.String(),
  updatedAt: Type.String()
});
var DataPathwayQuotaWithUsageSchema = Type.Object({
  tenant: Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  used: ThreeClassIntegersSchema
});
var DataPathwayQuotaListSchema = Type.Object({
  quotas: Type.Array(DataPathwayQuotaSchema),
  total: Type.Integer()
});
var DataPathwayQuotaSetResponseSchema = Type.Object({
  tenant: Type.String(),
  status: Type.String()
});
var PumpStateValueSchema = Type.Object({
  timeBucket: Type.String(),
  eventId: Type.Optional(Type.String())
});
var DataPathwayPumpStateSchema = Type.Object({
  pathwayId: Type.String(),
  flowType: Type.String(),
  state: Type.Union([PumpStateValueSchema, Type.Null()])
});
var DataPathwayPumpStateBySourceSchema = Type.Object({
  pathwayId: Type.String(),
  sourceId: Type.String(),
  flowType: Type.Union([Type.String(), Type.Null()]),
  state: Type.Union([PumpStateValueSchema, Type.Null()])
});
var DataPathwayPumpStateSaveResponseSchema = Type.Object({
  status: Type.String()
});
var DataPathwayDeliveryLogEntrySchema = Type.Object({
  id: Type.String(),
  pathwayId: Type.String(),
  assignmentId: Type.String(),
  endpointUrl: Type.String(),
  httpStatus: Type.Union([Type.Integer(), Type.Null()]),
  success: Type.Boolean(),
  batchSize: Type.Union([Type.Integer(), Type.Null()]),
  durationMs: Type.Union([Type.Integer(), Type.Null()]),
  errorMessage: Type.Union([Type.String(), Type.Null()]),
  responseBody: Type.Union([Type.String(), Type.Null()]),
  flowType: Type.Union([Type.String(), Type.Null()]),
  sourceId: Type.Union([Type.String(), Type.Null()]),
  eventType: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String()
});
var DataPathwayDeliveryLogListSchema = Type.Object({
  entries: Type.Array(DataPathwayDeliveryLogEntrySchema),
  total: Type.Integer()
});
Type.Object({
  pathwayId: Type.String(),
  assignmentId: Type.String(),
  endpointUrl: Type.String(),
  flowType: Type.Optional(Type.String()),
  sourceId: Type.Optional(Type.String()),
  eventType: Type.Optional(Type.String()),
  httpStatus: Type.Optional(Type.Integer()),
  success: Type.Boolean(),
  batchSize: Type.Optional(Type.Integer()),
  durationMs: Type.Optional(Type.Integer()),
  errorMessage: Type.Optional(Type.String()),
  responseBody: Type.Optional(Type.String())
});
var DataPathwayDeliveryLogBatchResponseSchema = Type.Object({
  inserted: Type.Integer()
});
var ThroughputRecentResultSchema = Type.Object({
  status: Type.Number(),
  durationMs: Type.Number(),
  success: Type.Boolean(),
  ageMs: Type.Number()
});
var ThroughputSourceSchema = Type.Object({
  flowType: Type.String(),
  name: Type.Optional(Type.String()),
  eventsPerSecond: Type.Number(),
  successRate: Type.Number(),
  avgDurationMs: Type.Number(),
  totalDelivered: Type.Number(),
  totalFailed: Type.Number(),
  lastDeliveryAgeMs: Type.Union([Type.Number(), Type.Null()]),
  healthy: Type.Boolean(),
  recentResults: Type.Array(ThroughputRecentResultSchema)
});
var ThroughputEndpointSchema = Type.Object({
  eventsPerSecond: Type.Number(),
  successRate: Type.Number(),
  totalDelivered: Type.Number(),
  totalFailed: Type.Number(),
  lastDeliveryAgeMs: Type.Union([Type.Number(), Type.Null()]),
  healthy: Type.Boolean(),
  sources: Type.Record(Type.String(), ThroughputSourceSchema)
});
var ThroughputSnapshotSchema = Type.Object({
  global: Type.Object({
    eventsPerSecond: Type.Number(),
    totalRecorded: Type.Number(),
    windowSeconds: Type.Number()
  }),
  endpoints: Type.Record(Type.String(), ThroughputEndpointSchema)
});
var MetricsAssignmentEntrySchema = Type.Object({
  assignmentId: Type.String(),
  status: Type.String(),
  throughput: Type.Union([ThroughputSnapshotSchema, Type.Null()]),
  updatedAt: Type.String()
});
var DataPathwayMetricsSchema = Type.Object({
  pathwayId: Type.String(),
  assignments: Type.Array(MetricsAssignmentEntrySchema)
});
var DataPathwayHealthSchema = Type.Object({
  status: Type.Union([Type.Literal("healthy"), Type.Literal("unhealthy")]),
  checks: Type.Object({ db: Type.Union([Type.Literal("ok"), Type.Literal("error")]) }),
  uptime: Type.Number()
});
var DataPathwayPumpPulseResponseSchema = Type.Object({
  status: Type.String()
});
var PumpPulseEntrySchema = Type.Object({
  flowType: Type.String(),
  timeBucket: Type.String(),
  eventId: Type.Union([Type.String(), Type.Null()]),
  isLive: Type.Boolean(),
  buffer: Type.Object({
    depth: Type.Number(),
    reserved: Type.Number(),
    sizeBytes: Type.Number()
  }),
  counters: Type.Object({
    acknowledged: Type.Number(),
    failed: Type.Number(),
    pulled: Type.Number()
  }),
  uptimeMs: Type.Number(),
  lastPulseAgeMs: Type.Number(),
  healthy: Type.Boolean()
});
var PumpStatusAssignmentSchema = Type.Object({
  id: Type.String(),
  status: Type.String(),
  leaseRemainingMs: Type.Number(),
  lastHeartbeatAgeMs: Type.Number(),
  metrics: Type.Unknown()
});
var DataPathwayPumpStatusSchema = Type.Object({
  pathwayId: Type.String(),
  pulses: Type.Array(PumpPulseEntrySchema),
  assignment: Type.Union([PumpStatusAssignmentSchema, Type.Null()])
});

// src/commands/data-pathways/assignment.expire-leases.ts
init_parse_response_helper();
var DataPathwayAssignmentExpireLeasesCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/expire-leases`;
  }
  getBody() {
    return void 0;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayExpireLeasesResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/assignment.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayAssignmentFetchCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/${this.input.id}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayAssignmentSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/assignment.heartbeat.ts
init_command();
var DataPathwayAssignmentHeartbeatCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/heartbeat`;
  }
  parseResponse(_rawResponse) {
    return null;
  }
};

// src/commands/data-pathways/assignment.list.ts
init_command();
init_parse_response_helper();
var DataPathwayAssignmentListCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.status) queryParams.set("status", this.input.status);
    if (this.input.slotId) queryParams.set("slotId", this.input.slotId);
    if (this.input.pathwayId) queryParams.set("pathwayId", this.input.pathwayId);
    if (this.input.limit !== void 0) queryParams.set("limit", String(this.input.limit));
    if (this.input.offset !== void 0) queryParams.set("offset", String(this.input.offset));
    if (this.input.sort) queryParams.set("sort", this.input.sort);
    const qs = queryParams.toString();
    return `/api/v1/assignments${qs ? `?${qs}` : ""}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayAssignmentListSchema, rawResponse);
  }
};

// src/commands/data-pathways/assignment.next.ts
init_command();
init_parse_response_helper();
var DataPathwayAssignmentNextCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/next`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayAssignmentNextSchema, rawResponse);
  }
};

// src/commands/data-pathways/capacity.fetch.ts
init_command();
init_parse_response_helper();
var DataPathwayCapacityFetchCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/capacity`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCapacitySchema, rawResponse);
  }
};

// src/commands/data-pathways/command.dispatch-config-update.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchConfigUpdateCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/${this.input.assignmentId}/commands/config-update`;
  }
  getBody() {
    const { assignmentId: _assignmentId, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.dispatch-restart.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchRestartCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/${this.input.assignmentId}/commands/datapump-restart`;
  }
  getBody() {
    const { assignmentId: _assignmentId, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.dispatch-stop.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchStopCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/${this.input.assignmentId}/commands/stop`;
  }
  getBody() {
    const { assignmentId: _assignmentId, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandFetchCommand = class extends Command {
  allowedModes = ["bearer", "apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/commands/${this.input.commandId}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandDetailSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayCommand", { commandId: this.input.commandId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.pending.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandPendingCommand = class extends Command {
  allowedModes = ["apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/${this.input.assignmentId}/commands/pending`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandListSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.update-status.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandUpdateStatusCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/${this.input.assignmentId}/commands/${this.input.commandId}/status`;
  }
  getBody() {
    const { assignmentId: _assignmentId, commandId: _commandId, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayCommand", {
        assignmentId: this.input.assignmentId,
        commandId: this.input.commandId
      });
    }
    throw error;
  }
};

// src/commands/data-pathways/delivery-log.batch.ts
init_command();
init_parse_response_helper();
var DataPathwayDeliveryLogBatchCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return "/api/v1/delivery-log/batch";
  }
  getBody() {
    return { entries: this.input.entries };
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayDeliveryLogBatchResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/delivery-log.list.ts
init_command();
init_parse_response_helper();
var DataPathwayDeliveryLogListCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    const queryParams = new URLSearchParams();
    queryParams.set("pathwayId", this.input.pathwayId);
    if (this.input.success !== void 0) queryParams.set("success", String(this.input.success));
    if (this.input.limit !== void 0) queryParams.set("limit", String(this.input.limit));
    if (this.input.offset !== void 0) queryParams.set("offset", String(this.input.offset));
    if (this.input.sort) queryParams.set("sort", this.input.sort);
    return `/api/v1/delivery-log?${queryParams}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayDeliveryLogListSchema, rawResponse);
  }
};

// src/commands/data-pathways/health.check.ts
init_command();
init_parse_response_helper();
var DataPathwayHealthCheckCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return "/api/v1/health";
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayHealthSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway.create.ts
init_command();
init_parse_response_helper();
var DataPathwayCreateCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getMethod() {
    return "PUT";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.id}`;
  }
  getBody() {
    const { id: _id, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway.delete.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayDeleteCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getMethod() {
    return "DELETE";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.id}`;
  }
  getBody() {
    const { id: _id, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.disable.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayDisableCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.id}/disable`;
  }
  getBody() {
    const { id: _id, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayFetchCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.id}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwaySchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.fetch-by-name.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayFetchByNameCommand = class extends Command {
  allowedModes = ["apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    const qs = new URLSearchParams({ tenant: this.input.tenant }).toString();
    return `/api/v1/pathways/by-name/${encodeURIComponent(this.input.name)}?${qs}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwaySchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { name: this.input.name, tenant: this.input.tenant });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.list.ts
init_command();
init_parse_response_helper();
var DataPathwayListCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.tenant) queryParams.set("tenant", this.input.tenant);
    if (this.input.sizeClass) queryParams.set("sizeClass", this.input.sizeClass);
    if (this.input.type) queryParams.set("type", this.input.type);
    if (this.input.enabled !== void 0) queryParams.set("enabled", String(this.input.enabled));
    if (this.input.priority !== void 0) queryParams.set("priority", String(this.input.priority));
    if (this.input.limit !== void 0) queryParams.set("limit", String(this.input.limit));
    if (this.input.offset !== void 0) queryParams.set("offset", String(this.input.offset));
    if (this.input.page !== void 0) queryParams.set("page", String(this.input.page));
    if (this.input.ids !== void 0) {
      const ids = Array.isArray(this.input.ids) ? this.input.ids.join(",") : this.input.ids;
      queryParams.set("ids", ids);
    }
    if (this.input.sort) queryParams.set("sort", this.input.sort);
    const qs = queryParams.toString();
    return `/api/v1/pathways${qs ? `?${qs}` : ""}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayListSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway.metrics.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayMetricsFetchCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.id}/metrics`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayMetricsSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.upsert-by-name.ts
init_command();
init_parse_response_helper();
var DataPathwayUpsertByNameResponseSchema = Type.Object({
  pathwayId: Type.String(),
  status: Type.Union([Type.Literal("created"), Type.Literal("updated")])
});
var DataPathwayUpsertByNameCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getMethod() {
    return "PUT";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/by-name/${encodeURIComponent(this.input.name)}`;
  }
  getBody() {
    const { name: _name, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayUpsertByNameResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway-command.dispatch-pause.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchPauseCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/pause`;
  }
  getBody() {
    const { pathwayId: _pathwayId, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.pathwayId });
    }
  }
};

// src/commands/data-pathways/pathway-command.dispatch-resume.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchResumeCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/resume`;
  }
  getBody() {
    const { pathwayId: _pathwayId, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.pathwayId });
    }
  }
};

// src/commands/data-pathways/pathway-command.pending.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandPendingByPathwayCommand = class extends Command {
  allowedModes = ["bearer", "apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/pending`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandListSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathway", { id: this.input.pathwayId });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway-command.update-status.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandUpdateStatusByPathwayCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer", "apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.pathwayId}/commands/${this.input.commandId}/status`;
  }
  getBody() {
    const { pathwayId: _pathwayId, commandId: _commandId, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayCommand", {
        pathwayId: this.input.pathwayId,
        commandId: this.input.commandId
      });
    }
    throw error;
  }
};

// src/commands/data-pathways/pump-pulse.send.ts
init_command();
init_parse_response_helper();
var SendPumpPulseCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pump-pulse`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayPumpPulseResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pump-state.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayPumpStateFetchCommand = class extends Command {
  allowedModes = ["apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pump-states/${this.input.pathwayId}/${encodeURIComponent(this.input.flowType)}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayPumpStateSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayPumpState", {
        pathwayId: this.input.pathwayId,
        flowType: this.input.flowType
      });
    }
    throw error;
  }
};

// src/commands/data-pathways/pump-state.fetch-by-source.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayPumpStateFetchBySourceCommand = class extends Command {
  allowedModes = ["apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pump-states/${this.input.pathwayId}/sources/${this.input.sourceId}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayPumpStateBySourceSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayPumpState", {
        pathwayId: this.input.pathwayId,
        sourceId: this.input.sourceId
      });
    }
    throw error;
  }
};

// src/commands/data-pathways/pump-state.save.ts
init_command();
init_parse_response_helper();
var DataPathwayPumpStateSaveCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pump-states/${this.input.pathwayId}/${encodeURIComponent(this.input.flowType)}`;
  }
  getBody() {
    return { state: this.input.state };
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayPumpStateSaveResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pump-state.save-by-source.ts
init_command();
init_parse_response_helper();
var DataPathwayPumpStateSaveBySourceCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getMethod() {
    return "PUT";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pump-states/${this.input.pathwayId}/sources/${this.input.sourceId}`;
  }
  getBody() {
    return { state: this.input.state };
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayPumpStateSaveResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pump-status.fetch.ts
init_command();
init_parse_response_helper();
init_not_found();
var FetchPumpStatusCommand = class extends Command {
  retryOnFailure = true;
  allowedModes = ["bearer", "apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/pathways/${this.input.pathwayId}/pump-status`;
  }
  getBody() {
    return void 0;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayPumpStatusSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Pathway", { pathwayId: this.input.pathwayId });
    }
    throw error;
  }
};

// src/commands/data-pathways/quota.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayQuotaFetchCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/quotas/${this.input.tenant}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayQuotaWithUsageSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayQuota", { tenant: this.input.tenant });
    }
    throw error;
  }
};

// src/commands/data-pathways/quota.list.ts
init_command();
init_parse_response_helper();
var DataPathwayQuotaListCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/quotas`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayQuotaListSchema, rawResponse);
  }
};

// src/commands/data-pathways/quota.set.ts
init_command();
init_parse_response_helper();
var DataPathwayQuotaSetCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getMethod() {
    return "PUT";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/quotas/${this.input.tenant}`;
  }
  getBody() {
    const { tenant: _tenant, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayQuotaSetResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/restart.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayRestartFetchCommand = class extends Command {
  allowedModes = ["bearer"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/restarts/${this.input.id}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayRestartRequestSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwayRestartRequest", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/restart.request.ts
init_command();
init_parse_response_helper();
var DataPathwayRestartRequestCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/restarts/request`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwayRestartRequestResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/slot.deregister.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwaySlotDeregisterCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/slots/${this.input.id}/deregister`;
  }
  getBody() {
    const { id: _id, ...payload } = this.input;
    return payload;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwaySlot", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/slot.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwaySlotFetchCommand = class extends Command {
  allowedModes = ["apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/slots/${this.input.id}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwaySlotSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwaySlot", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/slot.heartbeat.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwaySlotHeartbeatCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/slots/${this.input.id}/heartbeat`;
  }
  getBody() {
    return {};
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("DataPathwaySlot", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/slot.list.ts
init_command();
init_parse_response_helper();
var DataPathwaySlotListCommand = class extends Command {
  allowedModes = ["apiKey"];
  getMethod() {
    return "GET";
  }
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.class) queryParams.set("class", this.input.class);
    if (this.input.limit !== void 0) queryParams.set("limit", String(this.input.limit));
    if (this.input.offset !== void 0) queryParams.set("offset", String(this.input.offset));
    if (this.input.sort) queryParams.set("sort", this.input.sort);
    const qs = queryParams.toString();
    return `/api/v1/slots${qs ? `?${qs}` : ""}`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwaySlotListSchema, rawResponse);
  }
};

// src/commands/data-pathways/slot.register.ts
init_command();
init_parse_response_helper();
var DataPathwaySlotRegisterCommand = class extends Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/slots/register`;
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse);
  }
};

// src/commands/iam/permissions/get-user-permissions.ts
init_command();
init_parse_response_helper();
var UserPermissionSchema = Type.Object({
  tenant: Type.String(),
  type: Type.String(),
  id: Type.String(),
  action: Type.Array(Type.String())
});
var UserPermissionsCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/permissions/";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(UserPermissionSchema), rawResponse);
  }
};

// src/commands/iam/policies/create-policy.ts
init_command();
init_parse_response_helper();
var PolicyFilterValueSchema = Type.Union([
  Type.String({ maxLength: 512 }),
  Type.Number(),
  Type.Boolean(),
  Type.Null()
]);
var PolicyFilterPathSchema = Type.String({
  minLength: 1,
  maxLength: 256,
  pattern: "^[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+){0,7}$"
});
var PolicyFilterSchema = Type.Union([
  Type.Object({ path: PolicyFilterPathSchema, operator: Type.Literal("equals"), value: PolicyFilterValueSchema }, { additionalProperties: false }),
  Type.Object({ path: PolicyFilterPathSchema, operator: Type.Literal("oneOf"), values: Type.Array(PolicyFilterValueSchema, { minItems: 1, maxItems: 20 }) }, { additionalProperties: false }),
  Type.Object({ path: PolicyFilterPathSchema, operator: Type.Literal("exists"), value: Type.Boolean() }, { additionalProperties: false })
]);
var RESERVED_PATH_SEGMENTS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function ownPath(payload, path) {
  let current = payload;
  for (const segment of path.split(".")) {
    if (RESERVED_PATH_SEGMENTS.has(segment) || typeof current !== "object" || current === null || Array.isArray(current)) {
      return { exists: false };
    }
    if (!Object.hasOwn(current, segment)) return { exists: false };
    current = current[segment];
  }
  return { exists: true, value: current };
}
function isEncryptedPayload(payload) {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return false;
  if (!Object.hasOwn(payload, "encryptedPayload")) return false;
  const keys = Object.keys(payload);
  const value = payload.encryptedPayload;
  return keys.length === 1 && typeof value === "string" && value.split(".").length === 3;
}
function matchesPolicyFilters(filters, payload) {
  if (isEncryptedPayload(payload)) return false;
  return filters.every((filter) => {
    const resolved = ownPath(payload, filter.path);
    if (filter.operator === "exists") return resolved.exists === filter.value;
    if (!resolved.exists) return false;
    if (filter.operator === "equals") return resolved.value === filter.value;
    return filter.values.some((value) => resolved.value === value);
  });
}
function permitsPayload(grants, payload) {
  return grants.some((grant) => grant.filters === void 0 || matchesPolicyFilters(grant.filters, payload));
}

// src/commands/iam/policies/create-policy.ts
var PolicyStatementSchema = Type.Object({
  statementId: Type.Optional(Type.String()),
  resource: Type.String(),
  action: Type.Union([Type.String(), Type.Array(Type.String())]),
  filters: Type.Optional(Type.Array(PolicyFilterSchema, { minItems: 1, maxItems: 10 }))
});
var PolicySchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  version: Type.String(),
  policyDocuments: Type.Array(PolicyStatementSchema),
  description: Type.Optional(Type.String()),
  principal: Type.Optional(Type.String()),
  flowcoreManaged: Type.Boolean(),
  archived: Type.Optional(Type.Boolean()),
  frn: Type.String()
});
var PolicyCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/policies/";
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      ...this.input,
      flowcoreManaged: this.input.flowcoreManaged ?? false
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(PolicySchema, rawResponse);
  }
};

// src/commands/iam/policies/get-policy.ts
init_command();
init_parse_response_helper();
var PolicyListCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/policies/";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse);
  }
};

// src/commands/iam/policies/validate-policy.ts
init_command();
init_parse_response_helper();
var PolicyValidateResponseSchema = Type.Object({
  valid: Type.Literal(true)
});
var PolicyValidateCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * Disabled because a 422 here indicates an invalid payload — retrying
   * would just re-submit the same bad data.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/policies/validate";
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      ...this.input
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(PolicyValidateResponseSchema, rawResponse);
  }
};

// src/commands/iam/policies/id/archive-policy.ts
init_command();
init_parse_response_helper();
var ArchivePolicyResponseSchema = Type.Object({
  message: Type.String()
});
var PolicyArchiveCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policies/${this.input.policyId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ArchivePolicyResponseSchema, rawResponse);
  }
};

// src/commands/iam/policies/id/get-policy.ts
init_command();
init_parse_response_helper();
var PolicyGetCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  constructor(inputOrPolicyId) {
    const input = typeof inputOrPolicyId === "string" ? { policyId: inputOrPolicyId } : inputOrPolicyId;
    super(input);
  }
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policies/${this.input.policyId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(PolicySchema, rawResponse);
  }
};

// src/commands/iam/policies/id/update-policy.ts
init_command();
init_parse_response_helper();
var PolicyUpdateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policies/${this.input.policyId}`;
  }
  /**
   * Get the body
   */
  getBody() {
    const { ...rest } = this.input;
    return {
      ...rest,
      flowcoreManaged: rest.flowcoreManaged ?? false
    };
  }
  getHeaders() {
    return { ...super.getHeaders(), "x-flowcore-policy-conditions": "1" };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(PolicySchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/get-key-policies.ts
init_command();
init_parse_response_helper();
var parseKeyPoliciesResponse = (rawResponse) => {
  if (!rawResponse) {
    return [];
  }
  if (!Array.isArray(rawResponse)) {
    if (typeof rawResponse === "object" && "data" in rawResponse) {
      return parseKeyPoliciesResponse(rawResponse.data);
    }
    if (typeof rawResponse === "object" && "policies" in rawResponse) {
      return parseKeyPoliciesResponse(
        rawResponse.policies
      );
    }
    return [];
  }
  try {
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse);
  } catch (error) {
    if (error instanceof Error && error.message.includes("flowcoreManaged") && Array.isArray(rawResponse)) {
      const sanitizedPolicies = rawResponse.map((policy) => ({
        ...policy,
        // Convert to boolean using double negation
        flowcoreManaged: policy.flowcoreManaged === true || !!policy.flowcoreManaged
      }));
      return parseResponseHelper(Type.Array(PolicySchema), sanitizedPolicies);
    }
    throw error;
  }
};
var KeyPoliciesCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/key/${this.input.keyId}/`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseKeyPoliciesResponse(rawResponse);
  }
};

// src/commands/iam/policy-associations/get-organization-policies.ts
init_command();
init_parse_response_helper();
var OrganizationPoliciesCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/organization/${this.input.organizationId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    if (!rawResponse) {
      return [];
    }
    if (Array.isArray(rawResponse)) {
      return rawResponse.map((item) => {
        try {
          return parseResponseHelper(PolicySchema, item);
        } catch (_error) {
          const policy = item;
          const id = typeof policy.id === "string" ? policy.id : "unknown";
          return {
            id,
            name: typeof policy.name === "string" ? policy.name : "Unknown Policy",
            version: typeof policy.version === "string" ? policy.version : "1.0",
            description: typeof policy.description === "string" ? policy.description : "",
            flowcoreManaged: Boolean(policy.flowcoreManaged),
            policyDocuments: Array.isArray(policy.policyDocuments) ? policy.policyDocuments : [],
            organizationId: this.input.organizationId,
            frn: typeof policy.frn === "string" ? policy.frn : `frn::${this.input.organizationId}:policy/${id}`,
            archived: policy.archived === void 0 ? false : Boolean(policy.archived)
          };
        }
      });
    }
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse);
  }
};

// src/commands/iam/policy-associations/get-policy-associations.ts
init_command();
init_parse_response_helper();
var PolicyKeyAssociationSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String()
});
var PolicyUserAssociationSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String()
});
var PolicyRoleAssociationSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  roleId: Type.String()
});
var PolicyAssociationsSchema = Type.Object({
  keys: Type.Array(PolicyKeyAssociationSchema),
  users: Type.Array(PolicyUserAssociationSchema),
  roles: Type.Array(PolicyRoleAssociationSchema)
});
var parsePolicyAssociationsResponse = (rawResponse) => {
  try {
    return parseResponseHelper(PolicyAssociationsSchema, rawResponse);
  } catch (_error) {
    if (!rawResponse || typeof rawResponse !== "object") {
      return { keys: [], users: [], roles: [] };
    }
    const rawData = rawResponse;
    let keys = Array.isArray(rawData.keys) ? rawData.keys : [];
    let users = Array.isArray(rawData.users) ? rawData.users : [];
    let roles = Array.isArray(rawData.roles) ? rawData.roles : [];
    try {
      keys = parseResponseHelper(Type.Array(PolicyKeyAssociationSchema), keys);
    } catch (_error2) {
      keys = [];
    }
    try {
      users = parseResponseHelper(
        Type.Array(PolicyUserAssociationSchema),
        users
      );
    } catch (_error2) {
      users = [];
    }
    try {
      roles = parseResponseHelper(
        Type.Array(PolicyRoleAssociationSchema),
        roles
      );
    } catch (_error2) {
      roles = [];
    }
    return { keys, users, roles };
  }
};
var PolicyAssociationsCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/${this.input.policyId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parsePolicyAssociationsResponse(rawResponse);
  }
};

// src/commands/iam/policy-associations/get-role-policies.ts
init_command();
init_parse_response_helper();
var parseRolePoliciesResponse = (rawResponse) => {
  try {
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse);
  } catch (error) {
    if (error instanceof Error && error.message.includes("flowcoreManaged") && Array.isArray(rawResponse)) {
      const sanitizedPolicies = rawResponse.map((policy) => ({
        ...policy,
        // Convert to boolean with explicit type-safe conversion
        flowcoreManaged: policy.flowcoreManaged === true || policy.flowcoreManaged === "true" || typeof policy.flowcoreManaged === "boolean" && policy.flowcoreManaged
      }));
      return parseResponseHelper(Type.Array(PolicySchema), sanitizedPolicies);
    }
    throw error;
  }
};
var RolePoliciesCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/role/${this.input.roleId}/`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseRolePoliciesResponse(rawResponse);
  }
};

// src/commands/iam/policy-associations/get-user-policies.ts
init_command();
init_parse_response_helper();
var UserPoliciesCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/user/${this.input.userId}/`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(PolicySchema), rawResponse);
  }
};

// src/commands/iam/policy-associations/link-key-policy.ts
init_command();
init_parse_response_helper();
var KeyPolicyLinkSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String()
});
var LinkKeyPolicyCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/key/${this.input.keyId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      policyId: this.input.policyId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(KeyPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/link-role-policy.ts
init_command();
init_parse_response_helper();
var RolePolicyLinkSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  roleId: Type.String()
});
var LinkRolePolicyCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/role/${this.input.roleId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      policyId: this.input.policyId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(RolePolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/link-user-policy.ts
init_command();
init_parse_response_helper();
var UserPolicyLinkSchema = Type.Object({
  policyId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String()
});
var LinkUserPolicyCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/user/${this.input.userId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      policyId: this.input.policyId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(UserPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/unlink-key-policy.ts
init_command();
init_parse_response_helper();
var UnlinkKeyPolicyCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/key/${this.input.keyId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      policyId: this.input.policyId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(KeyPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/unlink-role-policy.ts
init_command();
init_parse_response_helper();
var UnlinkRolePolicyCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/role/${this.input.roleId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      policyId: this.input.policyId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(RolePolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/unlink-user-policy.ts
init_command();
init_parse_response_helper();
var UnlinkUserPolicyCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/policy-associations/user/${this.input.userId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      policyId: this.input.policyId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(UserPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/get-key-roles.ts
init_command();
init_parse_response_helper();

// src/commands/iam/roles/create-role.ts
init_command();
init_parse_response_helper();
var RoleSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  flowcoreManaged: Type.Optional(Type.Boolean({ default: false })),
  archived: Type.Optional(Type.Boolean())
});
var RoleCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/roles/";
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      ...this.input,
      flowcoreManaged: this.input.flowcoreManaged ?? false
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(RoleSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/get-key-roles.ts
var KeyRolesCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/role-associations/key/${this.input.keyId}/`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(RoleSchema), rawResponse);
  }
};

// src/commands/iam/role-associations/get-organization-roles.ts
init_command();
init_parse_response_helper();
var FlexibleRoleSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  flowcoreManaged: Type.Boolean(),
  archived: Type.Optional(Type.Boolean()),
  frn: Type.String(),
  createdAt: Type.Optional(Type.String()),
  updatedAt: Type.Optional(Type.String())
});
var OrganizationRolesCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/role-associations/organization/${this.input.organizationId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const flexibleRoles = parseResponseHelper(
      Type.Array(FlexibleRoleSchema),
      rawResponse
    );
    return flexibleRoles.map((role) => ({
      ...role,
      archived: role.archived !== void 0 ? role.archived : false
    }));
  }
};

// src/commands/iam/role-associations/get-role-associations.ts
init_command();
init_parse_response_helper();
var RoleKeyAssociationSchema = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String()
});
var RoleUserAssociationSchema = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String()
});
var RoleAssociationsSchema = Type.Object({
  keys: Type.Array(RoleKeyAssociationSchema),
  users: Type.Array(RoleUserAssociationSchema)
});
var RoleAssociationsCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/role-associations/${this.input.roleId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(RoleAssociationsSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/get-user-roles.ts
init_command();
init_parse_response_helper();
var UserRolesCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const basePath = `/api/v1/role-associations/user/${this.input.userId}/`;
    if (this.input.organizationId) {
      return `${basePath}?organizationId=${this.input.organizationId}`;
    }
    return basePath;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(RoleSchema), rawResponse);
  }
};

// src/commands/iam/role-associations/link-key-role.ts
init_command();
init_parse_response_helper();
var KeyRoleLinkSchema = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String()
});
var LinkKeyRoleCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/role-associations/key/${this.input.keyId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      roleId: this.input.roleId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(KeyRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/link-user-role.ts
init_command();
init_parse_response_helper();
var UserRoleLinkSchema = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  userId: Type.String()
});
var LinkUserRoleCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/role-associations/user/${this.input.userId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      roleId: this.input.roleId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(UserRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/unlink-key-role.ts
init_command();
init_parse_response_helper();
var UnlinkKeyRoleCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/role-associations/key/${this.input.keyId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      roleId: this.input.roleId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(KeyRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/unlink-user-role.ts
init_command();
init_parse_response_helper();
var UnlinkUserRoleCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/role-associations/user/${this.input.userId}/`;
  }
  /**
   * Get the body
   */
  getBody() {
    return {
      roleId: this.input.roleId
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(UserRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/roles/get-roles.ts
init_command();
init_parse_response_helper();
var RoleListCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/roles/";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(Type.Array(RoleSchema), rawResponse);
  }
};

// src/commands/iam/roles/id/archive-role.ts
init_command();
init_parse_response_helper();
var ArchiveRoleResponseSchema = Type.Object({
  message: Type.String()
});
var RoleArchiveCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/roles/${this.input.roleId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ArchiveRoleResponseSchema, rawResponse);
  }
};

// src/commands/iam/roles/id/get-role.ts
init_command();
init_parse_response_helper();
var RoleGetCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/roles/${this.input.roleId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(RoleSchema, rawResponse);
  }
};

// src/commands/iam/roles/id/update-role.ts
init_command();
init_parse_response_helper();
var RoleUpdateCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/roles/${this.input.roleId}`;
  }
  /**
   * Get the body
   */
  getBody() {
    const { roleId, ...rest } = this.input;
    return {
      id: roleId,
      ...rest,
      flowcoreManaged: rest.flowcoreManaged ?? false
    };
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(RoleSchema, rawResponse);
  }
};

// src/commands/iam/tenant-iam-audit/get-audit-for-tenant.ts
init_command();
init_parse_response_helper();
var AuditLogEntrySchema = Type.Object({
  id: Type.String(),
  event: Type.String(),
  resourceName: Type.String(),
  performedBy: Type.Union([
    Type.String(),
    Type.Object({}),
    // Allow performedBy to be any object
    Type.Null()
    // Or null
  ]),
  timestamp: Type.String(),
  status: Type.String()
});
var PaginationSchema = Type.Object({
  page: Type.Number(),
  pageSize: Type.Number(),
  totalItems: Type.Number(),
  totalPages: Type.Number()
});
var AuditLogResponseSchema = Type.Object({
  logs: Type.Array(AuditLogEntrySchema),
  pagination: PaginationSchema
});
var TenantAuditLogsCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    let path = `/api/v1/tenant-iam-audit/${this.input.tenantId}`;
    const queryParams = [];
    if (this.input.page !== void 0) {
      queryParams.push(
        `page=${encodeURIComponent(this.input.page.toString())}`
      );
    }
    if (this.input.pageSize !== void 0) {
      queryParams.push(
        `pageSize=${encodeURIComponent(this.input.pageSize.toString())}`
      );
    }
    if (this.input.resourceType) {
      queryParams.push(
        `resourceType=${encodeURIComponent(this.input.resourceType)}`
      );
    }
    if (this.input.performedBy) {
      queryParams.push(
        `performedBy=${encodeURIComponent(this.input.performedBy)}`
      );
    }
    if (this.input.status) {
      queryParams.push(`status=${encodeURIComponent(this.input.status)}`);
    }
    if (this.input.startDate) {
      queryParams.push(`startDate=${encodeURIComponent(this.input.startDate)}`);
    }
    if (this.input.endDate) {
      queryParams.push(`endDate=${encodeURIComponent(this.input.endDate)}`);
    }
    if (queryParams.length > 0) {
      path += `?${queryParams.join("&")}`;
    }
    return path;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    if (!rawResponse) {
      return {
        logs: [],
        pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 }
      };
    }
    return parseResponseHelper(AuditLogResponseSchema, rawResponse);
  }
};

// src/commands/iam/validate/validate-key.ts
init_command();
init_parse_response_helper();

// src/commands/iam/validate/validate-user.ts
init_command();
init_parse_response_helper();
var ValidPolicySchema = Type.Object({
  policyFrn: Type.String(),
  statementId: Type.String()
});
var ValidationResponseSchema = Type.Object({
  valid: Type.Boolean(),
  checksum: Type.String(),
  validPolicies: Type.Array(ValidPolicySchema)
});
var ValidateUserCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/validate/users/${this.input.userId}`;
  }
  /**
   * Get the body
   */
  getBody() {
    const { ...rest } = this.input;
    return rest;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ValidationResponseSchema, rawResponse);
  }
};

// src/commands/iam/validate/validate-key.ts
var ValidateKeyCommand = class extends Command {
  /**
   * Whether the command should retry on failure
   */
  retryOnFailure = true;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/validate/keys/${this.input.keyId}`;
  }
  /**
   * Get the body
   */
  getBody() {
    const { ...rest } = this.input;
    return rest;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ValidationResponseSchema, rawResponse);
  }
};

// src/commands/iam/entitlements/resolve-user-entitlements.ts
init_command();
init_parse_response_helper();
var EntitlementResponseSchema = Type.Object({
  valid: Type.Literal(true),
  requestChecksum: Type.String(),
  entitlementChecksum: Type.String(),
  cacheTtlSeconds: Type.Number(),
  entitlements: Type.Array(
    Type.Object({
      requestIndex: Type.Number(),
      grants: Type.Array(
        Type.Object({
          policyFrn: Type.String(),
          statementId: Type.String(),
          resource: Type.String(),
          filters: Type.Optional(Type.Array(PolicyFilterSchema))
        })
      )
    })
  )
});
function parseEntitlementResponse(rawResponse) {
  return parseResponseHelper(EntitlementResponseSchema, rawResponse);
}
var ResolveUserEntitlementsCommand = class extends Command {
  retryOnFailure = true;
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/entitlements/users/${this.input.userId}`;
  }
  getBody() {
    return { mode: this.input.mode, requestedAccess: this.input.requestedAccess };
  }
  parseResponse(rawResponse) {
    return parseEntitlementResponse(rawResponse);
  }
};

// src/commands/iam/entitlements/resolve-key-entitlements.ts
init_command();
init_parse_response_helper();
var ResolveKeyEntitlementsCommand = class extends Command {
  retryOnFailure = true;
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://iam.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/entitlements/keys/${this.input.keyId}`;
  }
  getBody() {
    return { mode: this.input.mode, requestedAccess: this.input.requestedAccess };
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(EntitlementResponseSchema, rawResponse);
  }
};

// src/commands/compute/compute-domain.attach.ts
init_command();
var ComputeNoContentSchema = Type.Object({
  /** The HTTP status the service answered with (always 204) */
  status: Type.Number()
});
var ComputeWorkloadStatusSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("running"),
  Type.Literal("stopped"),
  Type.Literal("failed"),
  Type.Literal("archived")
]);
var ComputeWorkloadKindSchema = Type.Union([
  Type.Literal("service"),
  Type.Literal("job")
]);
var ComputeSlotTierSchema = Type.Union([
  Type.Literal("nano"),
  Type.Literal("micro"),
  Type.Literal("small"),
  Type.Literal("medium"),
  Type.Literal("large")
]);
var ComputeProbeHttpGetSchema = Type.Object({
  /** Request path (defaults to `/` server-side) */
  path: Type.Optional(Type.String()),
  /** Container port to probe */
  port: Type.Number(),
  /** Extra request headers */
  headers: Type.Optional(Type.Record(Type.String(), Type.String()))
});
var ComputeProbeTcpSocketSchema = Type.Object({
  /** Container port to dial */
  port: Type.Number()
});
var ComputeProbeExecSchema = Type.Object({
  /** Command and arguments to run inside the container */
  command: Type.Array(Type.String())
});
var ComputeProbeSchema = Type.Object({
  /** HTTP GET handler */
  httpGet: Type.Optional(ComputeProbeHttpGetSchema),
  /** TCP socket handler */
  tcpSocket: Type.Optional(ComputeProbeTcpSocketSchema),
  /** Exec handler */
  exec: Type.Optional(ComputeProbeExecSchema),
  /** Delay before the first probe */
  initialDelaySeconds: Type.Optional(Type.Number()),
  /** Seconds between probes */
  periodSeconds: Type.Optional(Type.Number()),
  /** Per-probe timeout in seconds */
  timeoutSeconds: Type.Optional(Type.Number()),
  /** Consecutive failures before the probe is considered failed */
  failureThreshold: Type.Optional(Type.Number())
});
var ComputeWorkloadProbesSchema = Type.Object({
  /** Startup probe */
  startup: Type.Optional(ComputeProbeSchema),
  /** Readiness probe */
  readiness: Type.Optional(ComputeProbeSchema),
  /** Liveness probe */
  liveness: Type.Optional(ComputeProbeSchema)
});
var ComputePreSyncSpecSchema = Type.Object({
  /** Label reported as `progress.preSync.name` (defaults to `pre-sync`) */
  name: Type.Optional(Type.String()),
  /** Image the hook runs */
  image: Type.String(),
  /** Command and arguments the hook runs */
  command: Type.Array(Type.String()),
  /** Deadline for the hook (defaults to 300 server-side) */
  timeoutSeconds: Type.Optional(Type.Number())
});
var ComputeWorkloadScalingModeSchema = Type.Union([
  Type.Literal("manual"),
  Type.Literal("hpa")
]);
var ComputeWorkloadScalingSchema = Type.Object({
  /** `manual` (default) or `hpa` */
  mode: Type.Optional(ComputeWorkloadScalingModeSchema),
  /** The autoscaler's floor, 1..50. Also the count a create and a resume start at under `hpa` */
  minReplicas: Type.Optional(Type.Number()),
  /** The autoscaler's ceiling, 1..50 — the number the tenant quota pre-flight measures */
  maxReplicas: Type.Optional(Type.Number()),
  /** Target average CPU utilization, 1..100 percent of the slot's request */
  targetCpuPercent: Type.Optional(Type.Number()),
  /** Target average memory utilization, 1..100 percent of the slot's request */
  targetMemoryPercent: Type.Optional(Type.Number())
});
var ComputeWorkloadEnvVarSchema = Type.Object({
  /** Variable name, e.g. `GREETING` */
  name: Type.String(),
  /** Variable value, stored and replayed as-is */
  value: Type.String()
});
var ComputeWorkloadSecretRefSchema = Type.Object({
  /** Variable name as the container sees it, e.g. `TOKEN` */
  name: Type.String(),
  /** The key in the tenant's organization secrets that supplies the value */
  secretKey: Type.String()
});
var ComputeWorkloadVolumeSchema = Type.Object({
  /** Lowercase DNS label, max 20 chars — embedded in the claim's object name */
  name: Type.String(),
  /** Provisioned size in Gi, 1..1024 — growth-only after create */
  sizeGi: Type.Number(),
  /** Absolute mount path inside the container (never `/`) */
  mountPath: Type.String()
});
var ComputeWorkloadDefinitionSchema = Type.Object({
  /** Container image reference */
  image: Type.String(),
  /** Compute slot tier */
  slotTier: ComputeSlotTierSchema,
  /** Service or run-to-completion job (defaults to `service`) */
  kind: Type.Optional(ComputeWorkloadKindSchema),
  /** Fixed replica count under `scaling.mode: "manual"` (defaults to 1) */
  replicas: Type.Optional(Type.Number()),
  /** The container's listening port (defaults to 8080) */
  port: Type.Optional(Type.Number()),
  /** Startup, readiness and liveness probes */
  probes: Type.Optional(ComputeWorkloadProbesSchema),
  /** The pre-sync hook that gates every apply of this definition */
  preSync: Type.Optional(ComputePreSyncSpecSchema),
  /** How the replica count is decided (defaults to `{ mode: "manual" }`) */
  scaling: Type.Optional(ComputeWorkloadScalingSchema),
  /** Plain environment variables (defaults to an empty list) */
  env: Type.Optional(Type.Array(ComputeWorkloadEnvVarSchema)),
  /** Organization-secret bindings, by key reference (defaults to an empty list) */
  secrets: Type.Optional(Type.Array(ComputeWorkloadSecretRefSchema)),
  /** Persistent volumes, max 4 (defaults to an empty list). See ComputeWorkloadVolumeSchema */
  volumes: Type.Optional(Type.Array(ComputeWorkloadVolumeSchema))
});
var ComputeWorkloadSchema = Type.Object({
  /** The workload id (full UUID) */
  id: Type.String(),
  /** The owning tenant id (full UUID) */
  tenantId: Type.String(),
  /** Human name of the workload */
  name: Type.String(),
  /** Lifecycle state */
  status: ComputeWorkloadStatusSchema,
  /** Observed ready replica count, as reported by the reconciler */
  readyReplicas: Type.Number(),
  /** Explanation of the latest non-healthy transition */
  reason: Type.Optional(Type.String()),
  /** The definition of the ACTIVE revision */
  definition: Type.Optional(ComputeWorkloadDefinitionSchema),
  /** Ordinal of the revision the platform has accepted as current */
  activeRevision: Type.Optional(Type.Number()),
  /** When the active revision came from a rollback, the ordinal it was taken from */
  rolledBackFrom: Type.Optional(Type.Number()),
  /** Whether the workload was deliberately paused (scaled to zero) */
  paused: Type.Optional(Type.Boolean()),
  /** ISO-8601 creation timestamp */
  createdAt: Type.String(),
  /** ISO-8601 last-update timestamp */
  updatedAt: Type.String()
});
var ComputeWorkloadRunKindSchema = Type.Union([
  Type.Literal("batch"),
  Type.Literal("pre_sync")
]);
var ComputeWorkloadRunStatusSchema = Type.Union([
  Type.Literal("running"),
  Type.Literal("succeeded"),
  Type.Literal("failed")
]);
var ComputeWorkloadRunSchema = Type.Object({
  /** The run id (full UUID) */
  id: Type.String(),
  /** The workload the run belongs to (full UUID) */
  workloadId: Type.String(),
  /** The owning tenant id (full UUID) */
  tenantId: Type.String(),
  /** `batch` for an on-demand run, `pre_sync` for a deploy hook */
  kind: ComputeWorkloadRunKindSchema,
  /** The Kubernetes Job object name (`run-<runId>` or `pre-sync-<workloadId>-r<revision>`) */
  name: Type.String(),
  /** Run state */
  status: ComputeWorkloadRunStatusSchema,
  /** Explanation of a failure */
  reason: Type.Optional(Type.String()),
  /** The operation the run is tracked under (full UUID) */
  operationId: Type.Optional(Type.String()),
  /** ISO-8601 start timestamp */
  startedAt: Type.String(),
  /** ISO-8601 completion timestamp, absent while the run is in flight */
  completedAt: Type.Optional(Type.String())
});
var ComputeWorkloadRunListSchema = Type.Object({
  /** One page of runs, newest first */
  runs: Type.Array(ComputeWorkloadRunSchema),
  /** Opaque cursor for the next page; absent on the last page */
  nextCursor: Type.Optional(Type.String())
});
var ComputeWorkloadListResponseSchema = Type.Object({
  success: Type.Literal(true),
  workloads: Type.Array(ComputeWorkloadSchema)
});
var ComputeWorkloadResponseSchema = Type.Object({
  success: Type.Literal(true),
  workload: ComputeWorkloadSchema
});
var ComputeWorkloadCreateResponseSchema = Type.Object({
  success: Type.Literal(true),
  workload: ComputeWorkloadSchema,
  /** Poll `GET /api/v1/operations/{operationId}` for cluster convergence */
  operationId: Type.String()
});
var ComputeWorkloadMutationResponseSchema = Type.Object({
  success: Type.Literal(true),
  workload: ComputeWorkloadSchema,
  /** Poll `GET /api/v1/operations/{operationId}` for cluster convergence */
  operationId: Type.String()
});
var ComputeWorkloadDeleteResponseSchema = Type.Object({
  success: Type.Literal(true),
  /** Poll `GET /api/v1/operations/{operationId}` for the teardown */
  operationId: Type.String()
});
var ComputeWorkloadRunResponseSchema = Type.Object({
  success: Type.Literal(true),
  /** The run row, already listed by `GET /runs` */
  run: ComputeWorkloadRunSchema,
  /** The run id (full UUID) — also the Kubernetes Job name suffix */
  runId: Type.String(),
  /** Poll `GET /api/v1/operations/{operationId}` for the run */
  operationId: Type.String()
});
var ComputeLogStreamNameSchema = Type.Union([
  Type.Literal("stdout"),
  Type.Literal("stderr")
]);
var ComputeLogEntrySchema = Type.Object({
  /** ISO-8601 timestamp of the line */
  timestamp: Type.String(),
  /** The pod that emitted it */
  podName: Type.String(),
  /** The container that emitted it */
  container: Type.String(),
  /** Parsed log level */
  level: Type.String(),
  /** The line itself */
  message: Type.String(),
  /** `stdout` or `stderr` */
  stream: ComputeLogStreamNameSchema
});
var ComputeWorkloadLogsSchema = Type.Object({
  /** The workload the lines belong to (full UUID) */
  workloadId: Type.String(),
  /** Echo of the requested container filter; `null` when the query was not container-scoped */
  container: Type.Union([Type.String(), Type.Null()]),
  /** How many lines matched upstream */
  totalMatches: Type.Number(),
  /** The matching lines, newest-first as indexed upstream */
  logs: Type.Array(ComputeLogEntrySchema)
});
var ComputeLogStreamEventSchema = Type.Object({
  /** ISO-8601 timestamp of the line, from the Kubernetes `timestamps=true` prefix */
  timestamp: Type.String(),
  /** The pod that emitted it */
  pod: Type.String(),
  /** The container that emitted it */
  container: Type.String(),
  /** The line itself, passed through byte-for-byte */
  line: Type.String()
});
var ComputeDomainStatusSchema = Type.Union([
  Type.Literal("pending_verification"),
  Type.Literal("ready"),
  Type.Literal("failed"),
  Type.Literal("detached")
]);
var ComputeDomainVerificationTypeSchema = Type.Union([
  Type.Literal("cname"),
  Type.Literal("platform_wildcard")
]);
var ComputeDomainVerificationSchema = Type.Object({
  /** `cname` for a custom hostname, `platform_wildcard` when the platform owns the zone */
  type: ComputeDomainVerificationTypeSchema,
  /** The DNS record the caller must create */
  expectedTarget: Type.String(),
  /** Whether the expected record was observed */
  verified: Type.Boolean()
});
var ComputeDomainTlsStatusSchema = Type.Union([
  Type.Literal("pending_issuance"),
  Type.Literal("issued"),
  Type.Literal("failed")
]);
var ComputeDomainTlsSchema = Type.Object({
  /** Issuance state */
  status: ComputeDomainTlsStatusSchema,
  /** The in-cluster Secret the certificate lands in */
  secretName: Type.String(),
  /** The issuing CA, once observed */
  issuer: Type.Optional(Type.String()),
  /** ISO-8601 expiry, once observed */
  expiresAt: Type.Optional(Type.String())
});
var ComputeDomainSchema = Type.Object({
  /** The domain binding id (full UUID) */
  domainId: Type.String(),
  /** The workload the hostname routes to (full UUID) */
  workloadId: Type.String(),
  /** The bound hostname */
  hostname: Type.String(),
  /** The container port the ingress routes to */
  targetPort: Type.Number(),
  /** Lifecycle state of the binding */
  status: ComputeDomainStatusSchema,
  /** DNS ownership state */
  verification: ComputeDomainVerificationSchema,
  /** Certificate state */
  tls: ComputeDomainTlsSchema,
  /** ISO-8601 creation timestamp */
  createdAt: Type.String()
});
var ComputeDomainListResponseSchema = Type.Object({
  success: Type.Literal(true),
  domains: Type.Array(ComputeDomainSchema)
});
var ComputeDomainVerifyResponseSchema = Type.Object({
  /** The domain binding id (full UUID) */
  domainId: Type.String(),
  /** The bound hostname */
  hostname: Type.String(),
  /** Lifecycle state after the observation */
  status: ComputeDomainStatusSchema,
  /** What the DNS lookup saw */
  verification: ComputeDomainVerificationSchema,
  /** What the read-only Certificate GET saw */
  tls: ComputeDomainTlsSchema
});
var ComputeOperationTypeSchema = Type.Union([
  Type.Literal("workload.deploy"),
  Type.Literal("workload.update"),
  Type.Literal("workload.rollback"),
  Type.Literal("workload.archive"),
  Type.Literal("workload.pause"),
  Type.Literal("workload.resume"),
  Type.Literal("workload.run")
]);
var ComputeOperationStatusSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("in_progress"),
  Type.Literal("succeeded"),
  Type.Literal("failed")
]);
var ComputeOperationPhaseSchema = Type.Union([
  Type.Literal("queued"),
  Type.Literal("pre_sync_running"),
  Type.Literal("pre_sync_failed"),
  Type.Literal("deploying"),
  Type.Literal("rolling_out"),
  Type.Literal("tearing_down"),
  Type.Literal("pausing"),
  Type.Literal("resuming"),
  Type.Literal("running"),
  Type.Literal("completed"),
  Type.Literal("failed")
]);
var ComputeOperationStepStatusSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("running"),
  Type.Literal("succeeded"),
  Type.Literal("failed")
]);
var ComputeOperationPreSyncProgressSchema = Type.Object({
  /** The hook's label */
  name: Type.String(),
  /** Step state */
  status: ComputeOperationStepStatusSchema,
  /** ISO-8601 start timestamp */
  startedAt: Type.Optional(Type.String()),
  /** ISO-8601 completion timestamp */
  completedAt: Type.Optional(Type.String())
});
var ComputeOperationDeploymentProgressSchema = Type.Object({
  /** Replicas the Deployment wants */
  desiredReplicas: Type.Number(),
  /** Replicas already on the new template */
  updatedReplicas: Type.Number(),
  /** Replicas reporting ready */
  readyReplicas: Type.Number()
});
var ComputeOperationProgressSchema = Type.Object({
  /** The pre-sync hook, when the mutation gated on one */
  preSync: Type.Optional(ComputeOperationPreSyncProgressSchema),
  /** The rollout, once it started */
  deployment: Type.Optional(ComputeOperationDeploymentProgressSchema)
});
var ComputeOperationSchema = Type.Object({
  /** The operation id (full UUID) */
  operationId: Type.String(),
  /** The workload the operation mutates (full UUID) */
  workloadId: Type.String(),
  /** What kind of mutation this is */
  type: ComputeOperationTypeSchema,
  /** Overall state */
  status: ComputeOperationStatusSchema,
  /** Where the reconciler currently is */
  phase: ComputeOperationPhaseSchema,
  /** Progress detail */
  progress: ComputeOperationProgressSchema,
  /** Explanation of a non-succeeded outcome */
  reason: Type.Optional(Type.String()),
  /** ISO-8601 creation timestamp */
  createdAt: Type.String(),
  /** ISO-8601 last-update timestamp */
  updatedAt: Type.String()
});
var ComputeWorkloadRevisionCauseSchema = Type.Union([
  Type.Literal("created"),
  Type.Literal("update"),
  Type.Literal("rollback")
]);
var ComputeWorkloadRevisionSchema = Type.Object({
  /** The revision ordinal, 1-based and monotonic per workload */
  revision: Type.Number(),
  /** The container image this revision was recorded with */
  image: Type.String(),
  /** The slot tier, absent on a row recorded before the field existed */
  slotTier: Type.Optional(ComputeSlotTierSchema),
  /** Why the revision exists — `created`, `update` or `rollback` */
  cause: ComputeWorkloadRevisionCauseSchema,
  /** At most one revision per workload is active */
  isActive: Type.Boolean(),
  /** The ordinal a rollback restored from; present only on a rollback revision */
  rolledBackFrom: Type.Optional(Type.Number()),
  /** The operation carrying this revision to the cluster (full UUID), when there is one */
  operationId: Type.Optional(Type.String()),
  /** The operation's verdict; ABSENT when the revision names no operation */
  outcome: Type.Optional(ComputeOperationStatusSchema),
  /** The operation's explanation of a non-succeeded outcome */
  outcomeReason: Type.Optional(Type.String()),
  /** ISO-8601 creation timestamp */
  createdAt: Type.String()
});
var ComputeWorkloadRevisionListSchema = Type.Object({
  /** One page of revisions, newest ordinal first */
  revisions: Type.Array(ComputeWorkloadRevisionSchema),
  /** Opaque cursor for the next page; absent on the last page */
  nextCursor: Type.Optional(Type.String())
});
var ComputeDeploymentEventObjectSchema = Type.Object({
  /** The Kubernetes kind */
  kind: Type.String(),
  /** The object's name */
  name: Type.String()
});
var ComputeDeploymentEventSchema = Type.Object({
  /** The event object's own name, stable for the life of the event */
  name: Type.String(),
  /** `Normal` or `Warning` in practice, but free-form on the wire */
  type: Type.String(),
  /** The machine-readable reason, e.g. `Scheduled`, `BackOff` */
  reason: Type.String(),
  /** The human-readable message; may be empty */
  message: Type.String(),
  /** How many times the event has recurred; 1 for a single occurrence */
  count: Type.Number(),
  /** The object the event is about */
  object: ComputeDeploymentEventObjectSchema,
  /** The controller that reported it — kubelet, deployment-controller, … */
  source: Type.Optional(Type.String()),
  /** ISO-8601 timestamp of the first occurrence */
  firstSeen: Type.Optional(Type.String()),
  /** ISO-8601 timestamp of the most recent occurrence */
  lastSeen: Type.Optional(Type.String())
});
var ComputeWorkloadDeploymentEventsSchema = Type.Object({
  /** The workload the events belong to (full UUID) */
  workloadId: Type.String(),
  /** The cluster's recent events, most recently seen first; possibly empty */
  events: Type.Array(ComputeDeploymentEventSchema)
});
var ComputeRegistrySchema = Type.Object({
  /** The registry id (full UUID) */
  registryId: Type.String(),
  /** Human label */
  name: Type.String(),
  /** Registry host as a container runtime addresses it, e.g. `ghcr.io` */
  serverUrl: Type.String(),
  /** The robot account the pull credential belongs to */
  username: Type.String(),
  /** Whether this is the tenant's default registry */
  isDefault: Type.Boolean(),
  /** ISO-8601 creation timestamp */
  createdAt: Type.String(),
  /** ISO-8601 last-update timestamp — the rotation timestamp after a rotate */
  updatedAt: Type.String()
});
var ComputeRegistrySynthesisStateSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("synthesized"),
  Type.Literal("failed")
]);
var ComputeRegistryDetailSchema = Type.Object({
  ...ComputeRegistrySchema.properties,
  /** Whether the reconciler turned the credential into a pull Secret */
  synthesisStatus: ComputeRegistrySynthesisStateSchema,
  /** The reconciler's explanation of a failed synthesis — never credential material */
  synthesisReason: Type.Optional(Type.String()),
  /** ISO-8601 timestamp of the synthesis report */
  synthesisAt: Type.Optional(Type.String())
});
var ComputeRegistryListResponseSchema = Type.Object({
  success: Type.Literal(true),
  registries: Type.Array(ComputeRegistrySchema)
});
var ComputeRegistryDetailResponseSchema = Type.Object({
  success: Type.Literal(true),
  registry: ComputeRegistryDetailSchema
});

// src/commands/compute/compute-domain.attach.ts
init_not_found();
init_parse_response_helper();
var ComputeDomainAttachCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: an attach mints a domain id, and a second attach of the same
   * hostname answers 409 — a retry of an already-recorded request would
   * surface that conflict as the caller's answer.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/domains`;
  }
  /**
   * Get the body for the request.
   *
   * OVERRIDDEN BECAUSE BOTH BRANCHES OF THE UPSTREAM BODY ARE `.strict()` —
   * that is exactly what makes the union a real XOR. The base implementation
   * would send `workloadId` (a path parameter) inside the JSON, which matches
   * NEITHER branch, so every call would be 422.
   */
  getBody() {
    const { workloadId: _workloadId, ...payload } = this.input;
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeDomainSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-domain.detach.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeDomainDetachCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/domains/${this.input.domainId}`;
  }
  /**
   * Get the body for the request. The route takes NO body.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response.
   *
   * The endpoint answers 204 with an EMPTY body, which `FlowcoreClient` turns
   * into `{ status: 204 }` before it reaches here — so this schema describes
   * that synthetic object, not anything the service serialized.
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeNoContentSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Domain", {
        workloadId: this.input.workloadId,
        domainId: this.input.domainId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-domain.list.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeDomainListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/domains`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeDomainListResponseSchema, rawResponse).domains;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-domain.verify.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeDomainVerifyCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/domains/${this.input.domainId}/verify`;
  }
  /**
   * Get the body for the request. The route takes NO body.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeDomainVerifyResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Domain", {
        workloadId: this.input.workloadId,
        domainId: this.input.domainId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-operation.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeOperationFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/operations/${this.input.operationId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeOperationSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Operation", {
        operationId: this.input.operationId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-registry.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeRegistryFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/registries/${this.input.registryId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeRegistryDetailResponseSchema, rawResponse).registry;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Registry", {
        registryId: this.input.registryId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-registry.list.ts
init_command();
init_parse_response_helper();
var ComputeRegistryListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    queryParams.set("tenantId", this.input.tenantId);
    return `/api/v1/registries?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeRegistryListResponseSchema, rawResponse).registries;
  }
};

// src/commands/compute/compute-registry.register.ts
init_command();
init_parse_response_helper();
var ComputeRegistryRegisterCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a registration mints a registry id, and a second registration of
   * the same `serverUrl` answers 409 — a retry of an already-recorded request
   * would surface that conflict as the caller's answer.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/registries";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeRegistrySchema, rawResponse);
  }
};

// src/commands/compute/compute-registry.remove.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeRegistryRemoveCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/registries/${this.input.registryId}`;
  }
  /**
   * Get the body for the request. The route takes NO body.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response.
   *
   * The endpoint answers 204 with an EMPTY body, which `FlowcoreClient` turns
   * into `{ status: 204 }` before it reaches here.
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeNoContentSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Registry", {
        registryId: this.input.registryId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-registry.rotate.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeRegistryRotateCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/registries/${this.input.registryId}`;
  }
  /**
   * Get the body for the request.
   *
   * OVERRIDDEN BECAUSE THE UPSTREAM BODY IS `.strict()` AND DELIBERATELY
   * NARROW — `{ secret }` and nothing else, so that an attempt to smuggle a
   * `serverUrl` or `isDefault` change through the rotation path is a 422. The
   * base implementation would send `registryId`, a path parameter, inside the
   * JSON and every call would be refused.
   */
  getBody() {
    const { registryId: _registryId, ...payload } = this.input;
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeRegistrySchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Registry", {
        registryId: this.input.registryId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-workload-events.list.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadEventsListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/events`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadDeploymentEventsSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-workload-logs.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadLogsFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.since !== void 0) {
      queryParams.set("since", this.input.since);
    }
    if (this.input.until !== void 0) {
      queryParams.set("until", this.input.until);
    }
    if (this.input.search !== void 0) {
      queryParams.set("search", this.input.search);
    }
    if (this.input.limit !== void 0) {
      queryParams.set("limit", this.input.limit.toString());
    }
    if (this.input.container !== void 0) {
      queryParams.set("container", this.input.container);
    }
    const qs = queryParams.toString();
    const path = `/api/v1/workloads/${this.input.workloadId}/logs`;
    return qs ? `${path}?${qs}` : path;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadLogsSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};
init_not_found();
init_parse_response_helper();
function createSseParser(onFrame) {
  let buffer = "";
  let eventName = "";
  let dataLines = [];
  let sawField = false;
  const dispatch = () => {
    if (!sawField) {
      return;
    }
    const frame = { event: eventName || "message", data: dataLines.join("\n") };
    eventName = "";
    dataLines = [];
    sawField = false;
    onFrame(frame);
  };
  return (chunk) => {
    buffer += chunk.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line === "") {
        dispatch();
        continue;
      }
      if (line.startsWith(":")) {
        continue;
      }
      const separator = line.indexOf(":");
      const field = separator === -1 ? line : line.slice(0, separator);
      let value = separator === -1 ? "" : line.slice(separator + 1);
      if (value.startsWith(" ")) {
        value = value.slice(1);
      }
      if (field === "event") {
        eventName = value;
        sawField = true;
      } else if (field === "data") {
        dataLines.push(value);
        sawField = true;
      }
    }
  };
}
function errorFrameMessage(data) {
  try {
    const parsed = JSON.parse(data);
    if (typeof parsed === "object" && parsed !== null && "message" in parsed) {
      const { message } = parsed;
      if (typeof message === "string" && message.length > 0) {
        return message;
      }
    }
  } catch {
  }
  return data || "The log stream failed after it had started";
}
var ComputeWorkloadLogStreamCommand = class extends CustomCommand {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.container !== void 0) {
      queryParams.set("container", this.input.container);
    }
    if (this.input.tailLines !== void 0) {
      queryParams.set("tailLines", this.input.tailLines.toString());
    }
    const qs = queryParams.toString();
    const path = `/api/v1/workloads/${this.input.workloadId}/logs/stream`;
    return qs ? `${path}?${qs}` : path;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
  /**
   * Custom execute method — opens the SSE connection and returns the stream
   */
  async customExecute(client) {
    const authHeader = await client.getAuthHeader();
    const abortController = new AbortController();
    const response = await fetch(`${this.getBaseUrl()}${this.getPath()}`, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        ...authHeader ? { Authorization: authHeader } : {}
      },
      signal: abortController.signal
    });
    if (!response.ok) {
      const body = await response.json().catch(() => void 0);
      const error = new ClientError(
        `${this.constructor.name} failed with ${response.status}: ${response.statusText}`,
        response.status,
        this.constructor.name,
        body
      );
      this.handleClientError(error);
      throw error;
    }
    if (!response.body) {
      throw new ClientError("Log stream response had no body", 0, this.constructor.name, {
        workloadId: this.input.workloadId
      });
    }
    const subject = new Subject();
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const push = createSseParser((frame) => {
      if (frame.event === "error") {
        subject.error(
          // The message goes in the BODY as well as the message slot:
          // ClientError renders `body` in preference to `message`, so text
          // passed only as the message would never reach the reader.
          new ClientError(errorFrameMessage(frame.data), 0, this.constructor.name, {
            workloadId: this.input.workloadId,
            message: errorFrameMessage(frame.data)
          })
        );
        return;
      }
      if (frame.event !== "log") {
        return;
      }
      subject.next(parseResponseHelper(ComputeLogStreamEventSchema, JSON.parse(frame.data)));
    });
    const pump = async () => {
      try {
        for (; ; ) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          push(decoder.decode(value, { stream: true }));
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          subject.error(error instanceof Error ? error : new Error(String(error)));
          return;
        }
      }
      subject.complete();
    };
    let started = false;
    const output$ = new Observable((subscriber) => {
      const subscription = subject.subscribe(subscriber);
      if (!started) {
        started = true;
        void pump();
      }
      return subscription;
    });
    return {
      output$,
      disconnect: () => {
        if (abortController.signal.aborted) {
          return;
        }
        abortController.abort();
        void reader.cancel().catch(() => {
        });
        subject.complete();
      }
    };
  }
};

// src/commands/compute/compute-workload-revisions.list.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadRevisionsListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.limit !== void 0) {
      queryParams.set("limit", this.input.limit.toString());
    }
    if (this.input.cursor !== void 0) {
      queryParams.set("cursor", this.input.cursor);
    }
    const qs = queryParams.toString();
    const path = `/api/v1/workloads/${this.input.workloadId}/revisions`;
    return qs ? `${path}?${qs}` : path;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadRevisionListSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-workload-runs.list.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadRunsListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    if (this.input.limit !== void 0) {
      queryParams.set("limit", this.input.limit.toString());
    }
    if (this.input.cursor !== void 0) {
      queryParams.set("cursor", this.input.cursor);
    }
    const qs = queryParams.toString();
    const path = `/api/v1/workloads/${this.input.workloadId}/runs`;
    return qs ? `${path}?${qs}` : path;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadRunListSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-workload.create.ts
init_command();
init_parse_response_helper();
var ComputeWorkloadCreateCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a create mints a workload id server-side, so a retried 502 would
   * deploy the same workload twice.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return "/api/v1/workloads";
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadResponseSchema, rawResponse).workload;
  }
};

// src/commands/compute/compute-workload.create-tracked.ts
init_command();
init_parse_response_helper();
var ComputeWorkloadCreateTrackedCommand = class extends Command {
  retryOnFailure = false;
  getMethod() {
    return "POST";
  }
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  getPath() {
    return "/api/v1/workloads";
  }
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadCreateResponseSchema, rawResponse);
  }
};

// src/commands/compute/compute-workload.delete.ts
init_command();
init_not_found();
init_parse_response_helper();

// src/commands/compute/wait-for-operation.ts
init_command_error();
init_not_found();
var DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS = 6e5;
var DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS = 1e3;
async function waitForComputeOperation(client, commandName, operationId, options) {
  const timeoutMs = options.operationTimeoutMs ?? DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS;
  const pollIntervalMs = options.operationPollIntervalMs ?? DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS;
  const start = Date.now();
  let lastSeen;
  while (Date.now() - start < timeoutMs) {
    try {
      const operation = await client.execute(new ComputeOperationFetchCommand({ operationId }));
      lastSeen = operation;
      if (operation.status === "succeeded" || operation.status === "failed") {
        return operation;
      }
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  throw new CommandError(
    commandName,
    lastSeen ? `Operation ${operationId} did not reach a terminal state within ${timeoutMs}ms (last observed status "${lastSeen.status}", phase "${lastSeen.phase}")` : `Operation ${operationId} did not appear within ${timeoutMs}ms \u2014 the reconciler filed no progress report`
  );
}

// src/commands/compute/compute-workload.delete.ts
var ComputeWorkloadDeleteCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "DELETE";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}`;
  }
  /**
   * Get the body for the request.
   *
   * The route takes NO body. Left to the base implementation it would send
   * the whole input — the path parameter and the client-side wait knobs — as
   * JSON on a DELETE.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadDeleteResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
  /**
   * Optionally wait for the teardown to finish
   */
  async processResponse(client, response) {
    if (!this.input.waitForOperation) {
      return response;
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input);
    return { ...response, operation };
  }
};

// src/commands/compute/compute-workload.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadFetchCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadResponseSchema, rawResponse).workload;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-workload.list.ts
init_command();
init_parse_response_helper();
var ComputeWorkloadListCommand = class extends Command {
  /**
   * Get the method
   */
  getMethod() {
    return "GET";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    const queryParams = new URLSearchParams();
    queryParams.set("tenantId", this.input.tenantId);
    return `/api/v1/workloads?${queryParams.toString()}`;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadListResponseSchema, rawResponse).workloads;
  }
};

// src/commands/compute/compute-workload.pause.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadPauseCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a pause mints an operation id, and the service answers 409 to a
   * second pause — a retry of an already-recorded request would surface that
   * conflict as the caller's answer.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/pause`;
  }
  /**
   * Get the body for the request. The route takes NO body.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
  /**
   * Optionally wait for the scale-down to finish
   */
  async processResponse(client, response) {
    if (!this.input.waitForOperation) {
      return response;
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input);
    return { ...response, operation };
  }
};

// src/commands/compute/compute-workload.resume.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadResumeCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a resume mints an operation id, and the service answers 409 to a
   * second resume — a retry of an already-recorded request would surface that
   * conflict as the caller's answer.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/resume`;
  }
  /**
   * Get the body for the request. The route takes NO body.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
  /**
   * Optionally wait for the scale-up to finish
   */
  async processResponse(client, response) {
    if (!this.input.waitForOperation) {
      return response;
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input);
    return { ...response, operation };
  }
};

// src/commands/compute/compute-workload.rollback.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadRollbackCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a rollback mints a revision and an operation id, and re-runs the
   * target revision's pre-sync hook.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/rollback`;
  }
  /**
   * Get the body for the request.
   *
   * The route takes NO body — the target revision is derived server-side.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
  /**
   * Optionally wait for the cluster to converge
   */
  async processResponse(client, response) {
    if (!this.input.waitForOperation) {
      return response;
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input);
    return { ...response, operation };
  }
};

// src/commands/compute/compute-workload.run.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadRunCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE: a run mints a run id and spends the tenant's compute quota, so a
   * retried 502 would start the job twice.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "POST";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}/run`;
  }
  /**
   * Get the body for the request. The route takes NO body.
   */
  getBody() {
    return void 0;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadRunResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
  /**
   * Optionally wait for the run to reach a terminal state
   */
  async processResponse(client, response) {
    if (!this.input.waitForOperation) {
      return response;
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input);
    return { ...response, operation };
  }
};

// src/commands/compute/compute-workload.update.ts
init_command();
init_command_error();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadUpdateCommand = class extends Command {
  /**
   * Whether the command should retry on failure.
   *
   * FALSE. A PATCH looks idempotent and is not: each call MINTS A REVISION
   * and an operation id server-side, and re-applying a revision re-runs the
   * workload's pre-sync hook. A retried 502 whose original request had
   * already been recorded would append a second identical revision and run
   * the migration hook twice.
   */
  retryOnFailure = false;
  /**
   * Get the method
   */
  getMethod() {
    return "PATCH";
  }
  /**
   * Get the base url
   */
  getBaseUrl() {
    return "https://compute.api.flowcore.io";
  }
  /**
   * Get the path
   */
  getPath() {
    return `/api/v1/workloads/${this.input.workloadId}`;
  }
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
  getBody() {
    const {
      workloadId: _workloadId,
      waitForOperation: _waitForOperation,
      operationTimeoutMs: _operationTimeoutMs,
      operationPollIntervalMs: _operationPollIntervalMs,
      ...payload
    } = this.input;
    if (Object.keys(payload).length === 0) {
      throw new CommandError(this.constructor.name, "No fields to update");
    }
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
  /**
   * Optionally wait for the cluster to converge
   */
  async processResponse(client, response) {
    if (!this.input.waitForOperation) {
      return response;
    }
    const operation = await waitForComputeOperation(client, this.constructor.name, response.operationId, this.input);
    return { ...response, operation };
  }
};

// src/mod.ts
init_command();

// src/common/flowcore-client.ts
init_command_error();

// src/utils/try-catch.ts
async function tryCatch(promise) {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// src/common/flowcore-client.ts
init_tenant_cache();
var RETRYABLE_ERROR_CODES = [408, 429, 500, 502, 503, 504];
function isClientOptionsBearer(options) {
  return "getBearerToken" in options;
}
function isClientOptionsApiKey(options) {
  return "apiKey" in options;
}
var FlowcoreClient = class {
  constructor(options) {
    this.options = options;
    if (isClientOptionsBearer(this.options)) {
      this.mode = "bearer";
    } else if (isClientOptionsApiKey(this.options)) {
      if (!this.options.apiKeyId) {
        const parts = this.options.apiKey.split("_");
        if (parts.length !== 3 || parts[0] !== "fc") {
          throw new Error("Invalid api key");
        }
        this.options.apiKeyId = parts[1];
      }
      this.mode = "apiKey";
    } else {
      throw new Error("Invalid client options");
    }
    if (this.options.retry === void 0) {
      this.options.retry = {
        delay: 250,
        maxRetries: 3
      };
    }
  }
  options;
  mode;
  baseUrl;
  /**
   * Get the auth header
   *
   * Public so that a `CustomCommand` which owns its own transport — a
   * streaming request whose body must NOT be consumed by `innerExecute`'s
   * unconditional `response.json()` — can authenticate its own fetch with
   * exactly the header every other command sends. Read-only: it derives the
   * header from the client options and mutates nothing.
   */
  async getAuthHeader() {
    if (this.options.getBearerToken) {
      const bearerToken = await this.options.getBearerToken();
      if (!bearerToken) {
        return null;
      }
      return `Bearer ${bearerToken}`;
    }
    if (this.options.apiKeyId && this.options.apiKey) {
      return `ApiKey ${this.options.apiKeyId}:${this.options.apiKey}`;
    }
    return null;
  }
  /**
   * Execute a command (inner method)
   */
  async innerExecute(command, retryCount = 0, direct) {
    if (typeof command.setClientAuthOptions === "function") {
      if (this.options.getBearerToken) {
        const bearerToken = await this.options.getBearerToken();
        command.setClientAuthOptions({ token: bearerToken || void 0 });
      } else if (this.options.apiKeyId && this.options.apiKey) {
        command.setClientAuthOptions({
          apiKeyId: this.options.apiKeyId,
          apiKey: this.options.apiKey
        });
      }
    }
    const request = await command.getRequest(this, direct);
    if (request.customExecute) {
      return request.customExecute(this);
    }
    if (!request.allowedModes.includes(this.mode)) {
      throw new CommandError(command.constructor.name, `Not allowed in "${this.mode}" mode`);
    }
    const { data: authHeader, error: authHeaderError } = await tryCatch(this.getAuthHeader());
    if (authHeaderError) {
      throw new ClientError("Failed to get auth header", 0, command.constructor.name, {
        command: command.constructor.name,
        error: authHeaderError
      });
    }
    const headers = {
      ...authHeader ? { Authorization: authHeader } : {},
      ...request.headers
    };
    let response;
    const url = this.baseUrl ? this.baseUrl + request.path : request.baseUrl + request.path;
    let body;
    if (typeof request.body === "object") {
      body = JSON.stringify(request.body);
    }
    try {
      response = await fetch(url, {
        method: request.method,
        headers,
        body
      });
    } catch (error) {
      if (request.retryOnFailure && this.options.retry && retryCount < this.options.retry.maxRetries) {
        const delay = this.options.retry.delay;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.innerExecute(command, retryCount + 1, direct);
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new ClientError(`Failed to execute command: ${message}`, 0, command.constructor.name, {
        command: command.constructor.name,
        error
      });
    }
    if (!response.ok) {
      if (request.retryOnFailure && this.options.retry && RETRYABLE_ERROR_CODES.includes(response.status) && retryCount < this.options.retry.maxRetries) {
        const delay = this.options.retry.delay;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.innerExecute(command, retryCount + 1, direct);
      }
      const body2 = await response.json().catch(() => void 0);
      const commandName = command.constructor.name;
      const error = new ClientError(
        `${commandName} failed with ${response.status}: ${response.statusText}`,
        response.status,
        command.constructor.name,
        body2
      );
      request.handleClientError(error);
    }
    const responseBody = response.status === 204 ? { status: response.status } : await response.json();
    const parsedBody = await request.parseResponse(responseBody);
    return request.processResponse(this, parsedBody);
  }
  /**
   * Override the base URL for all commands
   */
  setBaseUrl(baseUrl6) {
    this.baseUrl = baseUrl6;
  }
  /**
   * Execute a command
   */
  execute(command, direct) {
    return this.innerExecute(command, 0, direct);
  }
  /**
   * Close the client and clean up resources
   * This should be called when the client is no longer needed to prevent memory leaks
   */
  close() {
    tenantCache.clear();
  }
  /**
   * Dispose the client
   */
  [Symbol.dispose]() {
    this.close();
  }
};

// src/utils/logger.ts
var defaultLogger = {
  debug: (message, meta) => {
    console.debug(message, meta);
  },
  info: (message, meta) => {
    console.info(message, meta);
  },
  warn: (message, meta) => {
    console.warn(message, meta);
  },
  error: (message, meta) => {
    console.error(message, meta);
  }
};
var WebSocketConstructor = globalThis.WebSocket ?? WebSocket;
var MAX_RECONNECT_INTERVAL = 3e4;
var NotificationClient = class {
  /**
   * Creates a new NotificationClient instance
   * @param observer - RxJS Subject for emitting notification events
   * @param authOptions - Auth options for the client
   * @param subscriptionSpec - Specification for what notifications to subscribe to
   * @param options - Configuration options for the client
   */
  constructor(observer, authOptions, subscriptionSpec, options) {
    this.observer = observer;
    this.authOptions = authOptions;
    this.subscriptionSpec = subscriptionSpec;
    this.options = {
      reconnectInterval: 1e3,
      ...options
    };
    this.logger = options?.logger ?? defaultLogger;
    this.reconnectInterval = options?.reconnectInterval ?? 1e3;
  }
  observer;
  authOptions;
  subscriptionSpec;
  url = "wss://tenant.api.flowcore.io/notifications";
  webSocket;
  options;
  logger;
  eventCount = 0;
  reconnectInterval;
  reconnectAttempts = 0;
  _isOpen = false;
  _isConnecting = false;
  /**
   * Which handshake carries the credential.
   *
   * `subprotocol` is tried first and is the one that does NOT put the
   * credential in the URL. `query` is the legacy transport, kept only so this
   * client still works against a server that has not shipped subprotocol
   * support yet.
   */
  authTransport = "subprotocol";
  /** True once a handshake has settled, so the fallback is probed at most once. */
  transportSettled = false;
  /**
   * Is the websocket connection open
   */
  get isOpen() {
    return this._isOpen;
  }
  /**
   * Is the websocket connection currently connecting
   */
  get isConnecting() {
    return this._isConnecting;
  }
  /**
   * Establishes WebSocket connection and sets up event handlers
   */
  async connect() {
    if (this._isConnecting || this._isOpen) {
      this.logger.debug("Is already connecting or open");
      return;
    }
    this._isConnecting = true;
    let flowcoreClient = null;
    const urlParams = new URLSearchParams();
    let credential;
    if ("oidcClient" in this.authOptions) {
      const oidcClient = this.authOptions.oidcClient;
      flowcoreClient = new FlowcoreClient({
        getBearerToken: async () => (await oidcClient.getToken()).accessToken
      });
      credential = { kind: "bearer", token: (await oidcClient.getToken()).accessToken };
    } else {
      flowcoreClient = new FlowcoreClient({
        apiKey: this.authOptions.apiKey,
        ...this.authOptions.apiKeyId ? { apiKeyId: this.authOptions.apiKeyId } : {}
      });
      credential = {
        kind: "apiKey",
        apiKey: this.authOptions.apiKey,
        ...this.authOptions.apiKeyId ? { apiKeyId: this.authOptions.apiKeyId } : {}
      };
    }
    const handshake = this.buildCredentialHandshake(credential);
    for (const [key, value] of handshake.query) {
      urlParams.set(key, value);
    }
    const credentialProtocols = handshake.protocols;
    const dataCore = await flowcoreClient.execute(
      new DataCoreFetchCommand({
        tenant: this.subscriptionSpec.tenant,
        dataCore: this.subscriptionSpec.dataCore
      })
    );
    let flowType;
    let eventType;
    if (this.subscriptionSpec.flowType) {
      flowType = await flowcoreClient.execute(
        new FlowTypeFetchCommand({
          dataCoreId: dataCore.id,
          flowType: this.subscriptionSpec.flowType
        })
      );
      if (this.subscriptionSpec.eventType) {
        eventType = await flowcoreClient.execute(
          new EventTypeFetchCommand({
            flowTypeId: flowType?.id,
            eventType: this.subscriptionSpec.eventType
          })
        );
      }
    }
    const query = urlParams.toString();
    this.webSocket = new WebSocketConstructor(
      query ? `${this.url}?${query}` : this.url,
      credentialProtocols.length > 0 ? credentialProtocols : void 0
    );
    this.webSocket.onopen = () => {
      this._isOpen = true;
      this._isConnecting = false;
      this.transportSettled = true;
      this.logger.debug("WebSocket connection opened.");
      this.reconnectInterval = this.options.reconnectInterval;
      this.reconnectAttempts = 0;
      this.webSocket.send(
        JSON.stringify({
          tenant: this.subscriptionSpec.tenant,
          dataCoreId: dataCore.id,
          flowTypeId: flowType?.id,
          eventTypeId: eventType?.id
        })
      );
    };
    this.webSocket.onmessage = (event) => {
      let parsedData;
      if (event.data instanceof ArrayBuffer) {
        parsedData = new TextDecoder().decode(event.data);
      } else if (Buffer.isBuffer(event.data)) {
        parsedData = event.data.toString();
      } else if (Array.isArray(event.data)) {
        parsedData = Buffer.concat(event.data).toString();
      } else {
        parsedData = event.data;
      }
      this.handleMessage(parsedData);
    };
    this.webSocket.onclose = (event) => {
      this._isOpen = false;
      this.logger.debug(`Connection closed: Code [${event.code}], Reason: ${event.reason}`);
      if (this.shouldFallBackToQueryTransport()) {
        this.fallBackToQueryTransport();
        return;
      }
      if (![1e3].includes(event.code)) {
        this.attemptReconnect();
        return;
      }
      this._isConnecting = false;
      this.observer.complete();
    };
    this.webSocket.onerror = (error) => {
      if (this.shouldFallBackToQueryTransport()) {
        this.logger.debug("Subprotocol handshake refused; retrying on the legacy query transport");
        this.webSocket.close();
        return;
      }
      this.logger.error(`WebSocket encountered error: ${error}`);
      this.observer.error(error);
      this.webSocket.close();
    };
  }
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
  buildCredentialHandshake(credential) {
    const query = new URLSearchParams();
    const protocols = [];
    if (this.authTransport === "query") {
      if (credential.kind === "bearer") {
        query.set("token", credential.token);
      } else {
        query.set("api_key", credential.apiKey);
        if (credential.apiKeyId) {
          query.set("api_key_id", credential.apiKeyId);
        }
      }
      return { query, protocols };
    }
    if (credential.kind === "bearer") {
      protocols.push("flowcore-bearer", credential.token);
    } else {
      protocols.push("flowcore-api-key", credential.apiKey);
      if (credential.apiKeyId) {
        protocols.push(credential.apiKeyId);
      }
    }
    return { query, protocols };
  }
  /**
   * True when the subprotocol handshake has just failed for the first time.
   *
   * The fallback is probed at most ONCE per client. After it settles, a later
   * failure is a real failure and goes through normal reconnect handling.
   */
  shouldFallBackToQueryTransport() {
    return this.authTransport === "subprotocol" && !this.transportSettled && !this._isOpen;
  }
  /**
   * Switches to the legacy query-string transport and reconnects immediately.
   *
   * This does NOT count as a reconnect attempt: no backoff is consumed and the
   * caller sees one continuous connection attempt.
   */
  fallBackToQueryTransport() {
    this.transportSettled = true;
    this.authTransport = "query";
    this._isConnecting = false;
    this.logger.debug("Falling back to the legacy query-string credential transport");
    void this.connect();
  }
  /**
   * Parses and dispatches a single raw notification frame.
   *
   * Runs inside the WebSocket `onmessage` callback, where any thrown error is
   * uncaught and crashes the host process. Notification frames can occasionally
   * be malformed (non-JSON, empty/absent `message`, truncated payloads, or
   * non-event control frames), so every parse is guarded — a bad frame is logged
   * and skipped instead of taking down the whole connection/process.
   */
  handleMessage(rawData) {
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (error) {
      this.logger.warn(
        `Discarding notification frame: outer payload is not valid JSON (${error instanceof Error ? error.message : String(error)})`
      );
      return;
    }
    if (data.type === "validation") {
      this.logger.error(`Bad request: ${data.summary} - ${data.message} - ${data.found} - ${data.errors}`);
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(data.message);
    } catch (error) {
      this.logger.warn(
        `Discarding notification frame: 'message' is not valid JSON (type ${typeof data.message}): ${error instanceof Error ? error.message : String(error)}`
      );
      return;
    }
    if (!parsed || typeof parsed !== "object" || !parsed.data) {
      this.logger.warn("Discarding notification frame: parsed payload is missing a 'data' field");
      return;
    }
    this.logger.debug(`Received event: ${parsed.pattern}`);
    this.observer.next({
      pattern: parsed.pattern,
      data: {
        tenant: parsed.data.tenantId,
        eventId: parsed.data.eventId,
        dataCoreId: parsed.data.dataCore,
        flowType: parsed.data.aggregator,
        eventType: parsed.data.eventType,
        validTime: parsed.data.validTime
      }
    });
    this.eventCount++;
    if (this.options.maxEvents && this.options.maxEvents <= this.eventCount) {
      this.observer.complete();
      this.eventCount = 0;
      this.webSocket.close(1e3, "Max events received");
    }
  }
  /**
   * Attempts to reconnect to the WebSocket server using exponential backoff
   */
  attemptReconnect() {
    if (this.options.maxReconnects && this.reconnectAttempts >= this.options.maxReconnects) {
      this.logger.error(
        `Max reconnect attempts ${this.reconnectAttempts}/${this.options.maxReconnects} reached. Giving up.`
      );
      return;
    }
    this.reconnectAttempts++;
    this._isConnecting = true;
    this.logger.info(
      `Attempting reconnection ${this.reconnectAttempts}${this.options.maxReconnects ? `/${this.options.maxReconnects}` : ""} in ${this.reconnectInterval} ms...`
    );
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
    this.reconnectInterval = Math.min(MAX_RECONNECT_INTERVAL, this.reconnectInterval * 2);
  }
  /**
   * Closes the WebSocket connection
   */
  disconnect() {
    if (this.webSocket) {
      this.webSocket.close(1e3, "Disconnected by user");
    }
  }
  /**
   * Overrides the base WebSocket URL for testing or different environments
   * @param url - The new base URL to use
   */
  overrideBaseUrl(url) {
    this.url = url;
  }
};
var MAX_RECONNECT_INTERVAL2 = 3e4;
var WEBSOCKET_CLOSING = 2;
var WEBSOCKET_CLOSED = 3;
var WebSocketConstructor2 = globalThis.WebSocket ?? WebSocket;
var WebSocketClient = class {
  /**
   * Creates a new WebSocketClient instance.
   * @param authOptions - Authentication options (Bearer token via OIDC client or API Key).
   * @param options - Configuration options for the client.
   * @param webSocketFactory - Optional WebSocket factory for testing.
   */
  constructor(authOptions, options, webSocketFactory) {
    this.authOptions = authOptions;
    this.options = { reconnectInterval: 1e3, ...options };
    this.logger = options?.logger ?? defaultLogger;
    this.reconnectInterval = this.options.reconnectInterval;
    this.webSocketFactory = webSocketFactory ?? ((url) => new WebSocketConstructor2(url));
    this.overrideBaseUrl = void 0;
    if ("getBearerToken" in authOptions === false && "apiKey" in authOptions === false) {
      throw new Error("Invalid authOptions: Must provide either getBearerToken or apiKey/apiKeyId");
    }
  }
  authOptions;
  overrideBaseUrl;
  // Field to store the override URL
  webSocket;
  options;
  logger;
  reconnectInterval;
  reconnectAttempts = 0;
  _isOpen = false;
  _isConnecting = false;
  webSocketFactory;
  // Internal subject to push received data
  internalSubject = new Subject();
  // Store the current command and config for reconnects and sending
  currentCommand = null;
  currentConfig = null;
  /**
   * Override the base URL provided by commands.
   * @param baseUrl - The new base URL to use (e.g., "wss://staging-server.api.flowcore.io").
   */
  setBaseUrl(baseUrl6) {
    this.logger.info(`WebSocket base URL overridden to: ${baseUrl6}`);
    this.overrideBaseUrl = baseUrl6;
  }
  /**
   * Returns true if the WebSocket connection is currently open.
   */
  get isOpen() {
    return this._isOpen;
  }
  /**
   * Returns true if the client is currently attempting to establish a WebSocket connection.
   */
  get isConnecting() {
    return this._isConnecting;
  }
  /**
   * Establishes WebSocket connection based on the provided command.
   * Disconnects any existing connection before starting the new one.
   * @param command - The command defining the stream connection details.
   * @returns An interface to interact with the active stream.
   */
  // Using generic types for the command
  async connect(command) {
    if (this._isConnecting || this._isOpen) {
      this.logger.debug("Disconnecting existing stream before starting new one.");
      this.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    this.currentCommand = command;
    const config = command.getConfig();
    this.currentConfig = config;
    this._isConnecting = true;
    const baseUrl6 = this.overrideBaseUrl ?? command.getWebSocketBaseUrl();
    const pathSegment = command.getWebSocketPathSegment(config);
    this.logger.debug(`Attempting to connect stream: ${baseUrl6}${pathSegment}`);
    try {
      const urlParams = new URLSearchParams();
      if ("getBearerToken" in this.authOptions && this.authOptions.getBearerToken) {
        const token = await this.authOptions.getBearerToken();
        if (!token) throw new Error("Failed to get bearer token");
        urlParams.set("token", token);
      } else if ("apiKey" in this.authOptions && this.authOptions.apiKey && this.authOptions.apiKeyId) {
        urlParams.set("api_key", this.authOptions.apiKey);
        urlParams.set("api_key_id", this.authOptions.apiKeyId);
      } else {
        throw new Error("Invalid authentication configuration.");
      }
      const cleanedBaseUrl = baseUrl6.endsWith("/") ? baseUrl6.slice(0, -1) : baseUrl6;
      const cleanedPathSegment = pathSegment.startsWith("/") ? pathSegment.slice(1) : pathSegment;
      const streamUrl = `${cleanedBaseUrl}/${cleanedPathSegment}?${urlParams.toString()}`;
      this.logger.debug(`Connecting to WebSocket URL: ${streamUrl}`);
      this.webSocket = this.webSocketFactory(streamUrl);
      this.setupEventHandlers();
      return {
        output$: this.internalSubject.asObservable(),
        send: (payload) => this.sendMessage(payload),
        disconnect: () => this.disconnect()
      };
    } catch (error) {
      this.logger.error(`Failed to initiate connection: ${error}`);
      this._isConnecting = false;
      this.currentCommand = null;
      this.currentConfig = null;
      throw error;
    }
  }
  /**
   * Sets up the WebSocket event handlers (onopen, onmessage, onclose, onerror).
   */
  setupEventHandlers() {
    this.webSocket.onopen = () => {
      this._isOpen = true;
      this._isConnecting = false;
      const baseUrl6 = this.overrideBaseUrl ?? this.currentCommand?.getWebSocketBaseUrl();
      const pathSegment = this.currentCommand?.getWebSocketPathSegment(this.currentConfig);
      const logUrl = baseUrl6 && pathSegment ? `${baseUrl6.replace(/\/?$/, "/")}${pathSegment.replace(/^\/?/, "")}` : "(unknown URL)";
      this.logger.debug(`WebSocket connection opened: ${logUrl}`);
      this.reconnectInterval = this.options.reconnectInterval;
      this.reconnectAttempts = 0;
    };
    this.webSocket.onmessage = (event) => {
      try {
        let parsedData;
        if (event.data instanceof ArrayBuffer) {
          parsedData = new TextDecoder().decode(event.data);
        } else if (Buffer.isBuffer(event.data)) {
          parsedData = event.data.toString();
        } else {
          parsedData = event.data;
        }
        const chunk = JSON.parse(parsedData);
        if (typeof chunk !== "object" || chunk === null || typeof chunk.type !== "string") {
          this.logger.warn(`Received invalid chunk format: ${parsedData}`);
          return;
        }
        this.logger.debug(`Received chunk: ${chunk.type}`);
        this.internalSubject.next(chunk);
      } catch (error) {
        this.logger.error(`Error processing received message: ${error}`);
      }
    };
    this.webSocket.onclose = (event) => {
      const wasOpen = this._isOpen;
      this._isOpen = false;
      this._isConnecting = false;
      const baseUrl6 = this.overrideBaseUrl ?? this.currentCommand?.getWebSocketBaseUrl();
      const pathSegment = this.currentCommand?.getWebSocketPathSegment(this.currentConfig);
      const logUrl = baseUrl6 && pathSegment ? `${baseUrl6.replace(/\/?$/, "/")}${pathSegment.replace(/^\/?/, "")}` : "(unknown URL)";
      this.logger.debug(
        `WebSocket connection closed: ${logUrl} Code [${event.code}], Reason: ${event.reason || "No reason given"}
. Was open: ${wasOpen}`
      );
      if (wasOpen && event.code !== 1e3 && this.currentCommand) {
        this.attemptReconnect();
      } else {
        this.logger.debug(`Completing internal subject due to close event.`);
        this.internalSubject.complete();
        this.currentCommand = null;
        this.currentConfig = null;
      }
    };
    this.webSocket.onerror = () => {
      const baseUrl6 = this.overrideBaseUrl ?? this.currentCommand?.getWebSocketBaseUrl();
      const pathSegment = this.currentCommand?.getWebSocketPathSegment(this.currentConfig);
      const logUrl = baseUrl6 && pathSegment ? `${baseUrl6.replace(/\/?$/, "/")}${pathSegment.replace(/^\/?/, "")}` : "(unknown URL)";
      this.logger.error(`WebSocket encountered an error for stream: ${logUrl}.`);
      if (this.webSocket.readyState !== WEBSOCKET_CLOSED && this.webSocket.readyState !== WEBSOCKET_CLOSING) {
        this.webSocket.close(1011, "WebSocket error");
      }
      this.internalSubject.error(new Error("WebSocket encountered an error"));
    };
  }
  /**
   * Attempts to reconnect to the WebSocket server using exponential backoff.
   * Requires `currentConfig` to be set.
   */
  attemptReconnect() {
    if (!this.currentCommand || !this.currentConfig) {
      this.logger.error("Cannot reconnect without current command/config.");
      if (!this.internalSubject.closed) this.internalSubject.complete();
      return;
    }
    if (this._isConnecting) {
      this.logger.debug("Reconnect attempt already in progress.");
      return;
    }
    const baseUrl6 = this.overrideBaseUrl ?? this.currentCommand.getWebSocketBaseUrl();
    const pathSegment = this.currentCommand.getWebSocketPathSegment(this.currentConfig);
    const logUrl = baseUrl6 && pathSegment ? `${baseUrl6.replace(/\/?$/, "/")}${pathSegment.replace(/^\/?/, "")}` : "(unknown URL)";
    if (this.options.maxReconnects && this.reconnectAttempts >= this.options.maxReconnects) {
      this.logger.error(
        `Max reconnect attempts (${this.reconnectAttempts}/${this.options.maxReconnects}) reached. Giving up: ${logUrl}`
      );
      if (!this.internalSubject.closed) this.internalSubject.complete();
      this.currentCommand = null;
      this.currentConfig = null;
      return;
    }
    this.reconnectAttempts++;
    this._isConnecting = true;
    this.logger.info(
      `Attempting reconnection ${this.reconnectAttempts}${this.options.maxReconnects ? `/${this.options.maxReconnects}` : ""}
         for ${logUrl} in ${this.reconnectInterval} ms...`
    );
    setTimeout(async () => {
      if (!this.currentCommand || !this.currentConfig) {
        this.logger.debug("Reconnect cancelled as disconnect was called.");
        this._isConnecting = false;
        if (!this.internalSubject.closed) this.internalSubject.complete();
        return;
      }
      try {
        const urlParams = new URLSearchParams();
        if ("getBearerToken" in this.authOptions && this.authOptions.getBearerToken) {
          const token = await this.authOptions.getBearerToken();
          if (!token) throw new Error("Reconnect failed: Could not get bearer token");
          urlParams.set("token", token);
        } else if ("apiKey" in this.authOptions && this.authOptions.apiKey && this.authOptions.apiKeyId) {
          urlParams.set("api_key", this.authOptions.apiKey);
          urlParams.set("api_key_id", this.authOptions.apiKeyId);
        } else {
          throw new Error("Reconnect failed: Invalid authentication configuration.");
        }
        const streamUrl = `${baseUrl6}${pathSegment}?${urlParams.toString()}`;
        this.logger.debug(`Reconnecting to WebSocket URL: ${streamUrl}`);
        this.webSocket = this.webSocketFactory(streamUrl);
        this.setupEventHandlers();
      } catch (error) {
        this.logger.error(`Reconnect attempt connection failed: ${error}`);
        this._isConnecting = false;
        this.reconnectInterval = Math.min(MAX_RECONNECT_INTERVAL2, this.reconnectInterval * 2);
        this.attemptReconnect();
      }
    }, this.reconnectInterval);
    this.reconnectInterval = Math.min(MAX_RECONNECT_INTERVAL2, this.reconnectInterval * 2);
  }
  /**
   * Sends a message to the currently connected WebSocket.
   * @param message - The message object to send (e.g., { content: "user input" }).
   */
  sendMessage(payload) {
    const openState = 1;
    if (!this._isOpen || this.webSocket.readyState !== openState || !this.currentCommand) {
      this.logger.warn("Cannot send message: WebSocket is not open or command not set.");
      return false;
    }
    try {
      const serializer = this.currentCommand.serializeSendPayload ?? JSON.stringify;
      const dataToSend = serializer(payload);
      this.webSocket.send(dataToSend);
      this.logger.debug(`Sent message: ${dataToSend}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message: ${error}`);
      return false;
    }
  }
  /**
   * Closes the WebSocket connection gracefully.
   */
  disconnect() {
    this.logger.debug("Disconnect called by user.");
    const commandToClear = this.currentCommand;
    this.currentCommand = null;
    this.currentConfig = null;
    if (this.webSocket) {
      if (this._isOpen || this._isConnecting) {
        this.webSocket.close(1e3, "Disconnected by user");
      } else {
        this.logger.debug("WebSocket already closed or closing.");
      }
    } else {
      this.logger.debug("No WebSocket instance to disconnect.");
    }
    this._isOpen = false;
    this._isConnecting = false;
    if (commandToClear && !this.internalSubject.closed) {
      this.logger.debug("Completing internal subject due to disconnect call.");
      this.internalSubject.complete();
    }
  }
  /**
   * Implements the Disposable interface for clean resource management.
   */
  [Symbol.dispose]() {
    this.disconnect();
  }
};

// src/mod.ts
init_parse_response_helper();

export { ApiKeyCreateCommand, ApiKeyDeleteCommand, ApiKeyEditCommand, ApiKeyFetchCommand, ApiKeyListCommand, ApiKeyValidateCommand, ApiKeyValidateWithTenantIdCommand, ArchivePolicyResponseSchema, ArchiveRoleResponseSchema, ArtifactGetCommand, AuditLogEntrySchema, AuditLogResponseSchema, AwsMarketplaceCustomerResolveCommand, AwsMarketplaceLinkCreateCommand, AwsMarketplaceLinkDeleteCommand, AwsMarketplaceLinkFetchCommand, AwsMarketplaceLinkListCommand, ClientError, Command, CommandError, ComputeDeploymentEventObjectSchema, ComputeDeploymentEventSchema, ComputeDomainAttachCommand, ComputeDomainDetachCommand, ComputeDomainListCommand, ComputeDomainListResponseSchema, ComputeDomainSchema, ComputeDomainStatusSchema, ComputeDomainTlsSchema, ComputeDomainTlsStatusSchema, ComputeDomainVerificationSchema, ComputeDomainVerificationTypeSchema, ComputeDomainVerifyCommand, ComputeDomainVerifyResponseSchema, ComputeLogEntrySchema, ComputeLogStreamEventSchema, ComputeLogStreamNameSchema, ComputeNoContentSchema, ComputeOperationDeploymentProgressSchema, ComputeOperationFetchCommand, ComputeOperationPhaseSchema, ComputeOperationPreSyncProgressSchema, ComputeOperationProgressSchema, ComputeOperationSchema, ComputeOperationStatusSchema, ComputeOperationStepStatusSchema, ComputeOperationTypeSchema, ComputePreSyncSpecSchema, ComputeProbeExecSchema, ComputeProbeHttpGetSchema, ComputeProbeSchema, ComputeProbeTcpSocketSchema, ComputeRegistryDetailResponseSchema, ComputeRegistryDetailSchema, ComputeRegistryFetchCommand, ComputeRegistryListCommand, ComputeRegistryListResponseSchema, ComputeRegistryRegisterCommand, ComputeRegistryRemoveCommand, ComputeRegistryRotateCommand, ComputeRegistrySchema, ComputeRegistrySynthesisStateSchema, ComputeSlotTierSchema, ComputeWorkloadCreateCommand, ComputeWorkloadCreateResponseSchema, ComputeWorkloadCreateTrackedCommand, ComputeWorkloadDefinitionSchema, ComputeWorkloadDeleteCommand, ComputeWorkloadDeleteResponseSchema, ComputeWorkloadDeploymentEventsSchema, ComputeWorkloadEnvVarSchema, ComputeWorkloadEventsListCommand, ComputeWorkloadFetchCommand, ComputeWorkloadKindSchema, ComputeWorkloadListCommand, ComputeWorkloadListResponseSchema, ComputeWorkloadLogStreamCommand, ComputeWorkloadLogsFetchCommand, ComputeWorkloadLogsSchema, ComputeWorkloadMutationResponseSchema, ComputeWorkloadPauseCommand, ComputeWorkloadProbesSchema, ComputeWorkloadResponseSchema, ComputeWorkloadResumeCommand, ComputeWorkloadRevisionCauseSchema, ComputeWorkloadRevisionListSchema, ComputeWorkloadRevisionSchema, ComputeWorkloadRevisionsListCommand, ComputeWorkloadRollbackCommand, ComputeWorkloadRunCommand, ComputeWorkloadRunKindSchema, ComputeWorkloadRunListSchema, ComputeWorkloadRunResponseSchema, ComputeWorkloadRunSchema, ComputeWorkloadRunStatusSchema, ComputeWorkloadRunsListCommand, ComputeWorkloadScalingModeSchema, ComputeWorkloadScalingSchema, ComputeWorkloadSchema, ComputeWorkloadSecretRefSchema, ComputeWorkloadStatusSchema, ComputeWorkloadUpdateCommand, ComputeWorkloadVolumeSchema, ContainerRegistListCommand, ContainerRegistryCreateCommand, ContainerRegistryDeleteCommand, ContainerRegistryFetchCommand, ContainerRegistryUpdateCommand, ContextAddItemCommand, ContextRemoveItemCommand, ConversationDeleteCommand, ConversationGetCommand, ConversationListCommand, ConversationStreamCommand, CustomCommand, DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS, DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS, DataCoreCreateCommand, DataCoreExistsCommand, DataCoreFetchCommand, DataCoreListCommand, DataCoreRequestDeleteCommand, DataCoreUpdateCommand, DataPathwayAssignmentCompleteCommand, DataPathwayAssignmentExpireLeasesCommand, DataPathwayAssignmentFetchCommand, DataPathwayAssignmentHeartbeatCommand, DataPathwayAssignmentListCommand, DataPathwayAssignmentNextCommand, DataPathwayCapacityFetchCommand, DataPathwayCommandDispatchConfigUpdateCommand, DataPathwayCommandDispatchPauseCommand, DataPathwayCommandDispatchRestartCommand, DataPathwayCommandDispatchResumeCommand, DataPathwayCommandDispatchStopCommand, DataPathwayCommandFetchCommand, DataPathwayCommandPendingByPathwayCommand, DataPathwayCommandPendingCommand, DataPathwayCommandUpdateStatusByPathwayCommand, DataPathwayCommandUpdateStatusCommand, DataPathwayCreateCommand, DataPathwayDeleteCommand, DataPathwayDeliveryLogBatchCommand, DataPathwayDeliveryLogListCommand, DataPathwayDisableCommand, DataPathwayFetchByNameCommand, DataPathwayFetchCommand, DataPathwayHealthCheckCommand, DataPathwayListCommand, DataPathwayMetricsFetchCommand, DataPathwayPumpStateFetchBySourceCommand, DataPathwayPumpStateFetchCommand, DataPathwayPumpStateSaveBySourceCommand, DataPathwayPumpStateSaveCommand, DataPathwayQuotaFetchCommand, DataPathwayQuotaListCommand, DataPathwayQuotaSetCommand, DataPathwayRestartFetchCommand, DataPathwayRestartRequestCommand, DataPathwaySlotDeregisterCommand, DataPathwaySlotFetchCommand, DataPathwaySlotHeartbeatCommand, DataPathwaySlotListCommand, DataPathwaySlotRegisterCommand, DataPathwayUpsertByNameCommand, DataPathwayUpsertByNameResponseSchema, EntitlementResponseSchema, EventListCommand, EventTypeCreateCommand, EventTypeExistsCommand, EventTypeFetchCommand, EventTypeInfoCommand, EventTypeListCommand, EventTypeListRemovedSensitiveDataCommand, EventTypeRemoveSensitiveDataCommand, EventTypeRequestDeleteCommand, EventTypeRequestTruncateCommand, EventTypeUpdateCommand, EventsFetchCommand, EventsFetchTimeBucketsByNamesCommand, FetchPumpStatusCommand, FlowTypeCreateCommand, FlowTypeExistsCommand, FlowTypeFetchCommand, FlowTypeListCommand, FlowTypeRequestDeleteCommand, FlowTypeUpdateCommand, FlowcoreClient, IngestBatchCommand, IngestEventCommand, InvalidResponseException, KeyPoliciesCommand, KeyPolicyLinkSchema, KeyRoleLinkSchema, KeyRolesCommand, LinkKeyPolicyCommand, LinkKeyRoleCommand, LinkRolePolicyCommand, LinkUserPolicyCommand, LinkUserRoleCommand, NotFoundException, NotificationClient, OrganizationPoliciesCommand, OrganizationRolesCommand, PaginationSchema, PermissionsListCommand, PolicyArchiveCommand, PolicyAssociationsCommand, PolicyAssociationsSchema, PolicyCreateCommand, PolicyFilterSchema, PolicyFilterValueSchema, PolicyGetCommand, PolicyKeyAssociationSchema, PolicyListCommand, PolicyRoleAssociationSchema, PolicySchema, PolicyStatementSchema, PolicyUpdateCommand, PolicyUserAssociationSchema, PolicyValidateCommand, PolicyValidateResponseSchema, ResolveKeyEntitlementsCommand, ResolveUserEntitlementsCommand, RoleArchiveCommand, RoleAssociationsCommand, RoleAssociationsSchema, RoleCreateCommand, RoleGetCommand, RoleKeyAssociationSchema, RoleListCommand, RolePoliciesCommand, RolePolicyLinkSchema, RoleSchema, RoleUpdateCommand, RoleUserAssociationSchema, SecretCreateCommand, SecretDeleteCommand, SecretEditCommand, SecretFetchCommand, SecretListCommand, SecurityCreatePATCommand, SecurityDeletePATCommand, SecurityExchangePATCommand, SecurityGetPATCommand, SecurityListPATCommand, SendPumpPulseCommand, ServiceAccountCreateCommand, ServiceAccountDeleteCommand, ServiceAccountEditCommand, ServiceAccountFetchCommand, ServiceAccountListCommand, ServiceAccountRotateSecretCommand, TenantAuditLogsCommand, TenantCreateCommand, TenantDisableSensitiveDataCommand, TenantEnableSensitiveDataCommand, TenantFetchCommand, TenantInstanceFetchCommand, TenantListCommand, TenantPreviewCommand, TenantTranslateNameToIdCommand, TenantTranslateNameToIdSchema, TenantUpdateCommand, TenantUserAddCommand, TenantUserListCommand, TenantUserRemoveCommand, TimeBucketListCommand, UnlinkKeyPolicyCommand, UnlinkKeyRoleCommand, UnlinkRolePolicyCommand, UnlinkUserPolicyCommand, UnlinkUserRoleCommand, UserDeleteCommand, UserInitializeInKeycloakCommand, UserInviteToTenantCommand, UserPermissionSchema, UserPermissionsCommand, UserPoliciesCommand, UserPolicyLinkSchema, UserRoleLinkSchema, UserRolesCommand, ValidPolicySchema, ValidateKeyCommand, ValidateUserCommand, ValidationResponseSchema, VariableCreateCommand, VariableDeleteCommand, VariableEditCommand, VariableFetchCommand, VariableListCommand, WebSocketClient, isEncryptedPayload, matchesPolicyFilters, parseEntitlementResponse, parseResponseHelper, permitsPayload, waitForComputeOperation };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map