'use strict';

var typebox = require('@sinclair/typebox');
var value = require('@sinclair/typebox/value');
var rxjs = require('rxjs');
var ws = require('ws');
var buffer = require('buffer');

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
exports.CommandError = void 0;
var init_command_error = __esm({
  "src/exceptions/command-error.ts"() {
    exports.CommandError = class extends Error {
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
    TenantSchema = typebox.Type.Object({
      id: typebox.Type.String(),
      name: typebox.Type.String(),
      displayName: typebox.Type.String(),
      description: typebox.Type.String(),
      websiteUrl: typebox.Type.String(),
      isDedicated: typebox.Type.Boolean(),
      dedicated: typebox.Type.Union([
        typebox.Type.Null(),
        typebox.Type.Object({
          status: typebox.Type.Union([
            typebox.Type.Literal("ready"),
            typebox.Type.Literal("degraded"),
            typebox.Type.Literal("offline")
          ]),
          configuration: typebox.Type.Object({
            domain: typebox.Type.String(),
            configurationRepoUrl: typebox.Type.String(),
            configurationRepoCredentials: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])
          })
        })
      ]),
      sensitiveDataEnabled: typebox.Type.Optional(typebox.Type.Boolean())
    });
    TenantListItemSchema = typebox.Type.Object({
      id: typebox.Type.String(),
      name: typebox.Type.String(),
      displayName: typebox.Type.String(),
      description: typebox.Type.String(),
      websiteUrl: typebox.Type.String(),
      isDedicated: typebox.Type.Boolean(),
      sensitiveDataEnabled: typebox.Type.Boolean(),
      domain: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
      permissions: typebox.Type.Array(typebox.Type.String())
    });
    TenantUserSchema = typebox.Type.Object({
      id: typebox.Type.String(),
      username: typebox.Type.String(),
      email: typebox.Type.String(),
      firstName: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
      lastName: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])
    });
    TenantPreviewSchema = typebox.Type.Object({
      displayName: typebox.Type.String(),
      websiteUrl: typebox.Type.String(),
      description: typebox.Type.String()
    });
    TenantInstanceSchema = typebox.Type.Object({
      isDedicated: typebox.Type.Boolean(),
      instance: typebox.Type.Union([
        typebox.Type.Null(),
        typebox.Type.Object({
          status: typebox.Type.String(),
          domain: typebox.Type.String()
        })
      ])
    });
  }
});

// src/exceptions/not-found.ts
exports.NotFoundException = void 0;
var init_not_found = __esm({
  "src/exceptions/not-found.ts"() {
    exports.NotFoundException = class extends Error {
      constructor(resource, filters) {
        super(`${resource} not found: ${JSON.stringify(filters)}`);
      }
    };
  }
});

// src/exceptions/invalid-response.ts
exports.InvalidResponseException = void 0;
var init_invalid_response = __esm({
  "src/exceptions/invalid-response.ts"() {
    exports.InvalidResponseException = class extends Error {
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
exports.parseResponseHelper = void 0;
var init_parse_response_helper = __esm({
  "src/utils/parse-response-helper.ts"() {
    init_invalid_response();
    exports.parseResponseHelper = (schema, response) => {
      if (!value.Value.Check(schema, response)) {
        const parseErrors = value.Value.Errors(schema, response);
        const errors = {};
        for (const error of parseErrors) {
          errors[error.path] = error.message;
        }
        throw new exports.InvalidResponseException("Invalid response", errors);
      }
      return response;
    };
  }
});

// src/commands/tenant/tenant-instance.fetch.ts
var tenant_instance_fetch_exports = {};
__export(tenant_instance_fetch_exports, {
  TenantInstanceFetchCommand: () => exports.TenantInstanceFetchCommand
});
exports.TenantInstanceFetchCommand = void 0;
var init_tenant_instance_fetch = __esm({
  "src/commands/tenant/tenant-instance.fetch.ts"() {
    init_command();
    init_tenant();
    init_not_found();
    init_parse_response_helper();
    exports.TenantInstanceFetchCommand = class extends exports.Command {
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
        return exports.parseResponseHelper(TenantInstanceSchema, rawResponse);
      }
      /**
       * Handle the client error
       */
      handleClientError(error) {
        if (error.status === 404) {
          throw new exports.NotFoundException("Tenant", {
            [this.input.tenantId ? "id" : "name"]: this.input.tenantId ?? this.input.tenant
          });
        }
        throw error;
      }
    };
  }
});

// src/common/command.ts
exports.Command = void 0;
var init_command = __esm({
  "src/common/command.ts"() {
    init_command_error();
    init_tenant_cache();
    exports.Command = class {
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
          throw new exports.CommandError(this.constructor.name, `Tenant ${inputTenant} does not have a dedicated domain configured`);
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
var ArtifactSchema = typebox.Type.Object({
  artifactId: typebox.Type.String({ example: "artifact_code_123" }),
  artifactType: typebox.Type.Union([
    typebox.Type.Literal("code"),
    typebox.Type.Literal("markdown"),
    typebox.Type.Literal("table"),
    typebox.Type.Literal("visualization"),
    typebox.Type.Literal("html"),
    typebox.Type.Literal("mermaid")
  ], { description: "Type of artifact" }),
  title: typebox.Type.String({ example: "Example Code Snippet" }),
  content: typebox.Type.Optional(typebox.Type.String({ description: "String content" })),
  data: typebox.Type.Optional(typebox.Type.Unknown({ description: "JSON data" })),
  url: typebox.Type.Optional(typebox.Type.String({ format: "uri", description: "URL content" }))
});
var ArtifactGetCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(ArtifactSchema, rawResponse);
    return response;
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Artifact", { id: this.input.artifactId });
    }
    throw error;
  }
};

// src/commands/ai-agent-coordinator/context-add-item.command.ts
init_command();
var service = "ai-coordinator";
var baseUrl = `https://${service}.api.flowcore.io`;
var ContextAddItemCommand = class extends exports.Command {
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
var ContextRemoveItemCommand = class extends exports.Command {
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
var ConversationDeleteCommand = class extends exports.Command {
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
var ConversationGetCommand = class extends exports.Command {
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
      throw new exports.NotFoundException(
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
var ConversationListCommand = class extends exports.Command {
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
var responseSchema = typebox.Type.Object({
  sensitiveDataEnabled: typebox.Type.Boolean()
});
var TenantDisableSensitiveDataCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Tenant", {
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
var responseSchema2 = typebox.Type.Object({
  sensitiveDataEnabled: typebox.Type.Boolean()
});
var TenantEnableSensitiveDataCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema2, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Tenant", {
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
var responseSchema3 = typebox.Type.Object({
  ...TenantSchema.properties,
  dedicated: typebox.Type.Union([
    typebox.Type.Null(),
    typebox.Type.Object({
      // parse as string to avoid SDK failures if new statuses are added
      status: typebox.Type.String(),
      configuration: typebox.Type.Object({
        domain: typebox.Type.String(),
        configurationRepoUrl: typebox.Type.String(),
        configurationRepoCredentials: typebox.Type.String()
      })
    })
  ]),
  configured: typebox.Type.Boolean(),
  sensitiveDataEnabled: typebox.Type.Boolean()
});
var TenantCreateCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema3, rawResponse);
    return response;
  }
};

// src/commands/tenant/tenant.fetch.ts
init_command();
init_tenant();
init_not_found();
init_parse_response_helper();
var responseSchema4 = typebox.Type.Object({
  ...TenantSchema.properties,
  dedicated: typebox.Type.Union([
    typebox.Type.Null(),
    typebox.Type.Object({
      // parse as string to prevent sdk to fail when new status are added
      status: typebox.Type.String(),
      configuration: typebox.Type.Object({
        domain: typebox.Type.String(),
        configurationRepoUrl: typebox.Type.String(),
        configurationRepoCredentials: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])
      })
    })
  ])
});
var TenantFetchCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema4, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Tenant", {
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
var TenantListCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Array(TenantListItemSchema), rawResponse);
    return response;
  }
};

// src/commands/tenant/tenant.update.ts
init_command();
init_tenant();
init_command_error();
init_not_found();
init_parse_response_helper();
var responseSchema5 = typebox.Type.Object({
  ...TenantSchema.properties,
  dedicated: typebox.Type.Union([
    typebox.Type.Null(),
    typebox.Type.Object({
      // parse as string to prevent sdk to fail when new status are added
      status: typebox.Type.String(),
      configuration: typebox.Type.Object({
        domain: typebox.Type.String(),
        configurationRepoUrl: typebox.Type.String(),
        configurationRepoCredentials: typebox.Type.String()
      })
    })
  ]),
  configured: typebox.Type.Boolean(),
  sensitiveDataEnabled: typebox.Type.Boolean()
});
var TenantUpdateCommand = class extends exports.Command {
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
      throw new exports.CommandError(this.constructor.name, "No fields to update");
    }
    return updateFields;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    const response = exports.parseResponseHelper(responseSchema5, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Tenant", { id: this.input.tenantId });
    }
    throw error;
  }
};

// src/commands/tenant/tenant.user-add.ts
init_command();
init_parse_response_helper();
var TenantUserAddCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(
      typebox.Type.Object({
        success: typebox.Type.Boolean()
      }),
      rawResponse
    );
    return response.success;
  }
};

// src/commands/tenant/tenant.user-remove.ts
init_command();
init_parse_response_helper();
var TenantUserRemoveCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(
      typebox.Type.Object({
        success: typebox.Type.Boolean()
      }),
      rawResponse
    );
    return response.success;
  }
};

// src/common/command-custom.ts
init_command();
var CustomCommand = class extends exports.Command {
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
var TenantUserManagedRolesSchema = typebox.Type.Record(
  typebox.Type.String(),
  typebox.Type.Array(typebox.Type.String())
);
var TenantUserManagedRolesCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(TenantUserManagedRolesSchema, rawResponse);
    return response;
  }
};

// src/commands/tenant/tenant.user-list-inner.ts
init_command();
init_tenant();
init_parse_response_helper();
var TenantUserListInnerCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Array(TenantUserSchema), rawResponse);
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
var TenantTranslateNameToIdSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  name: typebox.Type.String()
});
var TenantTranslateNameToIdCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(TenantTranslateNameToIdSchema, rawResponse);
    return response;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Tenant", {
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
var TenantPreviewCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(TenantPreviewSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Tenant", { name: this.input.name });
    }
    throw error;
  }
};

// src/commands/api-key/api-key.create.ts
init_command();
init_parse_response_helper();
var ApiKeySchema = typebox.Type.Object({
  id: typebox.Type.String(),
  tenantId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.String(),
  maskedApiKey: typebox.Type.String(),
  createdAt: typebox.Type.String(),
  lastUsedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])
});
var ApiKeyWithValueSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  tenantId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.String(),
  maskedApiKey: typebox.Type.String(),
  createdAt: typebox.Type.String(),
  lastUsedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  apiKey: typebox.Type.String()
});
var ApiKeyValidationSchema = typebox.Type.Object({
  valid: typebox.Type.Boolean(),
  apiKeyId: typebox.Type.Optional(typebox.Type.String()),
  tenantId: typebox.Type.Optional(typebox.Type.String())
});

// src/commands/api-key/api-key.create.ts
var ApiKeyCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ApiKeyWithValueSchema, rawResponse);
  }
};

// src/commands/api-key/api-key.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ApiKeyFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ApiKeySchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("ApiKey", { id: this.input.apiKeyId });
    }
    throw error;
  }
};

// src/commands/api-key/api-key.edit.ts
init_command();
init_parse_response_helper();
var ApiKeyEditCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ApiKeySchema, rawResponse);
  }
};

// src/commands/api-key/api-key.delete.ts
init_command();
var ApiKeyDeleteCommand = class extends exports.Command {
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
var ApiKeyListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(ApiKeySchema), rawResponse);
  }
};

// src/commands/api-key/api-key.validate.ts
init_command();
init_parse_response_helper();
var ApiKeyValidateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ApiKeyValidationSchema, rawResponse);
  }
};

// src/commands/api-key/api-key.validate-with-tenant-id.ts
init_command();
init_parse_response_helper();
var ApiKeyValidateWithTenantIdCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ApiKeyValidationSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-customer.resolve.ts
init_command();
typebox.Type.Union([
  typebox.Type.Literal("managed"),
  typebox.Type.Literal("self-hosted")
]);
typebox.Type.Record(
  typebox.Type.String(),
  typebox.Type.Optional(typebox.Type.String())
);
var AwsMarketplaceProductModeSchema = typebox.Type.Union([
  typebox.Type.Literal("basic"),
  typebox.Type.Literal("dedicated")
]);
var AwsMarketplaceCustomerSchema = typebox.Type.Object({
  customerId: typebox.Type.String(),
  productCode: typebox.Type.String(),
  accountId: typebox.Type.String(),
  metadata: typebox.Type.String(),
  productMode: AwsMarketplaceProductModeSchema
});
var AwsMarketplaceLinkSchema = typebox.Type.Object({
  linkingId: typebox.Type.String(),
  awsCustomerId: typebox.Type.String(),
  awsProductCode: typebox.Type.String(),
  awsAccountId: typebox.Type.String(),
  tenant: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  tenantId: typebox.Type.String(),
  contactInfo: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  productProperties: typebox.Type.Union([typebox.Type.Record(typebox.Type.String(), typebox.Type.String()), typebox.Type.Null()]),
  linkedAt: typebox.Type.String()
});
var AwsMarketplaceCustomerResolveSchema = typebox.Type.Object({
  success: typebox.Type.Boolean(),
  customer: AwsMarketplaceCustomerSchema
});
var AwsMarketplaceLinkCreateSchema = typebox.Type.Object({
  success: typebox.Type.Boolean(),
  linkingId: typebox.Type.String(),
  status: typebox.Type.Literal("linked")
});
var AwsMarketplaceLinkListSchema = typebox.Type.Object({
  success: typebox.Type.Boolean(),
  links: typebox.Type.Array(AwsMarketplaceLinkSchema)
});
var AwsMarketplaceLinkFetchSchema = typebox.Type.Object({
  success: typebox.Type.Boolean(),
  link: AwsMarketplaceLinkSchema
});
var AwsMarketplaceLinkDeleteSchema = typebox.Type.Object({
  success: typebox.Type.Boolean(),
  linkingId: typebox.Type.String(),
  status: typebox.Type.Literal("unlinked")
});

// src/commands/aws-marketplace/aws-marketplace-customer.resolve.ts
init_parse_response_helper();
var AwsMarketplaceCustomerResolveCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(AwsMarketplaceCustomerResolveSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.create.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(AwsMarketplaceLinkCreateSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.delete.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkDeleteCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(AwsMarketplaceLinkDeleteSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.fetch.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(AwsMarketplaceLinkFetchSchema, rawResponse);
  }
};

// src/commands/aws-marketplace/aws-marketplace-link.list.ts
init_command();
init_parse_response_helper();
var AwsMarketplaceLinkListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(AwsMarketplaceLinkListSchema, rawResponse);
  }
};

// src/commands/secret/secret.create.ts
init_command();
init_parse_response_helper();
var SecretSchema = typebox.Type.Object({
  tenantId: typebox.Type.String(),
  key: typebox.Type.String(),
  description: typebox.Type.String(),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])
});

// src/commands/secret/secret.create.ts
var SecretCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(SecretSchema, rawResponse);
  }
};

// src/commands/secret/secret.delete.ts
init_command();
var SecretDeleteCommand = class extends exports.Command {
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
var SecretEditCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(SecretSchema, rawResponse);
  }
};

// src/commands/secret/secret.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var SecretFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(SecretSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Secret", { tenantId: this.input.tenantId, key: this.input.key });
    }
    throw error;
  }
};

// src/commands/secret/secret.list.ts
init_command();
init_parse_response_helper();
var SecretListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(SecretSchema), rawResponse);
  }
};

// src/commands/service-account/service-account.create.ts
init_command();
var ServiceAccountSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  tenantId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.String(),
  linkedUserId: typebox.Type.String(),
  clientId: typebox.Type.String(),
  isAdmin: typebox.Type.Boolean(),
  enabled: typebox.Type.Boolean(),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  lastRotatedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])
});
var ServiceAccountWithSecretSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  tenantId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.String(),
  linkedUserId: typebox.Type.String(),
  clientId: typebox.Type.String(),
  isAdmin: typebox.Type.Boolean(),
  enabled: typebox.Type.Boolean(),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  lastRotatedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  clientSecret: typebox.Type.String()
});
var ServiceAccountSecretRotationSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  clientId: typebox.Type.String(),
  clientSecret: typebox.Type.String()
});

// src/commands/service-account/service-account.create.ts
init_parse_response_helper();
var ServiceAccountCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ServiceAccountWithSecretSchema, rawResponse);
  }
};

// src/commands/service-account/service-account.delete.ts
init_command();
var ServiceAccountDeleteCommand = class extends exports.Command {
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
var ServiceAccountEditCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ServiceAccountSchema, rawResponse);
  }
};

// src/commands/service-account/service-account.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var ServiceAccountFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ServiceAccountSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("ServiceAccount", { id: this.input.serviceAccountId });
    }
    throw error;
  }
};

// src/commands/service-account/service-account.list.ts
init_command();
init_parse_response_helper();
var ServiceAccountListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(ServiceAccountSchema), rawResponse);
  }
};

// src/commands/service-account/service-account.rotate-secret.ts
init_command();
init_parse_response_helper();
var ServiceAccountRotateSecretCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ServiceAccountSecretRotationSchema, rawResponse);
  }
};

// src/commands/variable/variable.create.ts
init_command();
init_parse_response_helper();
var VariableSchema = typebox.Type.Object({
  tenantId: typebox.Type.String(),
  key: typebox.Type.String(),
  description: typebox.Type.String(),
  value: typebox.Type.String(),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])
});

// src/commands/variable/variable.create.ts
var VariableCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(VariableSchema, rawResponse);
  }
};

// src/commands/variable/variable.delete.ts
init_command();
var VariableDeleteCommand = class extends exports.Command {
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
var VariableEditCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(VariableSchema, rawResponse);
  }
};

// src/commands/variable/variable.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var VariableFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(VariableSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Variable", { tenantId: this.input.tenantId, key: this.input.key });
    }
    throw error;
  }
};

// src/commands/variable/variable.list.ts
init_command();
init_parse_response_helper();
var VariableListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(VariableSchema), rawResponse);
  }
};

// src/commands/data-core/data-core.create.ts
init_command();
var DataCoreSchema = typebox.Type.Object({
  /** Unique identifier for the data core */
  id: typebox.Type.String(),
  /** ID of the tenant that owns this data core */
  tenantId: typebox.Type.String(),
  /** Name of the tenant that owns this data core */
  tenant: typebox.Type.String(),
  /** Name of the data core */
  name: typebox.Type.String(),
  /** Description of the data core's purpose and contents */
  description: typebox.Type.String(),
  /** Access control setting - determines if the data core is public or private */
  accessControl: typebox.Type.Union([typebox.Type.Literal("public"), typebox.Type.Literal("private")]),
  /** Protection against accidental deletion */
  deleteProtection: typebox.Type.Boolean(),
  /** Indicates if the data core is currently being deleted */
  isDeleting: typebox.Type.Boolean(),
  /** Indicates if the data core is managed by Flowcore platform */
  isFlowcoreManaged: typebox.Type.Boolean()
});
var DataCoreWithAccessSchema = typebox.Type.Object({
  ...DataCoreSchema.properties,
  access: typebox.Type.Array(
    typebox.Type.Union([typebox.Type.Literal("read"), typebox.Type.Literal("write"), typebox.Type.Literal("fetch"), typebox.Type.Literal("ingest")])
  )
});

// src/commands/data-core/data-core.create.ts
init_parse_response_helper();
var DataCoreCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataCoreSchema, rawResponse);
  }
};

// src/commands/data-core/data-core.exists.ts
init_command();
init_parse_response_helper();
var DataCoreExistsCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Object({ exists: typebox.Type.Boolean() }), rawResponse);
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
var DataCoreFetchCommand = class extends exports.Command {
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
      const response2 = exports.parseResponseHelper(DataCoreSchema, rawResponse);
      return response2;
    }
    const response = exports.parseResponseHelper(typebox.Type.Array(DataCoreSchema), rawResponse);
    if (response.length === 0) {
      if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
        throw new exports.NotFoundException("DataCore", { name: this.input.dataCore, tenantId: this.input.tenantId });
      } else {
        throw new exports.NotFoundException("DataCore", { name: this.input.dataCore, tenant: this.input.tenant });
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
        throw new exports.NotFoundException("DataCore", { id: this.input.dataCoreId });
      } else if (isDataCoreFetchByNameAndTenantIdInput(this.input)) {
        throw new exports.NotFoundException("DataCore", { name: this.input.dataCore, tenantId: this.input.tenantId });
      } else {
        throw new exports.NotFoundException("DataCore", { name: this.input.dataCore, tenant: this.input.tenant });
      }
    }
    throw error;
  }
};

// src/commands/data-core/data-core.list.ts
init_command();
init_parse_response_helper();
var responseSchema6 = typebox.Type.Object({
  ...DataCoreWithAccessSchema.properties,
  access: typebox.Type.Array(typebox.Type.String())
});
var DataCoreListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(responseSchema6), rawResponse);
  }
};

// src/commands/data-core/data-core.request-delete.ts
init_command();
init_parse_response_helper();
init_not_found();
var DataCoreRequestDeleteCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(
      typebox.Type.Object({
        success: typebox.Type.Boolean()
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
      throw new exports.NotFoundException("DataCore", {
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
var DataCoreUpdateCommand = class extends exports.Command {
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
      throw new exports.CommandError(this.constructor.name, "No fields to update");
    }
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return exports.parseResponseHelper(DataCoreSchema, rawResponse);
  }
};

// src/commands/flow-type/flow-type.create.ts
init_command();
var FlowTypeSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  tenantId: typebox.Type.String(),
  dataCoreId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.String(),
  isDeleting: typebox.Type.Boolean()
});

// src/commands/flow-type/flow-type.create.ts
init_parse_response_helper();
var FlowTypeCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(FlowTypeSchema, rawResponse);
  }
};

// src/commands/flow-type/flow-type.exists.ts
init_command();
init_parse_response_helper();
var FlowTypeExistsCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Object({ exists: typebox.Type.Boolean() }), rawResponse);
    return response;
  }
};

// src/commands/flow-type/flow-type.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var FlowTypeFetchCommand = class extends exports.Command {
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
      const response2 = exports.parseResponseHelper(FlowTypeSchema, rawResponse);
      return response2;
    }
    const response = exports.parseResponseHelper(typebox.Type.Array(FlowTypeSchema), rawResponse);
    if (response.length === 0) {
      throw new exports.NotFoundException("FlowType", { name: this.input.flowType });
    }
    return response[0];
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("FlowType", {
        [this.input.flowTypeId ? "id" : "name"]: this.input.flowTypeId ?? this.input.flowType
      });
    }
    throw error;
  }
};

// src/commands/flow-type/flow-type.list.ts
init_command();
init_parse_response_helper();
var FlowTypeListCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Array(FlowTypeSchema), rawResponse);
    return response;
  }
};

// src/commands/flow-type/flow-type.request-delete.ts
init_command();
init_not_found();
init_parse_response_helper();
var FlowTypeRequestDeleteCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(
      typebox.Type.Object({
        success: typebox.Type.Boolean()
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
      throw new exports.NotFoundException("FlowType", {
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
var FlowTypeUpdateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(FlowTypeSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.create.ts
init_command();
var DetailedSensitiveDataFieldSchema = typebox.Type.Object({
  type: typebox.Type.Union([
    typebox.Type.Literal("string"),
    typebox.Type.Literal("number"),
    typebox.Type.Literal("boolean"),
    typebox.Type.Literal("object"),
    typebox.Type.Literal("array")
  ]),
  faker: typebox.Type.Optional(typebox.Type.String()),
  args: typebox.Type.Optional(typebox.Type.Array(typebox.Type.Unknown())),
  length: typebox.Type.Optional(typebox.Type.Number()),
  pattern: typebox.Type.Optional(typebox.Type.String()),
  redact: typebox.Type.Optional(
    typebox.Type.Object({
      char: typebox.Type.String({ minLength: 1, maxLength: 1 }),
      length: typebox.Type.Number({ minimum: 1 })
    })
  ),
  min: typebox.Type.Optional(typebox.Type.Number()),
  max: typebox.Type.Optional(typebox.Type.Number()),
  precision: typebox.Type.Optional(typebox.Type.Number()),
  count: typebox.Type.Optional(typebox.Type.Number()),
  items: typebox.Type.Optional(typebox.Type.Unknown()),
  properties: typebox.Type.Optional(
    typebox.Type.Record(
      typebox.Type.String(),
      typebox.Type.Unknown()
    )
  )
});
var SensitiveDataDefinitionSchema = typebox.Type.Union([
  typebox.Type.Literal(true),
  typebox.Type.Union([typebox.Type.Literal("string"), typebox.Type.Literal("number"), typebox.Type.Literal("boolean")]),
  DetailedSensitiveDataFieldSchema,
  typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown())
]);
var EventTypeSensitiveDataMaskSchema = typebox.Type.Object({
  key: typebox.Type.String(),
  schema: typebox.Type.Record(typebox.Type.String(), SensitiveDataDefinitionSchema)
});
typebox.Type.Array(
  typebox.Type.Object({
    path: typebox.Type.String(),
    definition: typebox.Type.Object({
      type: typebox.Type.Union([
        typebox.Type.Literal("string"),
        typebox.Type.Literal("number"),
        typebox.Type.Literal("boolean"),
        typebox.Type.Literal("object"),
        typebox.Type.Literal("array")
      ]),
      faker: typebox.Type.Optional(typebox.Type.String()),
      args: typebox.Type.Array(typebox.Type.Unknown()),
      length: typebox.Type.Optional(typebox.Type.Number()),
      pattern: typebox.Type.Optional(typebox.Type.String()),
      min: typebox.Type.Optional(typebox.Type.Number()),
      max: typebox.Type.Optional(typebox.Type.Number()),
      precision: typebox.Type.Optional(typebox.Type.Number()),
      count: typebox.Type.Optional(typebox.Type.Number()),
      items: typebox.Type.Optional(typebox.Type.Unknown()),
      properties: typebox.Type.Optional(typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown())),
      redact: typebox.Type.Optional(
        typebox.Type.Object({
          char: typebox.Type.String(),
          length: typebox.Type.Number()
        })
      )
    })
  })
);
var EventTypeSchema = typebox.Type.Object({
  /** Unique identifier for the event type */
  id: typebox.Type.String(),
  /** ID of the tenant that owns this event type */
  tenantId: typebox.Type.String(),
  /** ID of the data core this event type belongs to */
  dataCoreId: typebox.Type.String(),
  /** ID of the flow type this event type belongs to */
  flowTypeId: typebox.Type.String(),
  /** Name of the event type */
  name: typebox.Type.String(),
  /** Description of the event type */
  description: typebox.Type.String(),
  /** Indicates if the event type is currently being truncated */
  isTruncating: typebox.Type.Boolean(),
  /** Indicates if the event type is currently being deleted */
  isDeleting: typebox.Type.Boolean(),
  /** Creation timestamp */
  createdAt: typebox.Type.String(),
  /** Last update timestamp */
  updatedAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  /** SensitiveData mask configuration */
  sensitiveDataMask: typebox.Type.Optional(typebox.Type.Union([EventTypeSensitiveDataMaskSchema, typebox.Type.Null()])),
  /** Indicates if SensitiveData handling is enabled */
  sensitiveDataEnabled: typebox.Type.Optional(typebox.Type.Boolean())
});
typebox.Type.Object({
  id: typebox.Type.String(),
  tenantId: typebox.Type.String(),
  dataCoreId: typebox.Type.String(),
  flowTypeId: typebox.Type.String(),
  eventTypeId: typebox.Type.String(),
  parentKey: typebox.Type.String(),
  key: typebox.Type.String(),
  type: typebox.Type.String(),
  application: typebox.Type.String(),
  createdAt: typebox.Type.String()
});
var EventTypeRemoveSensitiveDataSchema = typebox.Type.Object({
  success: typebox.Type.Boolean(),
  id: typebox.Type.String()
});
var EventTypeListRemovedSensitiveDataItemSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  tenantId: typebox.Type.String(),
  dataCoreId: typebox.Type.String(),
  flowTypeId: typebox.Type.String(),
  eventTypeId: typebox.Type.String(),
  application: typebox.Type.String(),
  parentKey: typebox.Type.String(),
  key: typebox.Type.String(),
  type: typebox.Type.String(),
  createdAt: typebox.Type.String()
});
var EventTypeListRemovedSensitiveDataResponseSchema = typebox.Type.Object({
  data: typebox.Type.Array(EventTypeListRemovedSensitiveDataItemSchema),
  pagination: typebox.Type.Object({
    page: typebox.Type.Number(),
    pageSize: typebox.Type.Number(),
    hasNextPage: typebox.Type.Boolean(),
    hasPreviousPage: typebox.Type.Boolean()
  })
});

// src/commands/event-type/event-type.create.ts
init_parse_response_helper();
var EventTypeCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(EventTypeSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.exists.ts
init_command();
init_parse_response_helper();
var EventTypeExistsCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Object({ exists: typebox.Type.Boolean() }), rawResponse);
    return response;
  }
};

// src/commands/event-type/event-type.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var EventTypeFetchCommand = class extends exports.Command {
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
      const response2 = exports.parseResponseHelper(EventTypeSchema, rawResponse);
      return response2;
    }
    const response = exports.parseResponseHelper(typebox.Type.Array(EventTypeSchema), rawResponse);
    if (response.length === 0) {
      throw new exports.NotFoundException("EventType", { name: this.input.eventType });
    }
    return response[0];
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("EventType", {
        [this.input.eventTypeId ? "id" : "name"]: this.input.eventTypeId ?? this.input.eventType
      });
    }
    throw error;
  }
};

// src/commands/events/event.list.ts
init_command();
init_parse_response_helper();
var FlowcoreEventSchema = typebox.Type.Object({
  eventId: typebox.Type.String(),
  timeBucket: typebox.Type.String(),
  tenant: typebox.Type.String(),
  dataCoreId: typebox.Type.String(),
  flowType: typebox.Type.String(),
  eventType: typebox.Type.String(),
  metadata: typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown()),
  payload: typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown()),
  validTime: typebox.Type.String()
});

// src/commands/events/event.list.ts
var responseSchema7 = typebox.Type.Object({
  events: typebox.Type.Array(FlowcoreEventSchema),
  nextCursor: typebox.Type.Optional(typebox.Type.String())
});
var EventListCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema7, rawResponse);
    return response;
  }
};

// src/commands/events/time-bucket.list.ts
init_command();
init_parse_response_helper();
var responseSchema8 = typebox.Type.Object({
  timeBuckets: typebox.Type.Array(typebox.Type.String()),
  nextCursor: typebox.Type.Optional(typebox.Type.Number())
});
var TimeBucketListCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema8, rawResponse);
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
var EventTypeListRemovedSensitiveDataCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(EventTypeListRemovedSensitiveDataResponseSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.list.ts
init_command();
init_parse_response_helper();
var EventTypeListCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Array(EventTypeSchema), rawResponse);
    return response;
  }
};

// src/commands/event-type/event-type.remove-sensitive-data.ts
init_command();
init_parse_response_helper();
var EventTypeRemoveSensitiveDataCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(EventTypeRemoveSensitiveDataSchema, rawResponse);
  }
};

// src/commands/event-type/event-type.request-delete.ts
init_command();
init_not_found();
init_parse_response_helper();
var EventTypeRequestDeleteCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(
      typebox.Type.Object({
        success: typebox.Type.Boolean()
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
      throw new exports.NotFoundException("EventType", {
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
var EventTypeRequestTruncateCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(
      typebox.Type.Object({
        success: typebox.Type.Boolean()
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
      throw new exports.NotFoundException("EventType", {
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
var EventTypeUpdateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(EventTypeSchema, rawResponse);
  }
};

// src/commands/ingestion/ingest.batch.ts
init_command();
init_parse_response_helper();
var responseSchema9 = typebox.Type.Object({
  eventIds: typebox.Type.Array(typebox.Type.String()),
  success: typebox.Type.Boolean()
});
var IngestBatchCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema9, rawResponse);
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
var responseSchema10 = typebox.Type.Object({
  eventId: typebox.Type.String(),
  success: typebox.Type.Boolean()
});
var IngestEventCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema10, rawResponse);
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
var responseSchema11 = typebox.Type.Object({
  timeBuckets: typebox.Type.Array(typebox.Type.String()),
  nextCursor: typebox.Type.Optional(typebox.Type.Number())
});
var EventsFetchTimeBucketsByNamesCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema11, rawResponse);
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
var responseSchema12 = typebox.Type.Object({
  events: typebox.Type.Array(FlowcoreEventSchema),
  nextCursor: typebox.Type.Optional(typebox.Type.String())
});
var EventsFetchCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema12, rawResponse);
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
var ContainerRegistrySchema = typebox.Type.Object({
  tenantId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.Optional(typebox.Type.String()),
  username: typebox.Type.Optional(typebox.Type.String()),
  id: typebox.Type.String()
});
var ContainerRegistryCreateSchema = typebox.Type.Object({
  id: typebox.Type.String()
});
var ContainerRegistryDeleteSchema = typebox.Type.Object({
  status: typebox.Type.Number()
});
var ContainerRegistryListSchema = typebox.Type.Array(ContainerRegistrySchema);

// src/commands/container-registry/container-registry.create.ts
init_parse_response_helper();
var ContainerRegistryCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ContainerRegistryCreateSchema, response);
  }
};

// src/commands/container-registry/container-registry.delete.ts
init_command();
init_parse_response_helper();
var ContainerRegistryDeleteCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ContainerRegistryDeleteSchema, response);
  }
};

// src/commands/container-registry/container-registry.fetch.ts
init_command();
init_parse_response_helper();
var ContainerRegistryFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ContainerRegistrySchema, response);
  }
};

// src/commands/container-registry/container-registry.list.ts
init_command();
init_parse_response_helper();
var ContainerRegistListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ContainerRegistryListSchema, response);
  }
};

// src/commands/container-registry/container-registry.update.ts
init_command();
init_parse_response_helper();
var ContainerRegistryUpdateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ContainerRegistrySchema, response);
  }
};

// src/commands/security/pat.create.ts
init_command();
var PATSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.Optional(typebox.Type.String()),
  token: typebox.Type.Optional(typebox.Type.String()),
  createdAt: typebox.Type.String()
});

// src/commands/security/pat.create.ts
init_parse_response_helper();
var SecurityCreatePATCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(PATSchema, rawResponse);
  }
};

// src/commands/security/pat.delete.ts
init_command();
init_parse_response_helper();
var SecurityDeletePATCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(
      typebox.Type.Object({
        success: typebox.Type.Boolean()
      }),
      rawResponse
    );
  }
};

// src/commands/security/pat.exchange.ts
init_command();
init_parse_response_helper();
var SecurityExchangePATCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(
      typebox.Type.Object({
        accessToken: typebox.Type.String()
      }),
      rawResponse
    );
  }
};

// src/commands/security/pat.get.ts
init_command();
init_parse_response_helper();
var SecurityGetPATCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(PATSchema, rawResponse);
  }
};

// src/commands/security/pat.list.ts
init_command();
init_parse_response_helper();
var SecurityListPATCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(PATSchema), rawResponse);
  }
};

// src/commands/security/permissions.list.ts
init_command();
init_parse_response_helper();
var PermissionSchema = typebox.Type.Object({
  tenant: typebox.Type.String(),
  type: typebox.Type.String(),
  id: typebox.Type.String(),
  action: typebox.Type.Array(
    typebox.Type.Union([
      typebox.Type.Literal("read"),
      typebox.Type.Literal("write"),
      typebox.Type.Literal("ingest"),
      typebox.Type.Literal("fetch"),
      typebox.Type.Literal("sensitive-data-fetch"),
      typebox.Type.String()
    ])
  )
});

// src/commands/security/permissions.list.ts
var responseSchema13 = typebox.Type.Object({
  ...PermissionSchema.properties,
  // parse as string to prevent sdk to fail when new actions are added
  action: typebox.Type.Array(typebox.Type.String())
});
var PermissionsListCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(typebox.Type.Array(responseSchema13), rawResponse);
    return response;
  }
};

// src/commands/user/user.initialize-in-keycloak.ts
init_command();
init_parse_response_helper();
var responseSchema14 = typebox.Type.Object({
  id: typebox.Type.String(),
  username: typebox.Type.String(),
  email: typebox.Type.String(),
  firstName: typebox.Type.String(),
  lastName: typebox.Type.String()
});
var UserInitializeInKeycloakCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema14, rawResponse);
    return response;
  }
};

// src/commands/user/user.delete.ts
init_command();
init_parse_response_helper();
var responseSchema15 = typebox.Type.Object({
  id: typebox.Type.String()
});
var UserDeleteCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema15, rawResponse);
    return response;
  }
};

// src/commands/user/user.invite-to-tenant.ts
init_command();
init_parse_response_helper();
var responseSchema16 = typebox.Type.Object({
  success: typebox.Type.Boolean(),
  tenantName: typebox.Type.String(),
  invitedEmail: typebox.Type.String()
});
var UserInviteToTenantCommand = class extends exports.Command {
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
    const response = exports.parseResponseHelper(responseSchema16, rawResponse);
    return response;
  }
};

// src/commands/data-pathways/assignment.complete.ts
init_command();
var DataPathwayAssignmentCompleteCommand = class extends exports.Command {
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
var SizeClassEnum = typebox.Type.Union([typebox.Type.Literal("small"), typebox.Type.Literal("medium"), typebox.Type.Literal("high")]);
var EndpointConfigSchema = typebox.Type.Object({
  url: typebox.Type.String(),
  authHeaders: typebox.Type.Optional(typebox.Type.Record(typebox.Type.String(), typebox.Type.String()))
});
var BackoffConfigSchema = typebox.Type.Optional(
  typebox.Type.Object({
    initialMs: typebox.Type.Optional(typebox.Type.Integer()),
    maxMs: typebox.Type.Optional(typebox.Type.Integer()),
    multiplier: typebox.Type.Optional(typebox.Type.Number())
  })
);
var TimeoutConfigSchema = typebox.Type.Optional(
  typebox.Type.Object({
    deliveryMs: typebox.Type.Optional(typebox.Type.Integer()),
    fetchMs: typebox.Type.Optional(typebox.Type.Integer())
  })
);
var SourceConfigSchema = typebox.Type.Object({
  id: typebox.Type.Optional(typebox.Type.String()),
  name: typebox.Type.Optional(typebox.Type.String()),
  flowType: typebox.Type.String(),
  eventTypes: typebox.Type.Array(typebox.Type.String()),
  endpoints: typebox.Type.Array(EndpointConfigSchema),
  batchSize: typebox.Type.Optional(typebox.Type.Integer()),
  maxInFlight: typebox.Type.Optional(typebox.Type.Integer()),
  backoff: BackoffConfigSchema,
  timeouts: TimeoutConfigSchema
});
var DataSourceConfigSchema = typebox.Type.Object({
  tenant: typebox.Type.String(),
  dataCore: typebox.Type.String()
});
var AuthConfigSchema = typebox.Type.Object({
  apiKey: typebox.Type.String()
});
var PathwayConfigSchema = typebox.Type.Object({
  sources: typebox.Type.Array(SourceConfigSchema)
});
var PumpConfigSchema = typebox.Type.Object({
  sources: typebox.Type.Array(SourceConfigSchema),
  dataSource: DataSourceConfigSchema,
  auth: typebox.Type.Optional(AuthConfigSchema)
});
var PathwayTypeSchema = typebox.Type.Optional(typebox.Type.Union([typebox.Type.Literal("managed"), typebox.Type.Literal("virtual")]));
var VirtualConfigSchema = typebox.Type.Object({
  flowTypes: typebox.Type.Optional(typebox.Type.Array(typebox.Type.String()))
});
var DeliveryStateSchema = typebox.Type.Union([typebox.Type.Literal("active"), typebox.Type.Literal("paused")]);
var DataPathwaySchema = typebox.Type.Object({
  id: typebox.Type.String(),
  tenant: typebox.Type.String(),
  name: typebox.Type.Optional(typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()])),
  dataCore: typebox.Type.String(),
  sizeClass: SizeClassEnum,
  type: PathwayTypeSchema,
  enabled: typebox.Type.Boolean(),
  priority: typebox.Type.Integer(),
  version: typebox.Type.Integer(),
  labels: typebox.Type.Record(typebox.Type.String(), typebox.Type.String()),
  config: typebox.Type.Optional(PathwayConfigSchema),
  virtualConfig: typebox.Type.Optional(VirtualConfigSchema),
  deliveryState: typebox.Type.Optional(DeliveryStateSchema),
  deliveryPauseTargets: typebox.Type.Optional(typebox.Type.Union([typebox.Type.Array(typebox.Type.String()), typebox.Type.Null()])),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.String()
});
var DataPathwayListSchema = typebox.Type.Object({
  pathways: typebox.Type.Array(DataPathwaySchema),
  total: typebox.Type.Integer()
});
var DataPathwayMutationResponseSchema = typebox.Type.Object({
  pathwayId: typebox.Type.String(),
  status: typebox.Type.String(),
  apiKey: typebox.Type.Optional(typebox.Type.String())
});
var DataPathwaySlotSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  podUnitId: typebox.Type.String(),
  class: SizeClassEnum,
  labels: typebox.Type.Record(typebox.Type.String(), typebox.Type.String()),
  lastSeen: typebox.Type.String(),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.String()
});
var DataPathwaySlotListSchema = typebox.Type.Object({
  slots: typebox.Type.Array(DataPathwaySlotSchema),
  total: typebox.Type.Integer()
});
var DataPathwaySlotMutationResponseSchema = typebox.Type.Object({
  slotId: typebox.Type.String(),
  status: typebox.Type.String()
});
var DataPathwayAssignmentSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  pathwayId: typebox.Type.String(),
  slotId: typebox.Type.String(),
  generation: typebox.Type.Integer(),
  leaseTTL: typebox.Type.String(),
  status: typebox.Type.String(),
  config: PumpConfigSchema,
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.String()
});
var AssignmentNextInnerSchema = typebox.Type.Object({
  assignmentId: typebox.Type.String(),
  pathwayId: typebox.Type.String(),
  slotId: typebox.Type.String(),
  generation: typebox.Type.Integer(),
  config: PumpConfigSchema,
  leaseTTL: typebox.Type.String(),
  status: typebox.Type.String()
});
var DataPathwayAssignmentNextSchema = typebox.Type.Object({
  assignment: typebox.Type.Union([AssignmentNextInnerSchema, typebox.Type.Null()])
});
var DataPathwayAssignmentListSchema = typebox.Type.Object({
  assignments: typebox.Type.Array(DataPathwayAssignmentSchema),
  total: typebox.Type.Integer()
});
var DataPathwayExpireLeasesResponseSchema = typebox.Type.Object({
  expired: typebox.Type.Integer()
});
var DataPathwayCommandSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  restartRequestId: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  assignmentId: typebox.Type.String(),
  type: typebox.Type.String(),
  generation: typebox.Type.Integer(),
  position: typebox.Type.Union([typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown()), typebox.Type.Null()]),
  stopAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  timeoutMs: typebox.Type.Union([typebox.Type.Integer(), typebox.Type.Null()]),
  phase: typebox.Type.String(),
  reason: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  createdAt: typebox.Type.String()
});
var DataPathwayCommandListSchema = typebox.Type.Object({
  commands: typebox.Type.Array(DataPathwayCommandSchema)
});
var DataPathwayCommandResponseSchema = typebox.Type.Object({
  commandId: typebox.Type.String(),
  phase: typebox.Type.String()
});
var DataPathwayCommandDetailSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  restartRequestId: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  assignmentId: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  pathwayId: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  type: typebox.Type.String(),
  generation: typebox.Type.Union([typebox.Type.Integer(), typebox.Type.Null()]),
  position: typebox.Type.Union([typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown()), typebox.Type.Null()]),
  stopAt: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  timeoutMs: typebox.Type.Union([typebox.Type.Integer(), typebox.Type.Null()]),
  phase: typebox.Type.String(),
  reason: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  details: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  config: typebox.Type.Union([typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown()), typebox.Type.Null()]),
  sourceFlowTypes: typebox.Type.Union([typebox.Type.Array(typebox.Type.String()), typebox.Type.Null()]),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.String()
});
var DataPathwayRestartRequestResponseSchema = typebox.Type.Object({
  restartRequestId: typebox.Type.String(),
  acceptedTargets: typebox.Type.Array(typebox.Type.String()),
  skippedTargets: typebox.Type.Array(typebox.Type.String())
});
var DataPathwayRestartRequestSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  targets: typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown()),
  mode: typebox.Type.String(),
  position: typebox.Type.Record(typebox.Type.String(), typebox.Type.Unknown()),
  status: typebox.Type.String(),
  requestedBy: typebox.Type.String(),
  reason: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.String()
});
var SlotCountSchema = typebox.Type.Object({
  free: typebox.Type.Integer(),
  used: typebox.Type.Integer()
});
var ThreeClassIntegersSchema = typebox.Type.Object({
  small: typebox.Type.Integer(),
  medium: typebox.Type.Integer(),
  high: typebox.Type.Integer()
});
var DataPathwayCapacitySchema = typebox.Type.Object({
  slots: typebox.Type.Object({
    small: SlotCountSchema,
    medium: SlotCountSchema,
    high: SlotCountSchema
  }),
  pendingAssignments: ThreeClassIntegersSchema
});
var DataPathwayQuotaSchema = typebox.Type.Object({
  tenant: typebox.Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  createdAt: typebox.Type.String(),
  updatedAt: typebox.Type.String()
});
var DataPathwayQuotaWithUsageSchema = typebox.Type.Object({
  tenant: typebox.Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  used: ThreeClassIntegersSchema
});
var DataPathwayQuotaListSchema = typebox.Type.Object({
  quotas: typebox.Type.Array(DataPathwayQuotaSchema),
  total: typebox.Type.Integer()
});
var DataPathwayQuotaSetResponseSchema = typebox.Type.Object({
  tenant: typebox.Type.String(),
  status: typebox.Type.String()
});
var PumpStateValueSchema = typebox.Type.Object({
  timeBucket: typebox.Type.String(),
  eventId: typebox.Type.Optional(typebox.Type.String())
});
var DataPathwayPumpStateSchema = typebox.Type.Object({
  pathwayId: typebox.Type.String(),
  flowType: typebox.Type.String(),
  state: typebox.Type.Union([PumpStateValueSchema, typebox.Type.Null()])
});
var DataPathwayPumpStateBySourceSchema = typebox.Type.Object({
  pathwayId: typebox.Type.String(),
  sourceId: typebox.Type.String(),
  flowType: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  state: typebox.Type.Union([PumpStateValueSchema, typebox.Type.Null()])
});
var DataPathwayPumpStateSaveResponseSchema = typebox.Type.Object({
  status: typebox.Type.String()
});
var DataPathwayDeliveryLogEntrySchema = typebox.Type.Object({
  id: typebox.Type.String(),
  pathwayId: typebox.Type.String(),
  assignmentId: typebox.Type.String(),
  endpointUrl: typebox.Type.String(),
  httpStatus: typebox.Type.Union([typebox.Type.Integer(), typebox.Type.Null()]),
  success: typebox.Type.Boolean(),
  batchSize: typebox.Type.Union([typebox.Type.Integer(), typebox.Type.Null()]),
  durationMs: typebox.Type.Union([typebox.Type.Integer(), typebox.Type.Null()]),
  errorMessage: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  responseBody: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  flowType: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  sourceId: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  eventType: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  createdAt: typebox.Type.String()
});
var DataPathwayDeliveryLogListSchema = typebox.Type.Object({
  entries: typebox.Type.Array(DataPathwayDeliveryLogEntrySchema),
  total: typebox.Type.Integer()
});
typebox.Type.Object({
  pathwayId: typebox.Type.String(),
  assignmentId: typebox.Type.String(),
  endpointUrl: typebox.Type.String(),
  flowType: typebox.Type.Optional(typebox.Type.String()),
  sourceId: typebox.Type.Optional(typebox.Type.String()),
  eventType: typebox.Type.Optional(typebox.Type.String()),
  httpStatus: typebox.Type.Optional(typebox.Type.Integer()),
  success: typebox.Type.Boolean(),
  batchSize: typebox.Type.Optional(typebox.Type.Integer()),
  durationMs: typebox.Type.Optional(typebox.Type.Integer()),
  errorMessage: typebox.Type.Optional(typebox.Type.String()),
  responseBody: typebox.Type.Optional(typebox.Type.String())
});
var DataPathwayDeliveryLogBatchResponseSchema = typebox.Type.Object({
  inserted: typebox.Type.Integer()
});
var ThroughputRecentResultSchema = typebox.Type.Object({
  status: typebox.Type.Number(),
  durationMs: typebox.Type.Number(),
  success: typebox.Type.Boolean(),
  ageMs: typebox.Type.Number()
});
var ThroughputSourceSchema = typebox.Type.Object({
  flowType: typebox.Type.String(),
  name: typebox.Type.Optional(typebox.Type.String()),
  eventsPerSecond: typebox.Type.Number(),
  successRate: typebox.Type.Number(),
  avgDurationMs: typebox.Type.Number(),
  totalDelivered: typebox.Type.Number(),
  totalFailed: typebox.Type.Number(),
  lastDeliveryAgeMs: typebox.Type.Union([typebox.Type.Number(), typebox.Type.Null()]),
  healthy: typebox.Type.Boolean(),
  recentResults: typebox.Type.Array(ThroughputRecentResultSchema)
});
var ThroughputEndpointSchema = typebox.Type.Object({
  eventsPerSecond: typebox.Type.Number(),
  successRate: typebox.Type.Number(),
  totalDelivered: typebox.Type.Number(),
  totalFailed: typebox.Type.Number(),
  lastDeliveryAgeMs: typebox.Type.Union([typebox.Type.Number(), typebox.Type.Null()]),
  healthy: typebox.Type.Boolean(),
  sources: typebox.Type.Record(typebox.Type.String(), ThroughputSourceSchema)
});
var ThroughputSnapshotSchema = typebox.Type.Object({
  global: typebox.Type.Object({
    eventsPerSecond: typebox.Type.Number(),
    totalRecorded: typebox.Type.Number(),
    windowSeconds: typebox.Type.Number()
  }),
  endpoints: typebox.Type.Record(typebox.Type.String(), ThroughputEndpointSchema)
});
var MetricsAssignmentEntrySchema = typebox.Type.Object({
  assignmentId: typebox.Type.String(),
  status: typebox.Type.String(),
  throughput: typebox.Type.Union([ThroughputSnapshotSchema, typebox.Type.Null()]),
  updatedAt: typebox.Type.String()
});
var DataPathwayMetricsSchema = typebox.Type.Object({
  pathwayId: typebox.Type.String(),
  assignments: typebox.Type.Array(MetricsAssignmentEntrySchema)
});
var DataPathwayHealthSchema = typebox.Type.Object({
  status: typebox.Type.Union([typebox.Type.Literal("healthy"), typebox.Type.Literal("unhealthy")]),
  checks: typebox.Type.Object({ db: typebox.Type.Union([typebox.Type.Literal("ok"), typebox.Type.Literal("error")]) }),
  uptime: typebox.Type.Number()
});
var DataPathwayPumpPulseResponseSchema = typebox.Type.Object({
  status: typebox.Type.String()
});
var PumpPulseEntrySchema = typebox.Type.Object({
  flowType: typebox.Type.String(),
  timeBucket: typebox.Type.String(),
  eventId: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  isLive: typebox.Type.Boolean(),
  buffer: typebox.Type.Object({
    depth: typebox.Type.Number(),
    reserved: typebox.Type.Number(),
    sizeBytes: typebox.Type.Number()
  }),
  counters: typebox.Type.Object({
    acknowledged: typebox.Type.Number(),
    failed: typebox.Type.Number(),
    pulled: typebox.Type.Number()
  }),
  uptimeMs: typebox.Type.Number(),
  lastPulseAgeMs: typebox.Type.Number(),
  healthy: typebox.Type.Boolean()
});
var PumpStatusAssignmentSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  status: typebox.Type.String(),
  leaseRemainingMs: typebox.Type.Number(),
  lastHeartbeatAgeMs: typebox.Type.Number(),
  metrics: typebox.Type.Unknown()
});
var DataPathwayPumpStatusSchema = typebox.Type.Object({
  pathwayId: typebox.Type.String(),
  pulses: typebox.Type.Array(PumpPulseEntrySchema),
  assignment: typebox.Type.Union([PumpStatusAssignmentSchema, typebox.Type.Null()])
});

// src/commands/data-pathways/assignment.expire-leases.ts
init_parse_response_helper();
var DataPathwayAssignmentExpireLeasesCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayExpireLeasesResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/assignment.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayAssignmentFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayAssignmentSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayAssignment", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/assignment.heartbeat.ts
init_command();
var DataPathwayAssignmentHeartbeatCommand = class extends exports.Command {
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
var DataPathwayAssignmentListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayAssignmentListSchema, rawResponse);
  }
};

// src/commands/data-pathways/assignment.next.ts
init_command();
init_parse_response_helper();
var DataPathwayAssignmentNextCommand = class extends exports.Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/assignments/next`;
  }
  parseResponse(rawResponse) {
    return exports.parseResponseHelper(DataPathwayAssignmentNextSchema, rawResponse);
  }
};

// src/commands/data-pathways/capacity.fetch.ts
init_command();
init_parse_response_helper();
var DataPathwayCapacityFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCapacitySchema, rawResponse);
  }
};

// src/commands/data-pathways/command.dispatch-config-update.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchConfigUpdateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.dispatch-restart.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchRestartCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.dispatch-stop.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchStopCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandDetailSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayCommand", { commandId: this.input.commandId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.pending.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandPendingCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandListSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayAssignment", { id: this.input.assignmentId });
    }
    throw error;
  }
};

// src/commands/data-pathways/command.update-status.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandUpdateStatusCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayCommand", {
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
var DataPathwayDeliveryLogBatchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayDeliveryLogBatchResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/delivery-log.list.ts
init_command();
init_parse_response_helper();
var DataPathwayDeliveryLogListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayDeliveryLogListSchema, rawResponse);
  }
};

// src/commands/data-pathways/health.check.ts
init_command();
init_parse_response_helper();
var DataPathwayHealthCheckCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayHealthSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway.create.ts
init_command();
init_parse_response_helper();
var DataPathwayCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway.delete.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayDeleteCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.disable.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayDisableCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwaySchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.fetch-by-name.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayFetchByNameCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwaySchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { name: this.input.name, tenant: this.input.tenant });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.list.ts
init_command();
init_parse_response_helper();
var DataPathwayListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayListSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway.metrics.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayMetricsFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayMetricsSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway.upsert-by-name.ts
init_command();
init_parse_response_helper();
var DataPathwayUpsertByNameResponseSchema = typebox.Type.Object({
  pathwayId: typebox.Type.String(),
  status: typebox.Type.Union([typebox.Type.Literal("created"), typebox.Type.Literal("updated")])
});
var DataPathwayUpsertByNameCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayUpsertByNameResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pathway-command.dispatch-pause.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchPauseCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { id: this.input.pathwayId });
    }
  }
};

// src/commands/data-pathways/pathway-command.dispatch-resume.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandDispatchResumeCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { id: this.input.pathwayId });
    }
  }
};

// src/commands/data-pathways/pathway-command.pending.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandPendingByPathwayCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandListSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathway", { id: this.input.pathwayId });
    }
    throw error;
  }
};

// src/commands/data-pathways/pathway-command.update-status.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayCommandUpdateStatusByPathwayCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayCommandResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayCommand", {
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
var SendPumpPulseCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayPumpPulseResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pump-state.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayPumpStateFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayPumpStateSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayPumpState", {
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
var DataPathwayPumpStateFetchBySourceCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayPumpStateBySourceSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayPumpState", {
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
var DataPathwayPumpStateSaveCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayPumpStateSaveResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pump-state.save-by-source.ts
init_command();
init_parse_response_helper();
var DataPathwayPumpStateSaveBySourceCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayPumpStateSaveResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/pump-status.fetch.ts
init_command();
init_parse_response_helper();
init_not_found();
var FetchPumpStatusCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayPumpStatusSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Pathway", { pathwayId: this.input.pathwayId });
    }
    throw error;
  }
};

// src/commands/data-pathways/quota.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayQuotaFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayQuotaWithUsageSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayQuota", { tenant: this.input.tenant });
    }
    throw error;
  }
};

// src/commands/data-pathways/quota.list.ts
init_command();
init_parse_response_helper();
var DataPathwayQuotaListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayQuotaListSchema, rawResponse);
  }
};

// src/commands/data-pathways/quota.set.ts
init_command();
init_parse_response_helper();
var DataPathwayQuotaSetCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayQuotaSetResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/restart.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwayRestartFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwayRestartRequestSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwayRestartRequest", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/restart.request.ts
init_command();
init_parse_response_helper();
var DataPathwayRestartRequestCommand = class extends exports.Command {
  retryOnFailure = false;
  allowedModes = ["bearer"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/restarts/request`;
  }
  parseResponse(rawResponse) {
    return exports.parseResponseHelper(DataPathwayRestartRequestResponseSchema, rawResponse);
  }
};

// src/commands/data-pathways/slot.deregister.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwaySlotDeregisterCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwaySlot", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/slot.fetch.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwaySlotFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwaySlotSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwaySlot", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/slot.heartbeat.ts
init_command();
init_not_found();
init_parse_response_helper();
var DataPathwaySlotHeartbeatCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse);
  }
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("DataPathwaySlot", { id: this.input.id });
    }
    throw error;
  }
};

// src/commands/data-pathways/slot.list.ts
init_command();
init_parse_response_helper();
var DataPathwaySlotListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(DataPathwaySlotListSchema, rawResponse);
  }
};

// src/commands/data-pathways/slot.register.ts
init_command();
init_parse_response_helper();
var DataPathwaySlotRegisterCommand = class extends exports.Command {
  retryOnFailure = false;
  allowedModes = ["apiKey"];
  getBaseUrl() {
    return "https://data-pathways.api.flowcore.io";
  }
  getPath() {
    return `/api/v1/slots/register`;
  }
  parseResponse(rawResponse) {
    return exports.parseResponseHelper(DataPathwaySlotMutationResponseSchema, rawResponse);
  }
};

// src/commands/iam/permissions/get-user-permissions.ts
init_command();
init_parse_response_helper();
var UserPermissionSchema = typebox.Type.Object({
  tenant: typebox.Type.String(),
  type: typebox.Type.String(),
  id: typebox.Type.String(),
  action: typebox.Type.Array(typebox.Type.String())
});
var UserPermissionsCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(UserPermissionSchema), rawResponse);
  }
};

// src/commands/iam/policies/create-policy.ts
init_command();
init_parse_response_helper();
var PolicyFilterValueSchema = typebox.Type.Union([
  typebox.Type.String({ maxLength: 512 }),
  typebox.Type.Number(),
  typebox.Type.Boolean(),
  typebox.Type.Null()
]);
var PolicyFilterPathSchema = typebox.Type.String({
  minLength: 1,
  maxLength: 256,
  pattern: "^[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+){0,7}$"
});
var PolicyFilterSchema = typebox.Type.Union([
  typebox.Type.Object({ path: PolicyFilterPathSchema, operator: typebox.Type.Literal("equals"), value: PolicyFilterValueSchema }, { additionalProperties: false }),
  typebox.Type.Object({ path: PolicyFilterPathSchema, operator: typebox.Type.Literal("oneOf"), values: typebox.Type.Array(PolicyFilterValueSchema, { minItems: 1, maxItems: 20 }) }, { additionalProperties: false }),
  typebox.Type.Object({ path: PolicyFilterPathSchema, operator: typebox.Type.Literal("exists"), value: typebox.Type.Boolean() }, { additionalProperties: false })
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
var PolicyStatementSchema = typebox.Type.Object({
  statementId: typebox.Type.Optional(typebox.Type.String()),
  resource: typebox.Type.String(),
  action: typebox.Type.Union([typebox.Type.String(), typebox.Type.Array(typebox.Type.String())]),
  filters: typebox.Type.Optional(typebox.Type.Array(PolicyFilterSchema, { minItems: 1, maxItems: 10 }))
});
var PolicySchema = typebox.Type.Object({
  id: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  name: typebox.Type.String(),
  version: typebox.Type.String(),
  policyDocuments: typebox.Type.Array(PolicyStatementSchema),
  description: typebox.Type.Optional(typebox.Type.String()),
  principal: typebox.Type.Optional(typebox.Type.String()),
  flowcoreManaged: typebox.Type.Boolean(),
  archived: typebox.Type.Optional(typebox.Type.Boolean()),
  frn: typebox.Type.String()
});
var PolicyCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(PolicySchema, rawResponse);
  }
};

// src/commands/iam/policies/get-policy.ts
init_command();
init_parse_response_helper();
var PolicyListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(PolicySchema), rawResponse);
  }
};

// src/commands/iam/policies/validate-policy.ts
init_command();
init_parse_response_helper();
var PolicyValidateResponseSchema = typebox.Type.Object({
  valid: typebox.Type.Literal(true)
});
var PolicyValidateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(PolicyValidateResponseSchema, rawResponse);
  }
};

// src/commands/iam/policies/id/archive-policy.ts
init_command();
init_parse_response_helper();
var ArchivePolicyResponseSchema = typebox.Type.Object({
  message: typebox.Type.String()
});
var PolicyArchiveCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ArchivePolicyResponseSchema, rawResponse);
  }
};

// src/commands/iam/policies/id/get-policy.ts
init_command();
init_parse_response_helper();
var PolicyGetCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(PolicySchema, rawResponse);
  }
};

// src/commands/iam/policies/id/update-policy.ts
init_command();
init_parse_response_helper();
var PolicyUpdateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(PolicySchema, rawResponse);
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
    return exports.parseResponseHelper(typebox.Type.Array(PolicySchema), rawResponse);
  } catch (error) {
    if (error instanceof Error && error.message.includes("flowcoreManaged") && Array.isArray(rawResponse)) {
      const sanitizedPolicies = rawResponse.map((policy) => ({
        ...policy,
        // Convert to boolean using double negation
        flowcoreManaged: policy.flowcoreManaged === true || !!policy.flowcoreManaged
      }));
      return exports.parseResponseHelper(typebox.Type.Array(PolicySchema), sanitizedPolicies);
    }
    throw error;
  }
};
var KeyPoliciesCommand = class extends exports.Command {
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
var OrganizationPoliciesCommand = class extends exports.Command {
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
          return exports.parseResponseHelper(PolicySchema, item);
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
    return exports.parseResponseHelper(typebox.Type.Array(PolicySchema), rawResponse);
  }
};

// src/commands/iam/policy-associations/get-policy-associations.ts
init_command();
init_parse_response_helper();
var PolicyKeyAssociationSchema = typebox.Type.Object({
  policyId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  keyId: typebox.Type.String()
});
var PolicyUserAssociationSchema = typebox.Type.Object({
  policyId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  userId: typebox.Type.String()
});
var PolicyRoleAssociationSchema = typebox.Type.Object({
  policyId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  roleId: typebox.Type.String()
});
var PolicyAssociationsSchema = typebox.Type.Object({
  keys: typebox.Type.Array(PolicyKeyAssociationSchema),
  users: typebox.Type.Array(PolicyUserAssociationSchema),
  roles: typebox.Type.Array(PolicyRoleAssociationSchema)
});
var parsePolicyAssociationsResponse = (rawResponse) => {
  try {
    return exports.parseResponseHelper(PolicyAssociationsSchema, rawResponse);
  } catch (_error) {
    if (!rawResponse || typeof rawResponse !== "object") {
      return { keys: [], users: [], roles: [] };
    }
    const rawData = rawResponse;
    let keys = Array.isArray(rawData.keys) ? rawData.keys : [];
    let users = Array.isArray(rawData.users) ? rawData.users : [];
    let roles = Array.isArray(rawData.roles) ? rawData.roles : [];
    try {
      keys = exports.parseResponseHelper(typebox.Type.Array(PolicyKeyAssociationSchema), keys);
    } catch (_error2) {
      keys = [];
    }
    try {
      users = exports.parseResponseHelper(
        typebox.Type.Array(PolicyUserAssociationSchema),
        users
      );
    } catch (_error2) {
      users = [];
    }
    try {
      roles = exports.parseResponseHelper(
        typebox.Type.Array(PolicyRoleAssociationSchema),
        roles
      );
    } catch (_error2) {
      roles = [];
    }
    return { keys, users, roles };
  }
};
var PolicyAssociationsCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(PolicySchema), rawResponse);
  } catch (error) {
    if (error instanceof Error && error.message.includes("flowcoreManaged") && Array.isArray(rawResponse)) {
      const sanitizedPolicies = rawResponse.map((policy) => ({
        ...policy,
        // Convert to boolean with explicit type-safe conversion
        flowcoreManaged: policy.flowcoreManaged === true || policy.flowcoreManaged === "true" || typeof policy.flowcoreManaged === "boolean" && policy.flowcoreManaged
      }));
      return exports.parseResponseHelper(typebox.Type.Array(PolicySchema), sanitizedPolicies);
    }
    throw error;
  }
};
var RolePoliciesCommand = class extends exports.Command {
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
var UserPoliciesCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(PolicySchema), rawResponse);
  }
};

// src/commands/iam/policy-associations/link-key-policy.ts
init_command();
init_parse_response_helper();
var KeyPolicyLinkSchema = typebox.Type.Object({
  policyId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  keyId: typebox.Type.String()
});
var LinkKeyPolicyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(KeyPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/link-role-policy.ts
init_command();
init_parse_response_helper();
var RolePolicyLinkSchema = typebox.Type.Object({
  policyId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  roleId: typebox.Type.String()
});
var LinkRolePolicyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(RolePolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/link-user-policy.ts
init_command();
init_parse_response_helper();
var UserPolicyLinkSchema = typebox.Type.Object({
  policyId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  userId: typebox.Type.String()
});
var LinkUserPolicyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(UserPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/unlink-key-policy.ts
init_command();
init_parse_response_helper();
var UnlinkKeyPolicyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(KeyPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/unlink-role-policy.ts
init_command();
init_parse_response_helper();
var UnlinkRolePolicyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(RolePolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/policy-associations/unlink-user-policy.ts
init_command();
init_parse_response_helper();
var UnlinkUserPolicyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(UserPolicyLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/get-key-roles.ts
init_command();
init_parse_response_helper();

// src/commands/iam/roles/create-role.ts
init_command();
init_parse_response_helper();
var RoleSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.Optional(typebox.Type.String()),
  flowcoreManaged: typebox.Type.Optional(typebox.Type.Boolean({ default: false })),
  archived: typebox.Type.Optional(typebox.Type.Boolean())
});
var RoleCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(RoleSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/get-key-roles.ts
var KeyRolesCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(RoleSchema), rawResponse);
  }
};

// src/commands/iam/role-associations/get-organization-roles.ts
init_command();
init_parse_response_helper();
var FlexibleRoleSchema = typebox.Type.Object({
  id: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  name: typebox.Type.String(),
  description: typebox.Type.Optional(typebox.Type.String()),
  flowcoreManaged: typebox.Type.Boolean(),
  archived: typebox.Type.Optional(typebox.Type.Boolean()),
  frn: typebox.Type.String(),
  createdAt: typebox.Type.Optional(typebox.Type.String()),
  updatedAt: typebox.Type.Optional(typebox.Type.String())
});
var OrganizationRolesCommand = class extends exports.Command {
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
    const flexibleRoles = exports.parseResponseHelper(
      typebox.Type.Array(FlexibleRoleSchema),
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
var RoleKeyAssociationSchema = typebox.Type.Object({
  roleId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  keyId: typebox.Type.String()
});
var RoleUserAssociationSchema = typebox.Type.Object({
  roleId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  userId: typebox.Type.String()
});
var RoleAssociationsSchema = typebox.Type.Object({
  keys: typebox.Type.Array(RoleKeyAssociationSchema),
  users: typebox.Type.Array(RoleUserAssociationSchema)
});
var RoleAssociationsCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(RoleAssociationsSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/get-user-roles.ts
init_command();
init_parse_response_helper();
var UserRolesCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(RoleSchema), rawResponse);
  }
};

// src/commands/iam/role-associations/link-key-role.ts
init_command();
init_parse_response_helper();
var KeyRoleLinkSchema = typebox.Type.Object({
  roleId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  keyId: typebox.Type.String()
});
var LinkKeyRoleCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(KeyRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/link-user-role.ts
init_command();
init_parse_response_helper();
var UserRoleLinkSchema = typebox.Type.Object({
  roleId: typebox.Type.String(),
  organizationId: typebox.Type.String(),
  userId: typebox.Type.String()
});
var LinkUserRoleCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(UserRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/unlink-key-role.ts
init_command();
init_parse_response_helper();
var UnlinkKeyRoleCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(KeyRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/role-associations/unlink-user-role.ts
init_command();
init_parse_response_helper();
var UnlinkUserRoleCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(UserRoleLinkSchema, rawResponse);
  }
};

// src/commands/iam/roles/get-roles.ts
init_command();
init_parse_response_helper();
var RoleListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(typebox.Type.Array(RoleSchema), rawResponse);
  }
};

// src/commands/iam/roles/id/archive-role.ts
init_command();
init_parse_response_helper();
var ArchiveRoleResponseSchema = typebox.Type.Object({
  message: typebox.Type.String()
});
var RoleArchiveCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ArchiveRoleResponseSchema, rawResponse);
  }
};

// src/commands/iam/roles/id/get-role.ts
init_command();
init_parse_response_helper();
var RoleGetCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(RoleSchema, rawResponse);
  }
};

// src/commands/iam/roles/id/update-role.ts
init_command();
init_parse_response_helper();
var RoleUpdateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(RoleSchema, rawResponse);
  }
};

// src/commands/iam/tenant-iam-audit/get-audit-for-tenant.ts
init_command();
init_parse_response_helper();
var AuditLogEntrySchema = typebox.Type.Object({
  id: typebox.Type.String(),
  event: typebox.Type.String(),
  resourceName: typebox.Type.String(),
  performedBy: typebox.Type.Union([
    typebox.Type.String(),
    typebox.Type.Object({}),
    // Allow performedBy to be any object
    typebox.Type.Null()
    // Or null
  ]),
  timestamp: typebox.Type.String(),
  status: typebox.Type.String()
});
var PaginationSchema = typebox.Type.Object({
  page: typebox.Type.Number(),
  pageSize: typebox.Type.Number(),
  totalItems: typebox.Type.Number(),
  totalPages: typebox.Type.Number()
});
var AuditLogResponseSchema = typebox.Type.Object({
  logs: typebox.Type.Array(AuditLogEntrySchema),
  pagination: PaginationSchema
});
var TenantAuditLogsCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(AuditLogResponseSchema, rawResponse);
  }
};

// src/commands/iam/validate/validate-key.ts
init_command();
init_parse_response_helper();

// src/commands/iam/validate/validate-user.ts
init_command();
init_parse_response_helper();
var ValidPolicySchema = typebox.Type.Object({
  policyFrn: typebox.Type.String(),
  statementId: typebox.Type.String()
});
var ValidationResponseSchema = typebox.Type.Object({
  valid: typebox.Type.Boolean(),
  checksum: typebox.Type.String(),
  validPolicies: typebox.Type.Array(ValidPolicySchema)
});
var ValidateUserCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ValidationResponseSchema, rawResponse);
  }
};

// src/commands/iam/validate/validate-key.ts
var ValidateKeyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ValidationResponseSchema, rawResponse);
  }
};

// src/commands/iam/entitlements/resolve-user-entitlements.ts
init_command();
init_parse_response_helper();
var EntitlementResponseSchema = typebox.Type.Object({
  valid: typebox.Type.Literal(true),
  requestChecksum: typebox.Type.String(),
  entitlementChecksum: typebox.Type.String(),
  cacheTtlSeconds: typebox.Type.Number(),
  entitlements: typebox.Type.Array(
    typebox.Type.Object({
      requestIndex: typebox.Type.Number(),
      grants: typebox.Type.Array(
        typebox.Type.Object({
          policyFrn: typebox.Type.String(),
          statementId: typebox.Type.String(),
          resource: typebox.Type.String(),
          filters: typebox.Type.Optional(typebox.Type.Array(PolicyFilterSchema))
        })
      )
    })
  )
});
function parseEntitlementResponse(rawResponse) {
  return exports.parseResponseHelper(EntitlementResponseSchema, rawResponse);
}
var ResolveUserEntitlementsCommand = class extends exports.Command {
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
var ResolveKeyEntitlementsCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(EntitlementResponseSchema, rawResponse);
  }
};

// src/commands/compute/compute-domain.attach.ts
init_command();
var ComputeNoContentSchema = typebox.Type.Object({
  /** The HTTP status the service answered with (always 204) */
  status: typebox.Type.Number()
});
var ComputeWorkloadStatusSchema = typebox.Type.Union([
  typebox.Type.Literal("pending"),
  typebox.Type.Literal("running"),
  typebox.Type.Literal("stopped"),
  typebox.Type.Literal("failed"),
  typebox.Type.Literal("archived")
]);
var ComputeWorkloadKindSchema = typebox.Type.Union([
  typebox.Type.Literal("service"),
  typebox.Type.Literal("job")
]);
var ComputeSlotTierSchema = typebox.Type.Union([
  typebox.Type.Literal("nano"),
  typebox.Type.Literal("micro"),
  typebox.Type.Literal("small"),
  typebox.Type.Literal("medium"),
  typebox.Type.Literal("large")
]);
var ComputeProbeHttpGetSchema = typebox.Type.Object({
  /** Request path (defaults to `/` server-side) */
  path: typebox.Type.Optional(typebox.Type.String()),
  /** Container port to probe */
  port: typebox.Type.Number(),
  /** Extra request headers */
  headers: typebox.Type.Optional(typebox.Type.Record(typebox.Type.String(), typebox.Type.String()))
});
var ComputeProbeTcpSocketSchema = typebox.Type.Object({
  /** Container port to dial */
  port: typebox.Type.Number()
});
var ComputeProbeExecSchema = typebox.Type.Object({
  /** Command and arguments to run inside the container */
  command: typebox.Type.Array(typebox.Type.String())
});
var ComputeProbeSchema = typebox.Type.Object({
  /** HTTP GET handler */
  httpGet: typebox.Type.Optional(ComputeProbeHttpGetSchema),
  /** TCP socket handler */
  tcpSocket: typebox.Type.Optional(ComputeProbeTcpSocketSchema),
  /** Exec handler */
  exec: typebox.Type.Optional(ComputeProbeExecSchema),
  /** Delay before the first probe */
  initialDelaySeconds: typebox.Type.Optional(typebox.Type.Number()),
  /** Seconds between probes */
  periodSeconds: typebox.Type.Optional(typebox.Type.Number()),
  /** Per-probe timeout in seconds */
  timeoutSeconds: typebox.Type.Optional(typebox.Type.Number()),
  /** Consecutive failures before the probe is considered failed */
  failureThreshold: typebox.Type.Optional(typebox.Type.Number())
});
var ComputeWorkloadProbesSchema = typebox.Type.Object({
  /** Startup probe */
  startup: typebox.Type.Optional(ComputeProbeSchema),
  /** Readiness probe */
  readiness: typebox.Type.Optional(ComputeProbeSchema),
  /** Liveness probe */
  liveness: typebox.Type.Optional(ComputeProbeSchema)
});
var ComputePreSyncSpecSchema = typebox.Type.Object({
  /** Label reported as `progress.preSync.name` (defaults to `pre-sync`) */
  name: typebox.Type.Optional(typebox.Type.String()),
  /** Image the hook runs */
  image: typebox.Type.String(),
  /** Command and arguments the hook runs */
  command: typebox.Type.Array(typebox.Type.String()),
  /** Deadline for the hook (defaults to 300 server-side) */
  timeoutSeconds: typebox.Type.Optional(typebox.Type.Number())
});
var ComputeWorkloadScalingModeSchema = typebox.Type.Union([
  typebox.Type.Literal("manual"),
  typebox.Type.Literal("hpa")
]);
var ComputeWorkloadScalingSchema = typebox.Type.Object({
  /** `manual` (default) or `hpa` */
  mode: typebox.Type.Optional(ComputeWorkloadScalingModeSchema),
  /** The autoscaler's floor, 1..50. Also the count a create and a resume start at under `hpa` */
  minReplicas: typebox.Type.Optional(typebox.Type.Number()),
  /** The autoscaler's ceiling, 1..50 — the number the tenant quota pre-flight measures */
  maxReplicas: typebox.Type.Optional(typebox.Type.Number()),
  /** Target average CPU utilization, 1..100 percent of the slot's request */
  targetCpuPercent: typebox.Type.Optional(typebox.Type.Number()),
  /** Target average memory utilization, 1..100 percent of the slot's request */
  targetMemoryPercent: typebox.Type.Optional(typebox.Type.Number())
});
var ComputeWorkloadEnvVarSchema = typebox.Type.Object({
  /** Variable name, e.g. `GREETING` */
  name: typebox.Type.String(),
  /** Variable value, stored and replayed as-is */
  value: typebox.Type.String()
});
var ComputeWorkloadSecretRefSchema = typebox.Type.Object({
  /** Variable name as the container sees it, e.g. `TOKEN` */
  name: typebox.Type.String(),
  /** The key in the tenant's organization secrets that supplies the value */
  secretKey: typebox.Type.String()
});
var ComputeWorkloadVolumeSchema = typebox.Type.Object({
  /** Lowercase DNS label, max 20 chars — embedded in the claim's object name */
  name: typebox.Type.String(),
  /** Provisioned size in Gi, 1..1024 — growth-only after create */
  sizeGi: typebox.Type.Number(),
  /** Absolute mount path inside the container (never `/`) */
  mountPath: typebox.Type.String()
});
var ComputeWorkloadDefinitionSchema = typebox.Type.Object({
  /** Container image reference */
  image: typebox.Type.String(),
  /** Compute slot tier */
  slotTier: ComputeSlotTierSchema,
  /** Service or run-to-completion job (defaults to `service`) */
  kind: typebox.Type.Optional(ComputeWorkloadKindSchema),
  /** Fixed replica count under `scaling.mode: "manual"` (defaults to 1) */
  replicas: typebox.Type.Optional(typebox.Type.Number()),
  /** The container's listening port (defaults to 8080) */
  port: typebox.Type.Optional(typebox.Type.Number()),
  /** Startup, readiness and liveness probes */
  probes: typebox.Type.Optional(ComputeWorkloadProbesSchema),
  /** The pre-sync hook that gates every apply of this definition */
  preSync: typebox.Type.Optional(ComputePreSyncSpecSchema),
  /** How the replica count is decided (defaults to `{ mode: "manual" }`) */
  scaling: typebox.Type.Optional(ComputeWorkloadScalingSchema),
  /** Plain environment variables (defaults to an empty list) */
  env: typebox.Type.Optional(typebox.Type.Array(ComputeWorkloadEnvVarSchema)),
  /** Organization-secret bindings, by key reference (defaults to an empty list) */
  secrets: typebox.Type.Optional(typebox.Type.Array(ComputeWorkloadSecretRefSchema)),
  /** Persistent volumes, max 4 (defaults to an empty list). See ComputeWorkloadVolumeSchema */
  volumes: typebox.Type.Optional(typebox.Type.Array(ComputeWorkloadVolumeSchema))
});
var ComputeWorkloadSchema = typebox.Type.Object({
  /** The workload id (full UUID) */
  id: typebox.Type.String(),
  /** The owning tenant id (full UUID) */
  tenantId: typebox.Type.String(),
  /** Human name of the workload */
  name: typebox.Type.String(),
  /** Lifecycle state */
  status: ComputeWorkloadStatusSchema,
  /** Observed ready replica count, as reported by the reconciler */
  readyReplicas: typebox.Type.Number(),
  /** Explanation of the latest non-healthy transition */
  reason: typebox.Type.Optional(typebox.Type.String()),
  /** The definition of the ACTIVE revision */
  definition: typebox.Type.Optional(ComputeWorkloadDefinitionSchema),
  /** Ordinal of the revision the platform has accepted as current */
  activeRevision: typebox.Type.Optional(typebox.Type.Number()),
  /** When the active revision came from a rollback, the ordinal it was taken from */
  rolledBackFrom: typebox.Type.Optional(typebox.Type.Number()),
  /** Whether the workload was deliberately paused (scaled to zero) */
  paused: typebox.Type.Optional(typebox.Type.Boolean()),
  /** ISO-8601 creation timestamp */
  createdAt: typebox.Type.String(),
  /** ISO-8601 last-update timestamp */
  updatedAt: typebox.Type.String()
});
var ComputeWorkloadRunKindSchema = typebox.Type.Union([
  typebox.Type.Literal("batch"),
  typebox.Type.Literal("pre_sync")
]);
var ComputeWorkloadRunStatusSchema = typebox.Type.Union([
  typebox.Type.Literal("running"),
  typebox.Type.Literal("succeeded"),
  typebox.Type.Literal("failed")
]);
var ComputeWorkloadRunSchema = typebox.Type.Object({
  /** The run id (full UUID) */
  id: typebox.Type.String(),
  /** The workload the run belongs to (full UUID) */
  workloadId: typebox.Type.String(),
  /** The owning tenant id (full UUID) */
  tenantId: typebox.Type.String(),
  /** `batch` for an on-demand run, `pre_sync` for a deploy hook */
  kind: ComputeWorkloadRunKindSchema,
  /** The Kubernetes Job object name (`run-<runId>` or `pre-sync-<workloadId>-r<revision>`) */
  name: typebox.Type.String(),
  /** Run state */
  status: ComputeWorkloadRunStatusSchema,
  /** Explanation of a failure */
  reason: typebox.Type.Optional(typebox.Type.String()),
  /** The operation the run is tracked under (full UUID) */
  operationId: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 start timestamp */
  startedAt: typebox.Type.String(),
  /** ISO-8601 completion timestamp, absent while the run is in flight */
  completedAt: typebox.Type.Optional(typebox.Type.String())
});
var ComputeWorkloadRunListSchema = typebox.Type.Object({
  /** One page of runs, newest first */
  runs: typebox.Type.Array(ComputeWorkloadRunSchema),
  /** Opaque cursor for the next page; absent on the last page */
  nextCursor: typebox.Type.Optional(typebox.Type.String())
});
var ComputeWorkloadListResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  workloads: typebox.Type.Array(ComputeWorkloadSchema)
});
var ComputeWorkloadResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  workload: ComputeWorkloadSchema
});
var ComputeWorkloadCreateResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  workload: ComputeWorkloadSchema,
  /** Poll `GET /api/v1/operations/{operationId}` for cluster convergence */
  operationId: typebox.Type.String()
});
var ComputeWorkloadMutationResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  workload: ComputeWorkloadSchema,
  /** Poll `GET /api/v1/operations/{operationId}` for cluster convergence */
  operationId: typebox.Type.String()
});
var ComputeWorkloadDeleteResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  /** Poll `GET /api/v1/operations/{operationId}` for the teardown */
  operationId: typebox.Type.String()
});
var ComputeWorkloadRunResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  /** The run row, already listed by `GET /runs` */
  run: ComputeWorkloadRunSchema,
  /** The run id (full UUID) — also the Kubernetes Job name suffix */
  runId: typebox.Type.String(),
  /** Poll `GET /api/v1/operations/{operationId}` for the run */
  operationId: typebox.Type.String()
});
var ComputeLogStreamNameSchema = typebox.Type.Union([
  typebox.Type.Literal("stdout"),
  typebox.Type.Literal("stderr")
]);
var ComputeLogEntrySchema = typebox.Type.Object({
  /** ISO-8601 timestamp of the line */
  timestamp: typebox.Type.String(),
  /** The pod that emitted it */
  podName: typebox.Type.String(),
  /** The container that emitted it */
  container: typebox.Type.String(),
  /** Parsed log level */
  level: typebox.Type.String(),
  /** The line itself */
  message: typebox.Type.String(),
  /** `stdout` or `stderr` */
  stream: ComputeLogStreamNameSchema
});
var ComputeWorkloadLogsSchema = typebox.Type.Object({
  /** The workload the lines belong to (full UUID) */
  workloadId: typebox.Type.String(),
  /** Echo of the requested container filter; `null` when the query was not container-scoped */
  container: typebox.Type.Union([typebox.Type.String(), typebox.Type.Null()]),
  /** How many lines matched upstream */
  totalMatches: typebox.Type.Number(),
  /** The matching lines, newest-first as indexed upstream */
  logs: typebox.Type.Array(ComputeLogEntrySchema)
});
var ComputeLogStreamEventSchema = typebox.Type.Object({
  /** ISO-8601 timestamp of the line, from the Kubernetes `timestamps=true` prefix */
  timestamp: typebox.Type.String(),
  /** The pod that emitted it */
  pod: typebox.Type.String(),
  /** The container that emitted it */
  container: typebox.Type.String(),
  /** The line itself, passed through byte-for-byte */
  line: typebox.Type.String()
});
var ComputeDomainStatusSchema = typebox.Type.Union([
  typebox.Type.Literal("pending_verification"),
  typebox.Type.Literal("ready"),
  typebox.Type.Literal("failed"),
  typebox.Type.Literal("detached")
]);
var ComputeDomainVerificationTypeSchema = typebox.Type.Union([
  typebox.Type.Literal("cname"),
  typebox.Type.Literal("platform_wildcard")
]);
var ComputeDomainVerificationSchema = typebox.Type.Object({
  /** `cname` for a custom hostname, `platform_wildcard` when the platform owns the zone */
  type: ComputeDomainVerificationTypeSchema,
  /** The DNS record the caller must create */
  expectedTarget: typebox.Type.String(),
  /** Whether the expected record was observed */
  verified: typebox.Type.Boolean()
});
var ComputeDomainTlsStatusSchema = typebox.Type.Union([
  typebox.Type.Literal("pending_issuance"),
  typebox.Type.Literal("issued"),
  typebox.Type.Literal("failed")
]);
var ComputeDomainTlsSchema = typebox.Type.Object({
  /** Issuance state */
  status: ComputeDomainTlsStatusSchema,
  /** The in-cluster Secret the certificate lands in */
  secretName: typebox.Type.String(),
  /** The issuing CA, once observed */
  issuer: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 expiry, once observed */
  expiresAt: typebox.Type.Optional(typebox.Type.String())
});
var ComputeDomainSchema = typebox.Type.Object({
  /** The domain binding id (full UUID) */
  domainId: typebox.Type.String(),
  /** The workload the hostname routes to (full UUID) */
  workloadId: typebox.Type.String(),
  /** The bound hostname */
  hostname: typebox.Type.String(),
  /** The container port the ingress routes to */
  targetPort: typebox.Type.Number(),
  /** Lifecycle state of the binding */
  status: ComputeDomainStatusSchema,
  /** DNS ownership state */
  verification: ComputeDomainVerificationSchema,
  /** Certificate state */
  tls: ComputeDomainTlsSchema,
  /** ISO-8601 creation timestamp */
  createdAt: typebox.Type.String()
});
var ComputeDomainListResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  domains: typebox.Type.Array(ComputeDomainSchema)
});
var ComputeDomainVerifyResponseSchema = typebox.Type.Object({
  /** The domain binding id (full UUID) */
  domainId: typebox.Type.String(),
  /** The bound hostname */
  hostname: typebox.Type.String(),
  /** Lifecycle state after the observation */
  status: ComputeDomainStatusSchema,
  /** What the DNS lookup saw */
  verification: ComputeDomainVerificationSchema,
  /** What the read-only Certificate GET saw */
  tls: ComputeDomainTlsSchema
});
var ComputeOperationTypeSchema = typebox.Type.Union([
  typebox.Type.Literal("workload.deploy"),
  typebox.Type.Literal("workload.update"),
  typebox.Type.Literal("workload.rollback"),
  typebox.Type.Literal("workload.archive"),
  typebox.Type.Literal("workload.pause"),
  typebox.Type.Literal("workload.resume"),
  typebox.Type.Literal("workload.run")
]);
var ComputeOperationStatusSchema = typebox.Type.Union([
  typebox.Type.Literal("pending"),
  typebox.Type.Literal("in_progress"),
  typebox.Type.Literal("succeeded"),
  typebox.Type.Literal("failed")
]);
var ComputeOperationPhaseSchema = typebox.Type.Union([
  typebox.Type.Literal("queued"),
  typebox.Type.Literal("pre_sync_running"),
  typebox.Type.Literal("pre_sync_failed"),
  typebox.Type.Literal("deploying"),
  typebox.Type.Literal("rolling_out"),
  typebox.Type.Literal("tearing_down"),
  typebox.Type.Literal("pausing"),
  typebox.Type.Literal("resuming"),
  typebox.Type.Literal("running"),
  typebox.Type.Literal("completed"),
  typebox.Type.Literal("failed")
]);
var ComputeOperationStepStatusSchema = typebox.Type.Union([
  typebox.Type.Literal("pending"),
  typebox.Type.Literal("running"),
  typebox.Type.Literal("succeeded"),
  typebox.Type.Literal("failed")
]);
var ComputeOperationPreSyncProgressSchema = typebox.Type.Object({
  /** The hook's label */
  name: typebox.Type.String(),
  /** Step state */
  status: ComputeOperationStepStatusSchema,
  /** ISO-8601 start timestamp */
  startedAt: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 completion timestamp */
  completedAt: typebox.Type.Optional(typebox.Type.String())
});
var ComputeOperationDeploymentProgressSchema = typebox.Type.Object({
  /** Replicas the Deployment wants */
  desiredReplicas: typebox.Type.Number(),
  /** Replicas already on the new template */
  updatedReplicas: typebox.Type.Number(),
  /** Replicas reporting ready */
  readyReplicas: typebox.Type.Number()
});
var ComputeOperationProgressSchema = typebox.Type.Object({
  /** The pre-sync hook, when the mutation gated on one */
  preSync: typebox.Type.Optional(ComputeOperationPreSyncProgressSchema),
  /** The rollout, once it started */
  deployment: typebox.Type.Optional(ComputeOperationDeploymentProgressSchema)
});
var ComputeOperationSchema = typebox.Type.Object({
  /** The operation id (full UUID) */
  operationId: typebox.Type.String(),
  /** The workload the operation mutates (full UUID) */
  workloadId: typebox.Type.String(),
  /** What kind of mutation this is */
  type: ComputeOperationTypeSchema,
  /** Overall state */
  status: ComputeOperationStatusSchema,
  /** Where the reconciler currently is */
  phase: ComputeOperationPhaseSchema,
  /** Progress detail */
  progress: ComputeOperationProgressSchema,
  /** Explanation of a non-succeeded outcome */
  reason: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 creation timestamp */
  createdAt: typebox.Type.String(),
  /** ISO-8601 last-update timestamp */
  updatedAt: typebox.Type.String()
});
var ComputeWorkloadRevisionCauseSchema = typebox.Type.Union([
  typebox.Type.Literal("created"),
  typebox.Type.Literal("update"),
  typebox.Type.Literal("rollback")
]);
var ComputeWorkloadRevisionSchema = typebox.Type.Object({
  /** The revision ordinal, 1-based and monotonic per workload */
  revision: typebox.Type.Number(),
  /** The container image this revision was recorded with */
  image: typebox.Type.String(),
  /** The slot tier, absent on a row recorded before the field existed */
  slotTier: typebox.Type.Optional(ComputeSlotTierSchema),
  /** Why the revision exists — `created`, `update` or `rollback` */
  cause: ComputeWorkloadRevisionCauseSchema,
  /** At most one revision per workload is active */
  isActive: typebox.Type.Boolean(),
  /** The ordinal a rollback restored from; present only on a rollback revision */
  rolledBackFrom: typebox.Type.Optional(typebox.Type.Number()),
  /** The operation carrying this revision to the cluster (full UUID), when there is one */
  operationId: typebox.Type.Optional(typebox.Type.String()),
  /** The operation's verdict; ABSENT when the revision names no operation */
  outcome: typebox.Type.Optional(ComputeOperationStatusSchema),
  /** The operation's explanation of a non-succeeded outcome */
  outcomeReason: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 creation timestamp */
  createdAt: typebox.Type.String()
});
var ComputeWorkloadRevisionListSchema = typebox.Type.Object({
  /** One page of revisions, newest ordinal first */
  revisions: typebox.Type.Array(ComputeWorkloadRevisionSchema),
  /** Opaque cursor for the next page; absent on the last page */
  nextCursor: typebox.Type.Optional(typebox.Type.String())
});
var ComputeDeploymentEventObjectSchema = typebox.Type.Object({
  /** The Kubernetes kind */
  kind: typebox.Type.String(),
  /** The object's name */
  name: typebox.Type.String()
});
var ComputeDeploymentEventSchema = typebox.Type.Object({
  /** The event object's own name, stable for the life of the event */
  name: typebox.Type.String(),
  /** `Normal` or `Warning` in practice, but free-form on the wire */
  type: typebox.Type.String(),
  /** The machine-readable reason, e.g. `Scheduled`, `BackOff` */
  reason: typebox.Type.String(),
  /** The human-readable message; may be empty */
  message: typebox.Type.String(),
  /** How many times the event has recurred; 1 for a single occurrence */
  count: typebox.Type.Number(),
  /** The object the event is about */
  object: ComputeDeploymentEventObjectSchema,
  /** The controller that reported it — kubelet, deployment-controller, … */
  source: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 timestamp of the first occurrence */
  firstSeen: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 timestamp of the most recent occurrence */
  lastSeen: typebox.Type.Optional(typebox.Type.String())
});
var ComputeWorkloadDeploymentEventsSchema = typebox.Type.Object({
  /** The workload the events belong to (full UUID) */
  workloadId: typebox.Type.String(),
  /** The cluster's recent events, most recently seen first; possibly empty */
  events: typebox.Type.Array(ComputeDeploymentEventSchema)
});
var ComputeRegistrySchema = typebox.Type.Object({
  /** The registry id (full UUID) */
  registryId: typebox.Type.String(),
  /** Human label */
  name: typebox.Type.String(),
  /** Registry host as a container runtime addresses it, e.g. `ghcr.io` */
  serverUrl: typebox.Type.String(),
  /** The robot account the pull credential belongs to */
  username: typebox.Type.String(),
  /** Whether this is the tenant's default registry */
  isDefault: typebox.Type.Boolean(),
  /** ISO-8601 creation timestamp */
  createdAt: typebox.Type.String(),
  /** ISO-8601 last-update timestamp — the rotation timestamp after a rotate */
  updatedAt: typebox.Type.String()
});
var ComputeRegistrySynthesisStateSchema = typebox.Type.Union([
  typebox.Type.Literal("pending"),
  typebox.Type.Literal("synthesized"),
  typebox.Type.Literal("failed")
]);
var ComputeRegistryDetailSchema = typebox.Type.Object({
  ...ComputeRegistrySchema.properties,
  /** Whether the reconciler turned the credential into a pull Secret */
  synthesisStatus: ComputeRegistrySynthesisStateSchema,
  /** The reconciler's explanation of a failed synthesis — never credential material */
  synthesisReason: typebox.Type.Optional(typebox.Type.String()),
  /** ISO-8601 timestamp of the synthesis report */
  synthesisAt: typebox.Type.Optional(typebox.Type.String())
});
var ComputeRegistryListResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  registries: typebox.Type.Array(ComputeRegistrySchema)
});
var ComputeRegistryDetailResponseSchema = typebox.Type.Object({
  success: typebox.Type.Literal(true),
  registry: ComputeRegistryDetailSchema
});

// src/commands/compute/compute-domain.attach.ts
init_not_found();
init_parse_response_helper();
var ComputeDomainAttachCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeDomainSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeDomainDetachCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeNoContentSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Domain", {
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
var ComputeDomainListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeDomainListResponseSchema, rawResponse).domains;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeDomainVerifyCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeDomainVerifyResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Domain", {
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
var ComputeOperationFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeOperationSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Operation", {
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
var ComputeRegistryFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeRegistryDetailResponseSchema, rawResponse).registry;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Registry", {
        registryId: this.input.registryId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-registry.list.ts
init_command();
init_parse_response_helper();
var ComputeRegistryListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeRegistryListResponseSchema, rawResponse).registries;
  }
};

// src/commands/compute/compute-registry.register.ts
init_command();
init_parse_response_helper();
var ComputeRegistryRegisterCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeRegistrySchema, rawResponse);
  }
};

// src/commands/compute/compute-registry.remove.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeRegistryRemoveCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeNoContentSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Registry", {
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
var ComputeRegistryRotateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeRegistrySchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Registry", {
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
var ComputeWorkloadEventsListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadDeploymentEventsSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeWorkloadLogsFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadLogsSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
      throw new exports.NotFoundException("Workload", {
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
    const subject = new rxjs.Subject();
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
      subject.next(exports.parseResponseHelper(ComputeLogStreamEventSchema, JSON.parse(frame.data)));
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
    const output$ = new rxjs.Observable((subscriber) => {
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
var ComputeWorkloadRevisionsListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadRevisionListSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeWorkloadRunsListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadRunListSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-workload.create.ts
init_command();
init_parse_response_helper();
var ComputeWorkloadCreateCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadResponseSchema, rawResponse).workload;
  }
};

// src/commands/compute/compute-workload.create-tracked.ts
init_command();
init_parse_response_helper();
var ComputeWorkloadCreateTrackedCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadCreateResponseSchema, rawResponse);
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
      if (!(error instanceof exports.NotFoundException)) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  throw new exports.CommandError(
    commandName,
    lastSeen ? `Operation ${operationId} did not reach a terminal state within ${timeoutMs}ms (last observed status "${lastSeen.status}", phase "${lastSeen.phase}")` : `Operation ${operationId} did not appear within ${timeoutMs}ms \u2014 the reconciler filed no progress report`
  );
}

// src/commands/compute/compute-workload.delete.ts
var ComputeWorkloadDeleteCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadDeleteResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeWorkloadFetchCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadResponseSchema, rawResponse).workload;
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
        workloadId: this.input.workloadId
      });
    }
    throw error;
  }
};

// src/commands/compute/compute-workload.list.ts
init_command();
init_parse_response_helper();
var ComputeWorkloadListCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadListResponseSchema, rawResponse).workloads;
  }
};

// src/commands/compute/compute-workload.pause.ts
init_command();
init_not_found();
init_parse_response_helper();
var ComputeWorkloadPauseCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeWorkloadResumeCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeWorkloadRollbackCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeWorkloadRunCommand = class extends exports.Command {
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
    return exports.parseResponseHelper(ComputeWorkloadRunResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
var ComputeWorkloadUpdateCommand = class extends exports.Command {
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
      throw new exports.CommandError(this.constructor.name, "No fields to update");
    }
    return payload;
  }
  /**
   * Parse the response
   */
  parseResponse(rawResponse) {
    return exports.parseResponseHelper(ComputeWorkloadMutationResponseSchema, rawResponse);
  }
  /**
   * Handle the client error
   */
  handleClientError(error) {
    if (error.status === 404) {
      throw new exports.NotFoundException("Workload", {
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
      throw new exports.CommandError(command.constructor.name, `Not allowed in "${this.mode}" mode`);
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
var WebSocketConstructor = globalThis.WebSocket ?? ws.WebSocket;
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
      } else if (buffer.Buffer.isBuffer(event.data)) {
        parsedData = event.data.toString();
      } else if (Array.isArray(event.data)) {
        parsedData = buffer.Buffer.concat(event.data).toString();
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
var WebSocketConstructor2 = globalThis.WebSocket ?? ws.WebSocket;
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
  internalSubject = new rxjs.Subject();
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
        } else if (buffer.Buffer.isBuffer(event.data)) {
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

exports.ApiKeyCreateCommand = ApiKeyCreateCommand;
exports.ApiKeyDeleteCommand = ApiKeyDeleteCommand;
exports.ApiKeyEditCommand = ApiKeyEditCommand;
exports.ApiKeyFetchCommand = ApiKeyFetchCommand;
exports.ApiKeyListCommand = ApiKeyListCommand;
exports.ApiKeyValidateCommand = ApiKeyValidateCommand;
exports.ApiKeyValidateWithTenantIdCommand = ApiKeyValidateWithTenantIdCommand;
exports.ArchivePolicyResponseSchema = ArchivePolicyResponseSchema;
exports.ArchiveRoleResponseSchema = ArchiveRoleResponseSchema;
exports.ArtifactGetCommand = ArtifactGetCommand;
exports.AuditLogEntrySchema = AuditLogEntrySchema;
exports.AuditLogResponseSchema = AuditLogResponseSchema;
exports.AwsMarketplaceCustomerResolveCommand = AwsMarketplaceCustomerResolveCommand;
exports.AwsMarketplaceLinkCreateCommand = AwsMarketplaceLinkCreateCommand;
exports.AwsMarketplaceLinkDeleteCommand = AwsMarketplaceLinkDeleteCommand;
exports.AwsMarketplaceLinkFetchCommand = AwsMarketplaceLinkFetchCommand;
exports.AwsMarketplaceLinkListCommand = AwsMarketplaceLinkListCommand;
exports.ClientError = ClientError;
exports.ComputeDeploymentEventObjectSchema = ComputeDeploymentEventObjectSchema;
exports.ComputeDeploymentEventSchema = ComputeDeploymentEventSchema;
exports.ComputeDomainAttachCommand = ComputeDomainAttachCommand;
exports.ComputeDomainDetachCommand = ComputeDomainDetachCommand;
exports.ComputeDomainListCommand = ComputeDomainListCommand;
exports.ComputeDomainListResponseSchema = ComputeDomainListResponseSchema;
exports.ComputeDomainSchema = ComputeDomainSchema;
exports.ComputeDomainStatusSchema = ComputeDomainStatusSchema;
exports.ComputeDomainTlsSchema = ComputeDomainTlsSchema;
exports.ComputeDomainTlsStatusSchema = ComputeDomainTlsStatusSchema;
exports.ComputeDomainVerificationSchema = ComputeDomainVerificationSchema;
exports.ComputeDomainVerificationTypeSchema = ComputeDomainVerificationTypeSchema;
exports.ComputeDomainVerifyCommand = ComputeDomainVerifyCommand;
exports.ComputeDomainVerifyResponseSchema = ComputeDomainVerifyResponseSchema;
exports.ComputeLogEntrySchema = ComputeLogEntrySchema;
exports.ComputeLogStreamEventSchema = ComputeLogStreamEventSchema;
exports.ComputeLogStreamNameSchema = ComputeLogStreamNameSchema;
exports.ComputeNoContentSchema = ComputeNoContentSchema;
exports.ComputeOperationDeploymentProgressSchema = ComputeOperationDeploymentProgressSchema;
exports.ComputeOperationFetchCommand = ComputeOperationFetchCommand;
exports.ComputeOperationPhaseSchema = ComputeOperationPhaseSchema;
exports.ComputeOperationPreSyncProgressSchema = ComputeOperationPreSyncProgressSchema;
exports.ComputeOperationProgressSchema = ComputeOperationProgressSchema;
exports.ComputeOperationSchema = ComputeOperationSchema;
exports.ComputeOperationStatusSchema = ComputeOperationStatusSchema;
exports.ComputeOperationStepStatusSchema = ComputeOperationStepStatusSchema;
exports.ComputeOperationTypeSchema = ComputeOperationTypeSchema;
exports.ComputePreSyncSpecSchema = ComputePreSyncSpecSchema;
exports.ComputeProbeExecSchema = ComputeProbeExecSchema;
exports.ComputeProbeHttpGetSchema = ComputeProbeHttpGetSchema;
exports.ComputeProbeSchema = ComputeProbeSchema;
exports.ComputeProbeTcpSocketSchema = ComputeProbeTcpSocketSchema;
exports.ComputeRegistryDetailResponseSchema = ComputeRegistryDetailResponseSchema;
exports.ComputeRegistryDetailSchema = ComputeRegistryDetailSchema;
exports.ComputeRegistryFetchCommand = ComputeRegistryFetchCommand;
exports.ComputeRegistryListCommand = ComputeRegistryListCommand;
exports.ComputeRegistryListResponseSchema = ComputeRegistryListResponseSchema;
exports.ComputeRegistryRegisterCommand = ComputeRegistryRegisterCommand;
exports.ComputeRegistryRemoveCommand = ComputeRegistryRemoveCommand;
exports.ComputeRegistryRotateCommand = ComputeRegistryRotateCommand;
exports.ComputeRegistrySchema = ComputeRegistrySchema;
exports.ComputeRegistrySynthesisStateSchema = ComputeRegistrySynthesisStateSchema;
exports.ComputeSlotTierSchema = ComputeSlotTierSchema;
exports.ComputeWorkloadCreateCommand = ComputeWorkloadCreateCommand;
exports.ComputeWorkloadCreateResponseSchema = ComputeWorkloadCreateResponseSchema;
exports.ComputeWorkloadCreateTrackedCommand = ComputeWorkloadCreateTrackedCommand;
exports.ComputeWorkloadDefinitionSchema = ComputeWorkloadDefinitionSchema;
exports.ComputeWorkloadDeleteCommand = ComputeWorkloadDeleteCommand;
exports.ComputeWorkloadDeleteResponseSchema = ComputeWorkloadDeleteResponseSchema;
exports.ComputeWorkloadDeploymentEventsSchema = ComputeWorkloadDeploymentEventsSchema;
exports.ComputeWorkloadEnvVarSchema = ComputeWorkloadEnvVarSchema;
exports.ComputeWorkloadEventsListCommand = ComputeWorkloadEventsListCommand;
exports.ComputeWorkloadFetchCommand = ComputeWorkloadFetchCommand;
exports.ComputeWorkloadKindSchema = ComputeWorkloadKindSchema;
exports.ComputeWorkloadListCommand = ComputeWorkloadListCommand;
exports.ComputeWorkloadListResponseSchema = ComputeWorkloadListResponseSchema;
exports.ComputeWorkloadLogStreamCommand = ComputeWorkloadLogStreamCommand;
exports.ComputeWorkloadLogsFetchCommand = ComputeWorkloadLogsFetchCommand;
exports.ComputeWorkloadLogsSchema = ComputeWorkloadLogsSchema;
exports.ComputeWorkloadMutationResponseSchema = ComputeWorkloadMutationResponseSchema;
exports.ComputeWorkloadPauseCommand = ComputeWorkloadPauseCommand;
exports.ComputeWorkloadProbesSchema = ComputeWorkloadProbesSchema;
exports.ComputeWorkloadResponseSchema = ComputeWorkloadResponseSchema;
exports.ComputeWorkloadResumeCommand = ComputeWorkloadResumeCommand;
exports.ComputeWorkloadRevisionCauseSchema = ComputeWorkloadRevisionCauseSchema;
exports.ComputeWorkloadRevisionListSchema = ComputeWorkloadRevisionListSchema;
exports.ComputeWorkloadRevisionSchema = ComputeWorkloadRevisionSchema;
exports.ComputeWorkloadRevisionsListCommand = ComputeWorkloadRevisionsListCommand;
exports.ComputeWorkloadRollbackCommand = ComputeWorkloadRollbackCommand;
exports.ComputeWorkloadRunCommand = ComputeWorkloadRunCommand;
exports.ComputeWorkloadRunKindSchema = ComputeWorkloadRunKindSchema;
exports.ComputeWorkloadRunListSchema = ComputeWorkloadRunListSchema;
exports.ComputeWorkloadRunResponseSchema = ComputeWorkloadRunResponseSchema;
exports.ComputeWorkloadRunSchema = ComputeWorkloadRunSchema;
exports.ComputeWorkloadRunStatusSchema = ComputeWorkloadRunStatusSchema;
exports.ComputeWorkloadRunsListCommand = ComputeWorkloadRunsListCommand;
exports.ComputeWorkloadScalingModeSchema = ComputeWorkloadScalingModeSchema;
exports.ComputeWorkloadScalingSchema = ComputeWorkloadScalingSchema;
exports.ComputeWorkloadSchema = ComputeWorkloadSchema;
exports.ComputeWorkloadSecretRefSchema = ComputeWorkloadSecretRefSchema;
exports.ComputeWorkloadStatusSchema = ComputeWorkloadStatusSchema;
exports.ComputeWorkloadUpdateCommand = ComputeWorkloadUpdateCommand;
exports.ComputeWorkloadVolumeSchema = ComputeWorkloadVolumeSchema;
exports.ContainerRegistListCommand = ContainerRegistListCommand;
exports.ContainerRegistryCreateCommand = ContainerRegistryCreateCommand;
exports.ContainerRegistryDeleteCommand = ContainerRegistryDeleteCommand;
exports.ContainerRegistryFetchCommand = ContainerRegistryFetchCommand;
exports.ContainerRegistryUpdateCommand = ContainerRegistryUpdateCommand;
exports.ContextAddItemCommand = ContextAddItemCommand;
exports.ContextRemoveItemCommand = ContextRemoveItemCommand;
exports.ConversationDeleteCommand = ConversationDeleteCommand;
exports.ConversationGetCommand = ConversationGetCommand;
exports.ConversationListCommand = ConversationListCommand;
exports.ConversationStreamCommand = ConversationStreamCommand;
exports.CustomCommand = CustomCommand;
exports.DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS = DEFAULT_COMPUTE_OPERATION_POLL_INTERVAL_MS;
exports.DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS = DEFAULT_COMPUTE_OPERATION_TIMEOUT_MS;
exports.DataCoreCreateCommand = DataCoreCreateCommand;
exports.DataCoreExistsCommand = DataCoreExistsCommand;
exports.DataCoreFetchCommand = DataCoreFetchCommand;
exports.DataCoreListCommand = DataCoreListCommand;
exports.DataCoreRequestDeleteCommand = DataCoreRequestDeleteCommand;
exports.DataCoreUpdateCommand = DataCoreUpdateCommand;
exports.DataPathwayAssignmentCompleteCommand = DataPathwayAssignmentCompleteCommand;
exports.DataPathwayAssignmentExpireLeasesCommand = DataPathwayAssignmentExpireLeasesCommand;
exports.DataPathwayAssignmentFetchCommand = DataPathwayAssignmentFetchCommand;
exports.DataPathwayAssignmentHeartbeatCommand = DataPathwayAssignmentHeartbeatCommand;
exports.DataPathwayAssignmentListCommand = DataPathwayAssignmentListCommand;
exports.DataPathwayAssignmentNextCommand = DataPathwayAssignmentNextCommand;
exports.DataPathwayCapacityFetchCommand = DataPathwayCapacityFetchCommand;
exports.DataPathwayCommandDispatchConfigUpdateCommand = DataPathwayCommandDispatchConfigUpdateCommand;
exports.DataPathwayCommandDispatchPauseCommand = DataPathwayCommandDispatchPauseCommand;
exports.DataPathwayCommandDispatchRestartCommand = DataPathwayCommandDispatchRestartCommand;
exports.DataPathwayCommandDispatchResumeCommand = DataPathwayCommandDispatchResumeCommand;
exports.DataPathwayCommandDispatchStopCommand = DataPathwayCommandDispatchStopCommand;
exports.DataPathwayCommandFetchCommand = DataPathwayCommandFetchCommand;
exports.DataPathwayCommandPendingByPathwayCommand = DataPathwayCommandPendingByPathwayCommand;
exports.DataPathwayCommandPendingCommand = DataPathwayCommandPendingCommand;
exports.DataPathwayCommandUpdateStatusByPathwayCommand = DataPathwayCommandUpdateStatusByPathwayCommand;
exports.DataPathwayCommandUpdateStatusCommand = DataPathwayCommandUpdateStatusCommand;
exports.DataPathwayCreateCommand = DataPathwayCreateCommand;
exports.DataPathwayDeleteCommand = DataPathwayDeleteCommand;
exports.DataPathwayDeliveryLogBatchCommand = DataPathwayDeliveryLogBatchCommand;
exports.DataPathwayDeliveryLogListCommand = DataPathwayDeliveryLogListCommand;
exports.DataPathwayDisableCommand = DataPathwayDisableCommand;
exports.DataPathwayFetchByNameCommand = DataPathwayFetchByNameCommand;
exports.DataPathwayFetchCommand = DataPathwayFetchCommand;
exports.DataPathwayHealthCheckCommand = DataPathwayHealthCheckCommand;
exports.DataPathwayListCommand = DataPathwayListCommand;
exports.DataPathwayMetricsFetchCommand = DataPathwayMetricsFetchCommand;
exports.DataPathwayPumpStateFetchBySourceCommand = DataPathwayPumpStateFetchBySourceCommand;
exports.DataPathwayPumpStateFetchCommand = DataPathwayPumpStateFetchCommand;
exports.DataPathwayPumpStateSaveBySourceCommand = DataPathwayPumpStateSaveBySourceCommand;
exports.DataPathwayPumpStateSaveCommand = DataPathwayPumpStateSaveCommand;
exports.DataPathwayQuotaFetchCommand = DataPathwayQuotaFetchCommand;
exports.DataPathwayQuotaListCommand = DataPathwayQuotaListCommand;
exports.DataPathwayQuotaSetCommand = DataPathwayQuotaSetCommand;
exports.DataPathwayRestartFetchCommand = DataPathwayRestartFetchCommand;
exports.DataPathwayRestartRequestCommand = DataPathwayRestartRequestCommand;
exports.DataPathwaySlotDeregisterCommand = DataPathwaySlotDeregisterCommand;
exports.DataPathwaySlotFetchCommand = DataPathwaySlotFetchCommand;
exports.DataPathwaySlotHeartbeatCommand = DataPathwaySlotHeartbeatCommand;
exports.DataPathwaySlotListCommand = DataPathwaySlotListCommand;
exports.DataPathwaySlotRegisterCommand = DataPathwaySlotRegisterCommand;
exports.DataPathwayUpsertByNameCommand = DataPathwayUpsertByNameCommand;
exports.DataPathwayUpsertByNameResponseSchema = DataPathwayUpsertByNameResponseSchema;
exports.EntitlementResponseSchema = EntitlementResponseSchema;
exports.EventListCommand = EventListCommand;
exports.EventTypeCreateCommand = EventTypeCreateCommand;
exports.EventTypeExistsCommand = EventTypeExistsCommand;
exports.EventTypeFetchCommand = EventTypeFetchCommand;
exports.EventTypeInfoCommand = EventTypeInfoCommand;
exports.EventTypeListCommand = EventTypeListCommand;
exports.EventTypeListRemovedSensitiveDataCommand = EventTypeListRemovedSensitiveDataCommand;
exports.EventTypeRemoveSensitiveDataCommand = EventTypeRemoveSensitiveDataCommand;
exports.EventTypeRequestDeleteCommand = EventTypeRequestDeleteCommand;
exports.EventTypeRequestTruncateCommand = EventTypeRequestTruncateCommand;
exports.EventTypeUpdateCommand = EventTypeUpdateCommand;
exports.EventsFetchCommand = EventsFetchCommand;
exports.EventsFetchTimeBucketsByNamesCommand = EventsFetchTimeBucketsByNamesCommand;
exports.FetchPumpStatusCommand = FetchPumpStatusCommand;
exports.FlowTypeCreateCommand = FlowTypeCreateCommand;
exports.FlowTypeExistsCommand = FlowTypeExistsCommand;
exports.FlowTypeFetchCommand = FlowTypeFetchCommand;
exports.FlowTypeListCommand = FlowTypeListCommand;
exports.FlowTypeRequestDeleteCommand = FlowTypeRequestDeleteCommand;
exports.FlowTypeUpdateCommand = FlowTypeUpdateCommand;
exports.FlowcoreClient = FlowcoreClient;
exports.IngestBatchCommand = IngestBatchCommand;
exports.IngestEventCommand = IngestEventCommand;
exports.KeyPoliciesCommand = KeyPoliciesCommand;
exports.KeyPolicyLinkSchema = KeyPolicyLinkSchema;
exports.KeyRoleLinkSchema = KeyRoleLinkSchema;
exports.KeyRolesCommand = KeyRolesCommand;
exports.LinkKeyPolicyCommand = LinkKeyPolicyCommand;
exports.LinkKeyRoleCommand = LinkKeyRoleCommand;
exports.LinkRolePolicyCommand = LinkRolePolicyCommand;
exports.LinkUserPolicyCommand = LinkUserPolicyCommand;
exports.LinkUserRoleCommand = LinkUserRoleCommand;
exports.NotificationClient = NotificationClient;
exports.OrganizationPoliciesCommand = OrganizationPoliciesCommand;
exports.OrganizationRolesCommand = OrganizationRolesCommand;
exports.PaginationSchema = PaginationSchema;
exports.PermissionsListCommand = PermissionsListCommand;
exports.PolicyArchiveCommand = PolicyArchiveCommand;
exports.PolicyAssociationsCommand = PolicyAssociationsCommand;
exports.PolicyAssociationsSchema = PolicyAssociationsSchema;
exports.PolicyCreateCommand = PolicyCreateCommand;
exports.PolicyFilterSchema = PolicyFilterSchema;
exports.PolicyFilterValueSchema = PolicyFilterValueSchema;
exports.PolicyGetCommand = PolicyGetCommand;
exports.PolicyKeyAssociationSchema = PolicyKeyAssociationSchema;
exports.PolicyListCommand = PolicyListCommand;
exports.PolicyRoleAssociationSchema = PolicyRoleAssociationSchema;
exports.PolicySchema = PolicySchema;
exports.PolicyStatementSchema = PolicyStatementSchema;
exports.PolicyUpdateCommand = PolicyUpdateCommand;
exports.PolicyUserAssociationSchema = PolicyUserAssociationSchema;
exports.PolicyValidateCommand = PolicyValidateCommand;
exports.PolicyValidateResponseSchema = PolicyValidateResponseSchema;
exports.ResolveKeyEntitlementsCommand = ResolveKeyEntitlementsCommand;
exports.ResolveUserEntitlementsCommand = ResolveUserEntitlementsCommand;
exports.RoleArchiveCommand = RoleArchiveCommand;
exports.RoleAssociationsCommand = RoleAssociationsCommand;
exports.RoleAssociationsSchema = RoleAssociationsSchema;
exports.RoleCreateCommand = RoleCreateCommand;
exports.RoleGetCommand = RoleGetCommand;
exports.RoleKeyAssociationSchema = RoleKeyAssociationSchema;
exports.RoleListCommand = RoleListCommand;
exports.RolePoliciesCommand = RolePoliciesCommand;
exports.RolePolicyLinkSchema = RolePolicyLinkSchema;
exports.RoleSchema = RoleSchema;
exports.RoleUpdateCommand = RoleUpdateCommand;
exports.RoleUserAssociationSchema = RoleUserAssociationSchema;
exports.SecretCreateCommand = SecretCreateCommand;
exports.SecretDeleteCommand = SecretDeleteCommand;
exports.SecretEditCommand = SecretEditCommand;
exports.SecretFetchCommand = SecretFetchCommand;
exports.SecretListCommand = SecretListCommand;
exports.SecurityCreatePATCommand = SecurityCreatePATCommand;
exports.SecurityDeletePATCommand = SecurityDeletePATCommand;
exports.SecurityExchangePATCommand = SecurityExchangePATCommand;
exports.SecurityGetPATCommand = SecurityGetPATCommand;
exports.SecurityListPATCommand = SecurityListPATCommand;
exports.SendPumpPulseCommand = SendPumpPulseCommand;
exports.ServiceAccountCreateCommand = ServiceAccountCreateCommand;
exports.ServiceAccountDeleteCommand = ServiceAccountDeleteCommand;
exports.ServiceAccountEditCommand = ServiceAccountEditCommand;
exports.ServiceAccountFetchCommand = ServiceAccountFetchCommand;
exports.ServiceAccountListCommand = ServiceAccountListCommand;
exports.ServiceAccountRotateSecretCommand = ServiceAccountRotateSecretCommand;
exports.TenantAuditLogsCommand = TenantAuditLogsCommand;
exports.TenantCreateCommand = TenantCreateCommand;
exports.TenantDisableSensitiveDataCommand = TenantDisableSensitiveDataCommand;
exports.TenantEnableSensitiveDataCommand = TenantEnableSensitiveDataCommand;
exports.TenantFetchCommand = TenantFetchCommand;
exports.TenantListCommand = TenantListCommand;
exports.TenantPreviewCommand = TenantPreviewCommand;
exports.TenantTranslateNameToIdCommand = TenantTranslateNameToIdCommand;
exports.TenantTranslateNameToIdSchema = TenantTranslateNameToIdSchema;
exports.TenantUpdateCommand = TenantUpdateCommand;
exports.TenantUserAddCommand = TenantUserAddCommand;
exports.TenantUserListCommand = TenantUserListCommand;
exports.TenantUserRemoveCommand = TenantUserRemoveCommand;
exports.TimeBucketListCommand = TimeBucketListCommand;
exports.UnlinkKeyPolicyCommand = UnlinkKeyPolicyCommand;
exports.UnlinkKeyRoleCommand = UnlinkKeyRoleCommand;
exports.UnlinkRolePolicyCommand = UnlinkRolePolicyCommand;
exports.UnlinkUserPolicyCommand = UnlinkUserPolicyCommand;
exports.UnlinkUserRoleCommand = UnlinkUserRoleCommand;
exports.UserDeleteCommand = UserDeleteCommand;
exports.UserInitializeInKeycloakCommand = UserInitializeInKeycloakCommand;
exports.UserInviteToTenantCommand = UserInviteToTenantCommand;
exports.UserPermissionSchema = UserPermissionSchema;
exports.UserPermissionsCommand = UserPermissionsCommand;
exports.UserPoliciesCommand = UserPoliciesCommand;
exports.UserPolicyLinkSchema = UserPolicyLinkSchema;
exports.UserRoleLinkSchema = UserRoleLinkSchema;
exports.UserRolesCommand = UserRolesCommand;
exports.ValidPolicySchema = ValidPolicySchema;
exports.ValidateKeyCommand = ValidateKeyCommand;
exports.ValidateUserCommand = ValidateUserCommand;
exports.ValidationResponseSchema = ValidationResponseSchema;
exports.VariableCreateCommand = VariableCreateCommand;
exports.VariableDeleteCommand = VariableDeleteCommand;
exports.VariableEditCommand = VariableEditCommand;
exports.VariableFetchCommand = VariableFetchCommand;
exports.VariableListCommand = VariableListCommand;
exports.WebSocketClient = WebSocketClient;
exports.isEncryptedPayload = isEncryptedPayload;
exports.matchesPolicyFilters = matchesPolicyFilters;
exports.parseEntitlementResponse = parseEntitlementResponse;
exports.permitsPayload = permitsPayload;
exports.waitForComputeOperation = waitForComputeOperation;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map