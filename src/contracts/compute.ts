import {
  type Static,
  type TArray,
  type TBoolean,
  type TLiteral,
  type TNull,
  type TNumber,
  type TObject,
  type TOptional,
  type TRecord,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

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

// ── Shared ──

type TStringRecord = TRecord<TString, TString>

/**
 * The body of a compute endpoint that answers `204 No Content`
 * (domain detach, registry remove).
 *
 * `FlowcoreClient` substitutes `{ status: 204 }` for an empty body, so that
 * synthetic object — not `undefined` — is what reaches `parseResponse`.
 */
export type TComputeNoContent = TObject<{ status: TNumber }>
export const ComputeNoContentSchema: TComputeNoContent = Type.Object({
  /** The HTTP status the service answered with (always 204) */
  status: Type.Number(),
})
export type ComputeNoContent = Static<typeof ComputeNoContentSchema>

// ── Workloads ──

/** Lifecycle state of a workload. A paused workload reports `stopped`. */
export type TComputeWorkloadStatus = TUnion<
  [TLiteral<"pending">, TLiteral<"running">, TLiteral<"stopped">, TLiteral<"failed">, TLiteral<"archived">]
>
export const ComputeWorkloadStatusSchema: TComputeWorkloadStatus = Type.Union([
  Type.Literal("pending"),
  Type.Literal("running"),
  Type.Literal("stopped"),
  Type.Literal("failed"),
  Type.Literal("archived"),
])
export type ComputeWorkloadStatus = Static<typeof ComputeWorkloadStatusSchema>

/** What a workload IS — a long-running service, or a run-to-completion task. Immutable after create. */
export type TComputeWorkloadKind = TUnion<[TLiteral<"service">, TLiteral<"job">]>
export const ComputeWorkloadKindSchema: TComputeWorkloadKind = Type.Union([
  Type.Literal("service"),
  Type.Literal("job"),
])
export type ComputeWorkloadKind = Static<typeof ComputeWorkloadKindSchema>

/** Standardized compute slot tiers. */
export type TComputeSlotTier = TUnion<
  [TLiteral<"nano">, TLiteral<"micro">, TLiteral<"small">, TLiteral<"medium">, TLiteral<"large">]
>
export const ComputeSlotTierSchema: TComputeSlotTier = Type.Union([
  Type.Literal("nano"),
  Type.Literal("micro"),
  Type.Literal("small"),
  Type.Literal("medium"),
  Type.Literal("large"),
])
export type ComputeSlotTier = Static<typeof ComputeSlotTierSchema>

/** Probe handler: HTTP GET. */
export type TComputeProbeHttpGet = TObject<{
  path: TOptional<TString>
  port: TNumber
  headers: TOptional<TStringRecord>
}>
export const ComputeProbeHttpGetSchema: TComputeProbeHttpGet = Type.Object({
  /** Request path (defaults to `/` server-side) */
  path: Type.Optional(Type.String()),
  /** Container port to probe */
  port: Type.Number(),
  /** Extra request headers */
  headers: Type.Optional(Type.Record(Type.String(), Type.String())),
})
export type ComputeProbeHttpGet = Static<typeof ComputeProbeHttpGetSchema>

/** Probe handler: TCP socket — the safe default handler. */
export type TComputeProbeTcpSocket = TObject<{ port: TNumber }>
export const ComputeProbeTcpSocketSchema: TComputeProbeTcpSocket = Type.Object({
  /** Container port to dial */
  port: Type.Number(),
})
export type ComputeProbeTcpSocket = Static<typeof ComputeProbeTcpSocketSchema>

/** Probe handler: exec. */
export type TComputeProbeExec = TObject<{ command: TArray<TString> }>
export const ComputeProbeExecSchema: TComputeProbeExec = Type.Object({
  /** Command and arguments to run inside the container */
  command: Type.Array(Type.String()),
})
export type ComputeProbeExec = Static<typeof ComputeProbeExecSchema>

/**
 * One probe. Handler resolution order server-side is `httpGet`, then `exec`,
 * then `tcpSocket`; with none given the fallback is a TCP dial of the
 * workload's container port.
 */
export type TComputeProbe = TObject<{
  httpGet: TOptional<TComputeProbeHttpGet>
  tcpSocket: TOptional<TComputeProbeTcpSocket>
  exec: TOptional<TComputeProbeExec>
  initialDelaySeconds: TOptional<TNumber>
  periodSeconds: TOptional<TNumber>
  timeoutSeconds: TOptional<TNumber>
  failureThreshold: TOptional<TNumber>
}>
export const ComputeProbeSchema: TComputeProbe = Type.Object({
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
  failureThreshold: Type.Optional(Type.Number()),
})
export type ComputeProbe = Static<typeof ComputeProbeSchema>

/** The tri-probe specification of a workload. */
export type TComputeWorkloadProbes = TObject<{
  startup: TOptional<TComputeProbe>
  readiness: TOptional<TComputeProbe>
  liveness: TOptional<TComputeProbe>
}>
export const ComputeWorkloadProbesSchema: TComputeWorkloadProbes = Type.Object({
  /** Startup probe */
  startup: Type.Optional(ComputeProbeSchema),
  /** Readiness probe */
  readiness: Type.Optional(ComputeProbeSchema),
  /** Liveness probe */
  liveness: Type.Optional(ComputeProbeSchema),
})
export type ComputeWorkloadProbes = Static<typeof ComputeWorkloadProbesSchema>

/** The pre-sync hook — a Job that must exit 0 before any pod is created. */
export type TComputePreSyncSpec = TObject<{
  name: TOptional<TString>
  image: TString
  command: TArray<TString>
  timeoutSeconds: TOptional<TNumber>
}>
export const ComputePreSyncSpecSchema: TComputePreSyncSpec = Type.Object({
  /** Label reported as `progress.preSync.name` (defaults to `pre-sync`) */
  name: Type.Optional(Type.String()),
  /** Image the hook runs */
  image: Type.String(),
  /** Command and arguments the hook runs */
  command: Type.Array(Type.String()),
  /** Deadline for the hook (defaults to 300 server-side) */
  timeoutSeconds: Type.Optional(Type.Number()),
})
export type ComputePreSyncSpec = Static<typeof ComputePreSyncSpecSchema>

/**
 * How the replica count is decided. `manual` — the definition's `replicas` is
 * the count. `hpa` — a HorizontalPodAutoscaler owns it between
 * `minReplicas` and `maxReplicas`.
 */
export type TComputeWorkloadScalingMode = TUnion<[TLiteral<"manual">, TLiteral<"hpa">]>
export const ComputeWorkloadScalingModeSchema: TComputeWorkloadScalingMode = Type.Union([
  Type.Literal("manual"),
  Type.Literal("hpa"),
])
export type ComputeWorkloadScalingMode = Static<typeof ComputeWorkloadScalingModeSchema>

/**
 * The scaling block of a workload definition.
 *
 * Every bound is optional at the schema level and required by mode instead:
 * `minReplicas`/`maxReplicas` are meaningless under `manual` and mandatory
 * under `hpa`. The service enforces the mode-dependent rules and answers 422.
 */
export type TComputeWorkloadScaling = TObject<{
  mode: TOptional<TComputeWorkloadScalingMode>
  minReplicas: TOptional<TNumber>
  maxReplicas: TOptional<TNumber>
  targetCpuPercent: TOptional<TNumber>
  targetMemoryPercent: TOptional<TNumber>
}>
export const ComputeWorkloadScalingSchema: TComputeWorkloadScaling = Type.Object({
  /** `manual` (default) or `hpa` */
  mode: Type.Optional(ComputeWorkloadScalingModeSchema),
  /** The autoscaler's floor, 1..50. Also the count a create and a resume start at under `hpa` */
  minReplicas: Type.Optional(Type.Number()),
  /** The autoscaler's ceiling, 1..50 — the number the tenant quota pre-flight measures */
  maxReplicas: Type.Optional(Type.Number()),
  /** Target average CPU utilization, 1..100 percent of the slot's request */
  targetCpuPercent: Type.Optional(Type.Number()),
  /** Target average memory utilization, 1..100 percent of the slot's request */
  targetMemoryPercent: Type.Optional(Type.Number()),
})
export type ComputeWorkloadScaling = Static<typeof ComputeWorkloadScalingSchema>

/** Everything the reconciler needs to build a Deployment, a Service and a pre-sync Job. */
export type TComputeWorkloadDefinition = TObject<{
  image: TString
  slotTier: TComputeSlotTier
  kind: TOptional<TComputeWorkloadKind>
  replicas: TOptional<TNumber>
  port: TOptional<TNumber>
  probes: TOptional<TComputeWorkloadProbes>
  preSync: TOptional<TComputePreSyncSpec>
  scaling: TOptional<TComputeWorkloadScaling>
}>
export const ComputeWorkloadDefinitionSchema: TComputeWorkloadDefinition = Type.Object({
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
})
export type ComputeWorkloadDefinition = Static<typeof ComputeWorkloadDefinitionSchema>

/**
 * A container workload, as served by the API.
 *
 * `definition` is optional: a row written before the definition columns
 * existed carries none of them. `activeRevision` advances only when the
 * reconciler reports the mutation's operation succeeded — never at request
 * time — so a failed pre-sync leaves it pointing at what is still serving.
 */
export type TComputeWorkload = TObject<{
  id: TString
  tenantId: TString
  name: TString
  status: TComputeWorkloadStatus
  readyReplicas: TNumber
  reason: TOptional<TString>
  definition: TOptional<TComputeWorkloadDefinition>
  activeRevision: TOptional<TNumber>
  rolledBackFrom: TOptional<TNumber>
  paused: TOptional<TBoolean>
  createdAt: TString
  updatedAt: TString
}>
export const ComputeWorkloadSchema: TComputeWorkload = Type.Object({
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
  updatedAt: Type.String(),
})
export type ComputeWorkload = Static<typeof ComputeWorkloadSchema>

/** What produced one recorded execution. */
export type TComputeWorkloadRunKind = TUnion<[TLiteral<"batch">, TLiteral<"pre_sync">]>
export const ComputeWorkloadRunKindSchema: TComputeWorkloadRunKind = Type.Union([
  Type.Literal("batch"),
  Type.Literal("pre_sync"),
])
export type ComputeWorkloadRunKind = Static<typeof ComputeWorkloadRunKindSchema>

/** The lifecycle of one execution. A run whose poll window closes is `failed`. */
export type TComputeWorkloadRunStatus = TUnion<[TLiteral<"running">, TLiteral<"succeeded">, TLiteral<"failed">]>
export const ComputeWorkloadRunStatusSchema: TComputeWorkloadRunStatus = Type.Union([
  Type.Literal("running"),
  Type.Literal("succeeded"),
  Type.Literal("failed"),
])
export type ComputeWorkloadRunStatus = Static<typeof ComputeWorkloadRunStatusSchema>

/** One recorded execution — an on-demand batch run, or a pre-sync hook. */
export type TComputeWorkloadRun = TObject<{
  id: TString
  workloadId: TString
  tenantId: TString
  kind: TComputeWorkloadRunKind
  name: TString
  status: TComputeWorkloadRunStatus
  reason: TOptional<TString>
  operationId: TOptional<TString>
  startedAt: TString
  completedAt: TOptional<TString>
}>
export const ComputeWorkloadRunSchema: TComputeWorkloadRun = Type.Object({
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
  completedAt: Type.Optional(Type.String()),
})
export type ComputeWorkloadRun = Static<typeof ComputeWorkloadRunSchema>

/**
 * A page of run history, newest first. BARE — this endpoint does not use the
 * `{ success: true, ... }` envelope.
 */
export type TComputeWorkloadRunList = TObject<{
  runs: TArray<TComputeWorkloadRun>
  nextCursor: TOptional<TString>
}>
export const ComputeWorkloadRunListSchema: TComputeWorkloadRunList = Type.Object({
  /** One page of runs, newest first */
  runs: Type.Array(ComputeWorkloadRunSchema),
  /** Opaque cursor for the next page; absent on the last page */
  nextCursor: Type.Optional(Type.String()),
})
export type ComputeWorkloadRunList = Static<typeof ComputeWorkloadRunListSchema>

// ── Workload response envelopes ──

/** `GET /api/v1/workloads` */
export type TComputeWorkloadListResponse = TObject<{
  success: TLiteral<true>
  workloads: TArray<TComputeWorkload>
}>
export const ComputeWorkloadListResponseSchema: TComputeWorkloadListResponse = Type.Object({
  success: Type.Literal(true),
  workloads: Type.Array(ComputeWorkloadSchema),
})
export type ComputeWorkloadListResponse = Static<typeof ComputeWorkloadListResponseSchema>

/** `POST /api/v1/workloads` and `GET /api/v1/workloads/{workloadId}` */
export type TComputeWorkloadResponse = TObject<{
  success: TLiteral<true>
  workload: TComputeWorkload
}>
export const ComputeWorkloadResponseSchema: TComputeWorkloadResponse = Type.Object({
  success: Type.Literal(true),
  workload: ComputeWorkloadSchema,
})
export type ComputeWorkloadResponse = Static<typeof ComputeWorkloadResponseSchema>

/** The 202 of PATCH, rollback, pause and resume. */
export type TComputeWorkloadMutationResponse = TObject<{
  success: TLiteral<true>
  workload: TComputeWorkload
  operationId: TString
}>
export const ComputeWorkloadMutationResponseSchema: TComputeWorkloadMutationResponse = Type.Object({
  success: Type.Literal(true),
  workload: ComputeWorkloadSchema,
  /** Poll `GET /api/v1/operations/{operationId}` for cluster convergence */
  operationId: Type.String(),
})
export type ComputeWorkloadMutationResponse = Static<typeof ComputeWorkloadMutationResponseSchema>

/** The 202 of `DELETE /api/v1/workloads/{workloadId}` — no workload body. */
export type TComputeWorkloadDeleteResponse = TObject<{
  success: TLiteral<true>
  operationId: TString
}>
export const ComputeWorkloadDeleteResponseSchema: TComputeWorkloadDeleteResponse = Type.Object({
  success: Type.Literal(true),
  /** Poll `GET /api/v1/operations/{operationId}` for the teardown */
  operationId: Type.String(),
})
export type ComputeWorkloadDeleteResponse = Static<typeof ComputeWorkloadDeleteResponseSchema>

/** The 202 of `POST /api/v1/workloads/{workloadId}/run`. */
export type TComputeWorkloadRunResponse = TObject<{
  success: TLiteral<true>
  run: TComputeWorkloadRun
  runId: TString
  operationId: TString
}>
export const ComputeWorkloadRunResponseSchema: TComputeWorkloadRunResponse = Type.Object({
  success: Type.Literal(true),
  /** The run row, already listed by `GET /runs` */
  run: ComputeWorkloadRunSchema,
  /** The run id (full UUID) — also the Kubernetes Job name suffix */
  runId: Type.String(),
  /** Poll `GET /api/v1/operations/{operationId}` for the run */
  operationId: Type.String(),
})
export type ComputeWorkloadRunResponse = Static<typeof ComputeWorkloadRunResponseSchema>

// ── Logs ──

/** Which pipe the line came out of. */
export type TComputeLogStreamName = TUnion<[TLiteral<"stdout">, TLiteral<"stderr">]>
export const ComputeLogStreamNameSchema: TComputeLogStreamName = Type.Union([
  Type.Literal("stdout"),
  Type.Literal("stderr"),
])
export type ComputeLogStreamName = Static<typeof ComputeLogStreamNameSchema>

/** One indexed log line. */
export type TComputeLogEntry = TObject<{
  timestamp: TString
  podName: TString
  container: TString
  level: TString
  message: TString
  stream: TComputeLogStreamName
}>
export const ComputeLogEntrySchema: TComputeLogEntry = Type.Object({
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
  stream: ComputeLogStreamNameSchema,
})
export type ComputeLogEntry = Static<typeof ComputeLogEntrySchema>

/** Historical log response. BARE — no `{ success: true }` envelope. */
export type TComputeWorkloadLogs = TObject<{
  workloadId: TString
  container: TUnion<[TString, TNull]>
  totalMatches: TNumber
  logs: TArray<TComputeLogEntry>
}>
export const ComputeWorkloadLogsSchema: TComputeWorkloadLogs = Type.Object({
  /** The workload the lines belong to (full UUID) */
  workloadId: Type.String(),
  /** Echo of the requested container filter; `null` when the query was not container-scoped */
  container: Type.Union([Type.String(), Type.Null()]),
  /** How many lines matched upstream */
  totalMatches: Type.Number(),
  /** The matching lines, newest-first as indexed upstream */
  logs: Type.Array(ComputeLogEntrySchema),
})
export type ComputeWorkloadLogs = Static<typeof ComputeWorkloadLogsSchema>

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
export type TComputeLogStreamEvent = TObject<{
  timestamp: TString
  pod: TString
  container: TString
  line: TString
}>
export const ComputeLogStreamEventSchema: TComputeLogStreamEvent = Type.Object({
  /** ISO-8601 timestamp of the line, from the Kubernetes `timestamps=true` prefix */
  timestamp: Type.String(),
  /** The pod that emitted it */
  pod: Type.String(),
  /** The container that emitted it */
  container: Type.String(),
  /** The line itself, passed through byte-for-byte */
  line: Type.String(),
})
export type ComputeLogStreamEvent = Static<typeof ComputeLogStreamEventSchema>

// ── Domains ──

/** Lifecycle state of a domain binding. */
export type TComputeDomainStatus = TUnion<
  [TLiteral<"pending_verification">, TLiteral<"ready">, TLiteral<"failed">, TLiteral<"detached">]
>
export const ComputeDomainStatusSchema: TComputeDomainStatus = Type.Union([
  Type.Literal("pending_verification"),
  Type.Literal("ready"),
  Type.Literal("failed"),
  Type.Literal("detached"),
])
export type ComputeDomainStatus = Static<typeof ComputeDomainStatusSchema>

/** How ownership of the hostname is established. */
export type TComputeDomainVerificationType = TUnion<[TLiteral<"cname">, TLiteral<"platform_wildcard">]>
export const ComputeDomainVerificationTypeSchema: TComputeDomainVerificationType = Type.Union([
  Type.Literal("cname"),
  Type.Literal("platform_wildcard"),
])
export type ComputeDomainVerificationType = Static<typeof ComputeDomainVerificationTypeSchema>

/** DNS ownership block. */
export type TComputeDomainVerification = TObject<{
  type: TComputeDomainVerificationType
  expectedTarget: TString
  verified: TBoolean
}>
export const ComputeDomainVerificationSchema: TComputeDomainVerification = Type.Object({
  /** `cname` for a custom hostname, `platform_wildcard` when the platform owns the zone */
  type: ComputeDomainVerificationTypeSchema,
  /** The DNS record the caller must create */
  expectedTarget: Type.String(),
  /** Whether the expected record was observed */
  verified: Type.Boolean(),
})
export type ComputeDomainVerification = Static<typeof ComputeDomainVerificationSchema>

/** Certificate state, as OBSERVED from cert-manager. Never a request to issue. */
export type TComputeDomainTlsStatus = TUnion<[TLiteral<"pending_issuance">, TLiteral<"issued">, TLiteral<"failed">]>
export const ComputeDomainTlsStatusSchema: TComputeDomainTlsStatus = Type.Union([
  Type.Literal("pending_issuance"),
  Type.Literal("issued"),
  Type.Literal("failed"),
])
export type ComputeDomainTlsStatus = Static<typeof ComputeDomainTlsStatusSchema>

/** TLS block. `issuer` and `expiresAt` are omitted until cert-manager reports them. */
export type TComputeDomainTls = TObject<{
  status: TComputeDomainTlsStatus
  secretName: TString
  issuer: TOptional<TString>
  expiresAt: TOptional<TString>
}>
export const ComputeDomainTlsSchema: TComputeDomainTls = Type.Object({
  /** Issuance state */
  status: ComputeDomainTlsStatusSchema,
  /** The in-cluster Secret the certificate lands in */
  secretName: Type.String(),
  /** The issuing CA, once observed */
  issuer: Type.Optional(Type.String()),
  /** ISO-8601 expiry, once observed */
  expiresAt: Type.Optional(Type.String()),
})
export type ComputeDomainTls = Static<typeof ComputeDomainTlsSchema>

/** A domain binding, as served by attach and list. */
export type TComputeDomain = TObject<{
  domainId: TString
  workloadId: TString
  hostname: TString
  targetPort: TNumber
  status: TComputeDomainStatus
  verification: TComputeDomainVerification
  tls: TComputeDomainTls
  createdAt: TString
}>
export const ComputeDomainSchema: TComputeDomain = Type.Object({
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
  createdAt: Type.String(),
})
export type ComputeDomain = Static<typeof ComputeDomainSchema>

/** `GET /api/v1/workloads/{workloadId}/domains` — live bindings, oldest first. */
export type TComputeDomainListResponse = TObject<{
  success: TLiteral<true>
  domains: TArray<TComputeDomain>
}>
export const ComputeDomainListResponseSchema: TComputeDomainListResponse = Type.Object({
  success: Type.Literal(true),
  domains: Type.Array(ComputeDomainSchema),
})
export type ComputeDomainListResponse = Static<typeof ComputeDomainListResponseSchema>

/**
 * The verify response — deliberately NARROWER than `ComputeDomainSchema`:
 * verify reports what was just observed, it does not restate the binding.
 * BARE — no `{ success: true }` envelope.
 */
export type TComputeDomainVerifyResponse = TObject<{
  domainId: TString
  hostname: TString
  status: TComputeDomainStatus
  verification: TComputeDomainVerification
  tls: TComputeDomainTls
}>
export const ComputeDomainVerifyResponseSchema: TComputeDomainVerifyResponse = Type.Object({
  /** The domain binding id (full UUID) */
  domainId: Type.String(),
  /** The bound hostname */
  hostname: Type.String(),
  /** Lifecycle state after the observation */
  status: ComputeDomainStatusSchema,
  /** What the DNS lookup saw */
  verification: ComputeDomainVerificationSchema,
  /** What the read-only Certificate GET saw */
  tls: ComputeDomainTlsSchema,
})
export type ComputeDomainVerifyResponse = Static<typeof ComputeDomainVerifyResponseSchema>

// ── Operations ──

/** What kind of asynchronous mutation an operation tracks. */
export type TComputeOperationType = TUnion<
  [
    TLiteral<"workload.deploy">,
    TLiteral<"workload.update">,
    TLiteral<"workload.rollback">,
    TLiteral<"workload.archive">,
    TLiteral<"workload.pause">,
    TLiteral<"workload.resume">,
    TLiteral<"workload.run">,
  ]
>
export const ComputeOperationTypeSchema: TComputeOperationType = Type.Union([
  Type.Literal("workload.deploy"),
  Type.Literal("workload.update"),
  Type.Literal("workload.rollback"),
  Type.Literal("workload.archive"),
  Type.Literal("workload.pause"),
  Type.Literal("workload.resume"),
  Type.Literal("workload.run"),
])
export type ComputeOperationType = Static<typeof ComputeOperationTypeSchema>

/** Terminal states are `succeeded` and `failed`. */
export type TComputeOperationStatus = TUnion<
  [TLiteral<"pending">, TLiteral<"in_progress">, TLiteral<"succeeded">, TLiteral<"failed">]
>
export const ComputeOperationStatusSchema: TComputeOperationStatus = Type.Union([
  Type.Literal("pending"),
  Type.Literal("in_progress"),
  Type.Literal("succeeded"),
  Type.Literal("failed"),
])
export type ComputeOperationStatus = Static<typeof ComputeOperationStatusSchema>

/** Where in the mutation the reconciler currently is. */
export type TComputeOperationPhase = TUnion<
  [
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
    TLiteral<"failed">,
  ]
>
export const ComputeOperationPhaseSchema: TComputeOperationPhase = Type.Union([
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
  Type.Literal("failed"),
])
export type ComputeOperationPhase = Static<typeof ComputeOperationPhaseSchema>

/** The state of one step of an operation. */
export type TComputeOperationStepStatus = TUnion<
  [TLiteral<"pending">, TLiteral<"running">, TLiteral<"succeeded">, TLiteral<"failed">]
>
export const ComputeOperationStepStatusSchema: TComputeOperationStepStatus = Type.Union([
  Type.Literal("pending"),
  Type.Literal("running"),
  Type.Literal("succeeded"),
  Type.Literal("failed"),
])
export type ComputeOperationStepStatus = Static<typeof ComputeOperationStepStatusSchema>

/** The pre-sync job attached to a deploy. */
export type TComputeOperationPreSyncProgress = TObject<{
  name: TString
  status: TComputeOperationStepStatus
  startedAt: TOptional<TString>
  completedAt: TOptional<TString>
}>
export const ComputeOperationPreSyncProgressSchema: TComputeOperationPreSyncProgress = Type.Object({
  /** The hook's label */
  name: Type.String(),
  /** Step state */
  status: ComputeOperationStepStatusSchema,
  /** ISO-8601 start timestamp */
  startedAt: Type.Optional(Type.String()),
  /** ISO-8601 completion timestamp */
  completedAt: Type.Optional(Type.String()),
})
export type ComputeOperationPreSyncProgress = Static<typeof ComputeOperationPreSyncProgressSchema>

/** Rolling-deployment replica counters. */
export type TComputeOperationDeploymentProgress = TObject<{
  desiredReplicas: TNumber
  updatedReplicas: TNumber
  readyReplicas: TNumber
}>
export const ComputeOperationDeploymentProgressSchema: TComputeOperationDeploymentProgress = Type.Object({
  /** Replicas the Deployment wants */
  desiredReplicas: Type.Number(),
  /** Replicas already on the new template */
  updatedReplicas: Type.Number(),
  /** Replicas reporting ready */
  readyReplicas: Type.Number(),
})
export type ComputeOperationDeploymentProgress = Static<typeof ComputeOperationDeploymentProgressSchema>

/** Progress detail of an operation. */
export type TComputeOperationProgress = TObject<{
  preSync: TOptional<TComputeOperationPreSyncProgress>
  deployment: TOptional<TComputeOperationDeploymentProgress>
}>
export const ComputeOperationProgressSchema: TComputeOperationProgress = Type.Object({
  /** The pre-sync hook, when the mutation gated on one */
  preSync: Type.Optional(ComputeOperationPreSyncProgressSchema),
  /** The rollout, once it started */
  deployment: Type.Optional(ComputeOperationDeploymentProgressSchema),
})
export type ComputeOperationProgress = Static<typeof ComputeOperationProgressSchema>

/** An operation, as served by `GET /api/v1/operations/{operationId}`. BARE — no envelope. */
export type TComputeOperation = TObject<{
  operationId: TString
  workloadId: TString
  type: TComputeOperationType
  status: TComputeOperationStatus
  phase: TComputeOperationPhase
  progress: TComputeOperationProgress
  reason: TOptional<TString>
  createdAt: TString
  updatedAt: TString
}>
export const ComputeOperationSchema: TComputeOperation = Type.Object({
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
  updatedAt: Type.String(),
})
export type ComputeOperation = Static<typeof ComputeOperationSchema>

// ── Revision history ──
//
// DECLARED AFTER `Operations` ON PURPOSE: a revision's `outcome` IS the joined
// operation's status, so `ComputeRevisionOutcomeSchema` below cannot be
// evaluated before `ComputeOperationStatusSchema` exists.

/** Why a revision exists. */
export type TComputeWorkloadRevisionCause = TUnion<[TLiteral<"created">, TLiteral<"update">, TLiteral<"rollback">]>
export const ComputeWorkloadRevisionCauseSchema: TComputeWorkloadRevisionCause = Type.Union([
  Type.Literal("created"),
  Type.Literal("update"),
  Type.Literal("rollback"),
])
export type ComputeWorkloadRevisionCause = Static<typeof ComputeWorkloadRevisionCauseSchema>

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
 * The third case is EVERY `created` revision: a create mints no `operationId`,
 * so nothing will ever report on it. Declaring `outcome` required here would
 * make `parseResponseHelper` throw on revision 1 of every healthy workload.
 *
 * `slotTier` is absent on a row recorded before slot tiers were part of the
 * definition contract — omitted rather than invented, upstream and here.
 */
export type TComputeWorkloadRevision = TObject<{
  revision: TNumber
  image: TString
  slotTier: TOptional<TComputeSlotTier>
  cause: TComputeWorkloadRevisionCause
  isActive: TBoolean
  rolledBackFrom: TOptional<TNumber>
  operationId: TOptional<TString>
  outcome: TOptional<TComputeOperationStatus>
  outcomeReason: TOptional<TString>
  createdAt: TString
}>
export const ComputeWorkloadRevisionSchema: TComputeWorkloadRevision = Type.Object({
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
  createdAt: Type.String(),
})
export type ComputeWorkloadRevision = Static<typeof ComputeWorkloadRevisionSchema>

/**
 * A page of revision history, NEWEST ORDINAL FIRST. BARE — this endpoint does
 * not use the `{ success: true, ... }` envelope.
 */
export type TComputeWorkloadRevisionList = TObject<{
  revisions: TArray<TComputeWorkloadRevision>
  nextCursor: TOptional<TString>
}>
export const ComputeWorkloadRevisionListSchema: TComputeWorkloadRevisionList = Type.Object({
  /** One page of revisions, newest ordinal first */
  revisions: Type.Array(ComputeWorkloadRevisionSchema),
  /** Opaque cursor for the next page; absent on the last page */
  nextCursor: Type.Optional(Type.String()),
})
export type ComputeWorkloadRevisionList = Static<typeof ComputeWorkloadRevisionListSchema>

// ── Deployment events ──
//
// KUBERNETES events, not Flowcore events. These are a live, read-only cluster
// read — nothing is emitted and nothing is persisted — and they are bounded by
// the cluster's own event TTL (about an hour on this platform).

/** The object an event is about — a Deployment, ReplicaSet, Pod, Service, HPA or Job. */
export type TComputeDeploymentEventObject = TObject<{
  kind: TString
  name: TString
}>
export const ComputeDeploymentEventObjectSchema: TComputeDeploymentEventObject = Type.Object({
  /** The Kubernetes kind */
  kind: Type.String(),
  /** The object's name */
  name: Type.String(),
})
export type ComputeDeploymentEventObject = Static<typeof ComputeDeploymentEventObjectSchema>

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
export type TComputeDeploymentEvent = TObject<{
  name: TString
  type: TString
  reason: TString
  message: TString
  count: TNumber
  object: TComputeDeploymentEventObject
  source: TOptional<TString>
  firstSeen: TOptional<TString>
  lastSeen: TOptional<TString>
}>
export const ComputeDeploymentEventSchema: TComputeDeploymentEvent = Type.Object({
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
  lastSeen: Type.Optional(Type.String()),
})
export type ComputeDeploymentEvent = Static<typeof ComputeDeploymentEventSchema>

/**
 * The workload's recent cluster events, most recently seen first. BARE — no
 * `{ success: true, ... }` envelope, and UNPAGINATED by construction.
 *
 * AN EMPTY ARRAY IS A LEGITIMATE ANSWER, never an error: a workload the
 * cluster has had nothing to say about — or nothing within the TTL — answers
 * 200 with `events: []`.
 */
export type TComputeWorkloadDeploymentEvents = TObject<{
  workloadId: TString
  events: TArray<TComputeDeploymentEvent>
}>
export const ComputeWorkloadDeploymentEventsSchema: TComputeWorkloadDeploymentEvents = Type.Object({
  /** The workload the events belong to (full UUID) */
  workloadId: Type.String(),
  /** The cluster's recent events, most recently seen first; possibly empty */
  events: Type.Array(ComputeDeploymentEventSchema),
})
export type ComputeWorkloadDeploymentEvents = Static<typeof ComputeWorkloadDeploymentEventsSchema>

// ── Registries ──

/**
 * A registry, sanitized.
 *
 * THERE IS NO `secret` FIELD AND THERE MUST NEVER BE ONE. The upstream
 * contract has no credential-bearing field of any kind — plaintext,
 * ciphertext or encoded — and the service's routes cannot return one. A
 * credential is write-only and rotation-only.
 */
export type TComputeRegistry = TObject<{
  registryId: TString
  name: TString
  serverUrl: TString
  username: TString
  isDefault: TBoolean
  createdAt: TString
  updatedAt: TString
}>
export const ComputeRegistrySchema: TComputeRegistry = Type.Object({
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
  updatedAt: Type.String(),
})
export type ComputeRegistry = Static<typeof ComputeRegistrySchema>

/**
 * Whether the credential became a working in-cluster pull Secret.
 *
 * Three values where the EVENT enum has two: `pending` is the projection's
 * NULL — no report from the reconciler has arrived yet.
 */
export type TComputeRegistrySynthesisState = TUnion<[TLiteral<"pending">, TLiteral<"synthesized">, TLiteral<"failed">]>
export const ComputeRegistrySynthesisStateSchema: TComputeRegistrySynthesisState = Type.Union([
  Type.Literal("pending"),
  Type.Literal("synthesized"),
  Type.Literal("failed"),
])
export type ComputeRegistrySynthesisState = Static<typeof ComputeRegistrySynthesisStateSchema>

/** The single-registry read: the sanitized registry plus its synthesis state. */
export type TComputeRegistryDetail = TObject<{
  registryId: TString
  name: TString
  serverUrl: TString
  username: TString
  isDefault: TBoolean
  createdAt: TString
  updatedAt: TString
  synthesisStatus: TComputeRegistrySynthesisState
  synthesisReason: TOptional<TString>
  synthesisAt: TOptional<TString>
}>
export const ComputeRegistryDetailSchema: TComputeRegistryDetail = Type.Object({
  ...ComputeRegistrySchema.properties,
  /** Whether the reconciler turned the credential into a pull Secret */
  synthesisStatus: ComputeRegistrySynthesisStateSchema,
  /** The reconciler's explanation of a failed synthesis — never credential material */
  synthesisReason: Type.Optional(Type.String()),
  /** ISO-8601 timestamp of the synthesis report */
  synthesisAt: Type.Optional(Type.String()),
})
export type ComputeRegistryDetail = Static<typeof ComputeRegistryDetailSchema>

/** `GET /api/v1/registries` */
export type TComputeRegistryListResponse = TObject<{
  success: TLiteral<true>
  registries: TArray<TComputeRegistry>
}>
export const ComputeRegistryListResponseSchema: TComputeRegistryListResponse = Type.Object({
  success: Type.Literal(true),
  registries: Type.Array(ComputeRegistrySchema),
})
export type ComputeRegistryListResponse = Static<typeof ComputeRegistryListResponseSchema>

/** `GET /api/v1/registries/{registryId}` */
export type TComputeRegistryDetailResponse = TObject<{
  success: TLiteral<true>
  registry: TComputeRegistryDetail
}>
export const ComputeRegistryDetailResponseSchema: TComputeRegistryDetailResponse = Type.Object({
  success: Type.Literal(true),
  registry: ComputeRegistryDetailSchema,
})
export type ComputeRegistryDetailResponse = Static<typeof ComputeRegistryDetailResponseSchema>
