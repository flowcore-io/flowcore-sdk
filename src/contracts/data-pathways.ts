import {
  type Static,
  type TArray,
  type TBoolean,
  type TInteger,
  type TLiteral,
  type TNull,
  type TNumber,
  type TObject,
  type TOptional,
  type TRecord,
  type TString,
  type TUnion,
  type TUnknown,
  Type,
} from "@sinclair/typebox"

// ── Shared types ──

type TSizeClass = TUnion<[TLiteral<"small">, TLiteral<"medium">, TLiteral<"high">]>
const SizeClassEnum: TSizeClass = Type.Union([Type.Literal("small"), Type.Literal("medium"), Type.Literal("high")])

type TStringRecord = TRecord<TString, TString>
type TUnknownRecord = TRecord<TString, TUnknown>
type TNullableString = TUnion<[TString, TNull]>

// ── Config building blocks ──

type TEndpointConfig = TObject<{
  url: TString
  authHeaders: TOptional<TStringRecord>
}>
const EndpointConfigSchema: TEndpointConfig = Type.Object({
  url: Type.String(),
  authHeaders: Type.Optional(Type.Record(Type.String(), Type.String())),
})

type TBackoffConfig = TOptional<
  TObject<{
    initialMs: TOptional<TInteger>
    maxMs: TOptional<TInteger>
    multiplier: TOptional<TNumber>
  }>
>
const BackoffConfigSchema: TBackoffConfig = Type.Optional(
  Type.Object({
    initialMs: Type.Optional(Type.Integer()),
    maxMs: Type.Optional(Type.Integer()),
    multiplier: Type.Optional(Type.Number()),
  }),
)

type TTimeoutConfig = TOptional<
  TObject<{
    deliveryMs: TOptional<TInteger>
    fetchMs: TOptional<TInteger>
  }>
>
const TimeoutConfigSchema: TTimeoutConfig = Type.Optional(
  Type.Object({
    deliveryMs: Type.Optional(Type.Integer()),
    fetchMs: Type.Optional(Type.Integer()),
  }),
)

type TSourceConfig = TObject<{
  flowType: TString
  eventTypes: TArray<TString>
  endpoints: TArray<TEndpointConfig>
  batchSize: TOptional<TInteger>
  maxInFlight: TOptional<TInteger>
  backoff: TBackoffConfig
  timeouts: TTimeoutConfig
}>
const SourceConfigSchema: TSourceConfig = Type.Object({
  flowType: Type.String(),
  eventTypes: Type.Array(Type.String()),
  endpoints: Type.Array(EndpointConfigSchema),
  batchSize: Type.Optional(Type.Integer()),
  maxInFlight: Type.Optional(Type.Integer()),
  backoff: BackoffConfigSchema,
  timeouts: TimeoutConfigSchema,
})

type TDataSourceConfig = TObject<{
  tenant: TString
  dataCore: TString
}>
const DataSourceConfigSchema: TDataSourceConfig = Type.Object({
  tenant: Type.String(),
  dataCore: Type.String(),
})

type TAuthConfig = TObject<{
  apiKey: TString
}>
const AuthConfigSchema: TAuthConfig = Type.Object({
  apiKey: Type.String(),
})

type TPathwayConfig = TObject<{
  sources: TArray<TSourceConfig>
}>

type TPumpConfig = TObject<{
  sources: TArray<TSourceConfig>
  dataSource: TDataSourceConfig
  auth: TOptional<TAuthConfig>
}>

/** User-facing pathway config — what the API accepts on create/update */
export const PathwayConfigSchema: TPathwayConfig = Type.Object({
  sources: Type.Array(SourceConfigSchema),
})
export type PathwayConfig = Static<typeof PathwayConfigSchema>

/** Rendered pump config — what the worker receives (CP injects dataSource + auth) */
export const PumpConfigSchema: TPumpConfig = Type.Object({
  sources: Type.Array(SourceConfigSchema),
  dataSource: DataSourceConfigSchema,
  auth: Type.Optional(AuthConfigSchema),
})
export type PumpConfig = Static<typeof PumpConfigSchema>

// ── Virtual pathway config ──

type TPathwayType = TOptional<TUnion<[TLiteral<"managed">, TLiteral<"virtual">]>>
const PathwayTypeSchema: TPathwayType = Type.Optional(Type.Union([Type.Literal("managed"), Type.Literal("virtual")]))

type TVirtualConfig = TObject<{
  resetUrl: TString
  authHeaders: TOptional<TStringRecord>
  flowTypes: TOptional<TArray<TString>>
}>
const VirtualConfigSchema: TVirtualConfig = Type.Object({
  resetUrl: Type.String(),
  authHeaders: Type.Optional(Type.Record(Type.String(), Type.String())),
  flowTypes: Type.Optional(Type.Array(Type.String())),
})
export type VirtualConfig = Static<typeof VirtualConfigSchema>

// ── Pathways ──

export const DataPathwaySchema: TObject<{
  id: TString
  tenant: TString
  dataCore: TString
  sizeClass: TSizeClass
  type: TPathwayType
  enabled: TBoolean
  priority: TInteger
  version: TInteger
  labels: TStringRecord
  config: TOptional<TPathwayConfig>
  virtualConfig: TOptional<TVirtualConfig>
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  id: Type.String(),
  tenant: Type.String(),
  dataCore: Type.String(),
  sizeClass: SizeClassEnum,
  type: PathwayTypeSchema,
  enabled: Type.Boolean(),
  priority: Type.Integer(),
  version: Type.Integer(),
  labels: Type.Record(Type.String(), Type.String()),
  config: Type.Optional(PathwayConfigSchema),
  virtualConfig: Type.Optional(VirtualConfigSchema),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathway = Static<typeof DataPathwaySchema>

export const DataPathwayListSchema: TObject<{
  pathways: TArray<typeof DataPathwaySchema>
  total: TInteger
}> = Type.Object({
  pathways: Type.Array(DataPathwaySchema),
  total: Type.Integer(),
})
export type DataPathwayList = Static<typeof DataPathwayListSchema>

export const DataPathwayMutationResponseSchema: TObject<{
  pathwayId: TString
  status: TString
}> = Type.Object({
  pathwayId: Type.String(),
  status: Type.String(),
})
export type DataPathwayMutationResponse = Static<typeof DataPathwayMutationResponseSchema>

// ── Slots ──

export const DataPathwaySlotSchema: TObject<{
  id: TString
  podUnitId: TString
  class: TSizeClass
  labels: TStringRecord
  lastSeen: TString
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  id: Type.String(),
  podUnitId: Type.String(),
  class: SizeClassEnum,
  labels: Type.Record(Type.String(), Type.String()),
  lastSeen: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwaySlot = Static<typeof DataPathwaySlotSchema>

export const DataPathwaySlotListSchema: TObject<{
  slots: TArray<typeof DataPathwaySlotSchema>
  total: TInteger
}> = Type.Object({
  slots: Type.Array(DataPathwaySlotSchema),
  total: Type.Integer(),
})
export type DataPathwaySlotList = Static<typeof DataPathwaySlotListSchema>

export const DataPathwaySlotMutationResponseSchema: TObject<{
  slotId: TString
  status: TString
}> = Type.Object({
  slotId: Type.String(),
  status: Type.String(),
})
export type DataPathwaySlotMutationResponse = Static<typeof DataPathwaySlotMutationResponseSchema>

// ── Assignments ──

export const DataPathwayAssignmentSchema: TObject<{
  id: TString
  pathwayId: TString
  slotId: TString
  generation: TInteger
  leaseTTL: TString
  status: TString
  config: TPumpConfig
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  id: Type.String(),
  pathwayId: Type.String(),
  slotId: Type.String(),
  generation: Type.Integer(),
  leaseTTL: Type.String(),
  status: Type.String(),
  config: PumpConfigSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwayAssignment = Static<typeof DataPathwayAssignmentSchema>

type TAssignmentNextInner = TObject<{
  assignmentId: TString
  pathwayId: TString
  slotId: TString
  generation: TInteger
  config: TPumpConfig
  leaseTTL: TString
  status: TString
}>
const AssignmentNextInnerSchema: TAssignmentNextInner = Type.Object({
  assignmentId: Type.String(),
  pathwayId: Type.String(),
  slotId: Type.String(),
  generation: Type.Integer(),
  config: PumpConfigSchema,
  leaseTTL: Type.String(),
  status: Type.String(),
})

export const DataPathwayAssignmentNextSchema: TObject<{
  assignment: TUnion<[TAssignmentNextInner, TNull]>
}> = Type.Object({
  assignment: Type.Union([AssignmentNextInnerSchema, Type.Null()]),
})
export type DataPathwayAssignmentNext = Static<typeof DataPathwayAssignmentNextSchema>

export const DataPathwayAssignmentListSchema: TObject<{
  assignments: TArray<typeof DataPathwayAssignmentSchema>
  total: TInteger
}> = Type.Object({
  assignments: Type.Array(DataPathwayAssignmentSchema),
  total: Type.Integer(),
})
export type DataPathwayAssignmentList = Static<typeof DataPathwayAssignmentListSchema>

export const DataPathwayExpireLeasesResponseSchema: TObject<{
  expired: TInteger
}> = Type.Object({
  expired: Type.Integer(),
})
export type DataPathwayExpireLeasesResponse = Static<typeof DataPathwayExpireLeasesResponseSchema>

// ── Commands ──

export const DataPathwayCommandSchema: TObject<{
  id: TString
  restartRequestId: TNullableString
  assignmentId: TString
  type: TString
  generation: TInteger
  position: TUnion<[TUnknownRecord, TNull]>
  stopAt: TNullableString
  timeoutMs: TUnion<[TInteger, TNull]>
  phase: TString
  reason: TNullableString
  createdAt: TString
}> = Type.Object({
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
  createdAt: Type.String(),
})
export type DataPathwayCommand = Static<typeof DataPathwayCommandSchema>

export const DataPathwayCommandListSchema: TObject<{
  commands: TArray<typeof DataPathwayCommandSchema>
}> = Type.Object({
  commands: Type.Array(DataPathwayCommandSchema),
})
export type DataPathwayCommandList = Static<typeof DataPathwayCommandListSchema>

export const DataPathwayCommandResponseSchema: TObject<{
  commandId: TString
  phase: TString
}> = Type.Object({
  commandId: Type.String(),
  phase: Type.String(),
})
export type DataPathwayCommandResponse = Static<typeof DataPathwayCommandResponseSchema>

// ── Restarts ──

type TVirtualResetResult = TObject<{
  pathwayId: TString
  success: TBoolean
  httpStatus: TUnion<[TInteger, TNull]>
}>
const VirtualResetResultSchema: TVirtualResetResult = Type.Object({
  pathwayId: Type.String(),
  success: Type.Boolean(),
  httpStatus: Type.Union([Type.Integer(), Type.Null()]),
})

export const DataPathwayRestartRequestResponseSchema: TObject<{
  restartRequestId: TString
  acceptedTargets: TArray<TString>
  skippedTargets: TArray<TString>
  virtualResults: TOptional<TArray<TVirtualResetResult>>
}> = Type.Object({
  restartRequestId: Type.String(),
  acceptedTargets: Type.Array(Type.String()),
  skippedTargets: Type.Array(Type.String()),
  virtualResults: Type.Optional(Type.Array(VirtualResetResultSchema)),
})
export type DataPathwayRestartRequestResponse = Static<typeof DataPathwayRestartRequestResponseSchema>

export const DataPathwayRestartRequestSchema: TObject<{
  id: TString
  targets: TUnknownRecord
  mode: TString
  position: TUnknownRecord
  status: TString
  requestedBy: TString
  reason: TNullableString
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  id: Type.String(),
  targets: Type.Record(Type.String(), Type.Unknown()),
  mode: Type.String(),
  position: Type.Record(Type.String(), Type.Unknown()),
  status: Type.String(),
  requestedBy: Type.String(),
  reason: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwayRestartRequest = Static<typeof DataPathwayRestartRequestSchema>

// ── Capacity ──

type TSlotCount = TObject<{ free: TInteger; used: TInteger }>
const SlotCountSchema: TSlotCount = Type.Object({
  free: Type.Integer(),
  used: Type.Integer(),
})

type TThreeClassIntegers = TObject<{ small: TInteger; medium: TInteger; high: TInteger }>
const ThreeClassIntegersSchema: TThreeClassIntegers = Type.Object({
  small: Type.Integer(),
  medium: Type.Integer(),
  high: Type.Integer(),
})

export const DataPathwayCapacitySchema: TObject<{
  slots: TObject<{
    small: TSlotCount
    medium: TSlotCount
    high: TSlotCount
  }>
  pendingAssignments: TThreeClassIntegers
}> = Type.Object({
  slots: Type.Object({
    small: SlotCountSchema,
    medium: SlotCountSchema,
    high: SlotCountSchema,
  }),
  pendingAssignments: ThreeClassIntegersSchema,
})
export type DataPathwayCapacity = Static<typeof DataPathwayCapacitySchema>

// ── Quotas ──

export const DataPathwayQuotaSchema: TObject<{
  tenant: TString
  maxSlots: TThreeClassIntegers
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  tenant: Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwayQuota = Static<typeof DataPathwayQuotaSchema>

export const DataPathwayQuotaWithUsageSchema: TObject<{
  tenant: TString
  maxSlots: TThreeClassIntegers
  used: TThreeClassIntegers
}> = Type.Object({
  tenant: Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  used: ThreeClassIntegersSchema,
})
export type DataPathwayQuotaWithUsage = Static<typeof DataPathwayQuotaWithUsageSchema>

export const DataPathwayQuotaListSchema: TObject<{
  quotas: TArray<typeof DataPathwayQuotaSchema>
  total: TInteger
}> = Type.Object({
  quotas: Type.Array(DataPathwayQuotaSchema),
  total: Type.Integer(),
})
export type DataPathwayQuotaList = Static<typeof DataPathwayQuotaListSchema>

export const DataPathwayQuotaSetResponseSchema: TObject<{
  tenant: TString
  status: TString
}> = Type.Object({
  tenant: Type.String(),
  status: Type.String(),
})
export type DataPathwayQuotaSetResponse = Static<typeof DataPathwayQuotaSetResponseSchema>

// ── Pump State ──

type TPumpStateValue = TObject<{ timeBucket: TString; eventId: TOptional<TString> }>
const PumpStateValueSchema: TPumpStateValue = Type.Object({
  timeBucket: Type.String(),
  eventId: Type.Optional(Type.String()),
})

export const DataPathwayPumpStateSchema: TObject<{
  assignmentId: TString
  state: TUnion<[TPumpStateValue, TNull]>
}> = Type.Object({
  assignmentId: Type.String(),
  state: Type.Union([PumpStateValueSchema, Type.Null()]),
})
export type DataPathwayPumpState = Static<typeof DataPathwayPumpStateSchema>

export const DataPathwayPumpStateSaveResponseSchema: TObject<{
  status: TString
}> = Type.Object({
  status: Type.String(),
})
export type DataPathwayPumpStateSaveResponse = Static<typeof DataPathwayPumpStateSaveResponseSchema>

// ── Delivery Log ──

export const DataPathwayDeliveryLogEntrySchema: TObject<{
  id: TString
  pathwayId: TString
  assignmentId: TString
  endpointUrl: TString
  httpStatus: TUnion<[TInteger, TNull]>
  success: TBoolean
  batchSize: TUnion<[TInteger, TNull]>
  durationMs: TUnion<[TInteger, TNull]>
  errorMessage: TUnion<[TString, TNull]>
  responseBody: TUnion<[TString, TNull]>
  flowType: TUnion<[TString, TNull]>
  createdAt: TString
}> = Type.Object({
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
  createdAt: Type.String(),
})
export type DataPathwayDeliveryLogEntry = Static<typeof DataPathwayDeliveryLogEntrySchema>

export const DataPathwayDeliveryLogListSchema: TObject<{
  entries: TArray<typeof DataPathwayDeliveryLogEntrySchema>
  total: TInteger
}> = Type.Object({
  entries: Type.Array(DataPathwayDeliveryLogEntrySchema),
  total: Type.Integer(),
})
export type DataPathwayDeliveryLogList = Static<typeof DataPathwayDeliveryLogListSchema>

// ── Pathway Metrics ──

type TThroughputRecentResult = TObject<{
  status: TNumber
  durationMs: TNumber
  success: TBoolean
  ageMs: TNumber
}>
const ThroughputRecentResultSchema: TThroughputRecentResult = Type.Object({
  status: Type.Number(),
  durationMs: Type.Number(),
  success: Type.Boolean(),
  ageMs: Type.Number(),
})

type TNullableNumber = TUnion<[TNumber, TNull]>

type TThroughputFlowType = TObject<{
  eventsPerSecond: TNumber
  successRate: TNumber
  avgDurationMs: TNumber
  totalDelivered: TNumber
  totalFailed: TNumber
  lastDeliveryAgeMs: TNullableNumber
  healthy: TBoolean
  recentResults: TArray<TThroughputRecentResult>
}>
const ThroughputFlowTypeSchema: TThroughputFlowType = Type.Object({
  eventsPerSecond: Type.Number(),
  successRate: Type.Number(),
  avgDurationMs: Type.Number(),
  totalDelivered: Type.Number(),
  totalFailed: Type.Number(),
  lastDeliveryAgeMs: Type.Union([Type.Number(), Type.Null()]),
  healthy: Type.Boolean(),
  recentResults: Type.Array(ThroughputRecentResultSchema),
})

type TThroughputEndpoint = TObject<{
  eventsPerSecond: TNumber
  successRate: TNumber
  totalDelivered: TNumber
  totalFailed: TNumber
  lastDeliveryAgeMs: TNullableNumber
  healthy: TBoolean
  flowTypes: TRecord<TString, TThroughputFlowType>
}>
const ThroughputEndpointSchema: TThroughputEndpoint = Type.Object({
  eventsPerSecond: Type.Number(),
  successRate: Type.Number(),
  totalDelivered: Type.Number(),
  totalFailed: Type.Number(),
  lastDeliveryAgeMs: Type.Union([Type.Number(), Type.Null()]),
  healthy: Type.Boolean(),
  flowTypes: Type.Record(Type.String(), ThroughputFlowTypeSchema),
})

type TThroughputGlobal = TObject<{
  eventsPerSecond: TNumber
  totalRecorded: TNumber
  windowSeconds: TNumber
}>

type TThroughputSnapshot = TObject<{
  global: TThroughputGlobal
  endpoints: TRecord<TString, TThroughputEndpoint>
}>
const ThroughputSnapshotSchema: TThroughputSnapshot = Type.Object({
  global: Type.Object({
    eventsPerSecond: Type.Number(),
    totalRecorded: Type.Number(),
    windowSeconds: Type.Number(),
  }),
  endpoints: Type.Record(Type.String(), ThroughputEndpointSchema),
})

type TMetricsAssignmentEntry = TObject<{
  assignmentId: TString
  status: TString
  throughput: TUnion<[TThroughputSnapshot, TNull]>
  updatedAt: TString
}>
const MetricsAssignmentEntrySchema: TMetricsAssignmentEntry = Type.Object({
  assignmentId: Type.String(),
  status: Type.String(),
  throughput: Type.Union([ThroughputSnapshotSchema, Type.Null()]),
  updatedAt: Type.String(),
})

export const DataPathwayMetricsSchema: TObject<{
  pathwayId: TString
  assignments: TArray<TMetricsAssignmentEntry>
}> = Type.Object({
  pathwayId: Type.String(),
  assignments: Type.Array(MetricsAssignmentEntrySchema),
})
export type DataPathwayMetrics = Static<typeof DataPathwayMetricsSchema>

// ── Health ──

export const DataPathwayHealthSchema: TObject<{
  status: TUnion<[TLiteral<"healthy">, TLiteral<"unhealthy">]>
  checks: TObject<{ db: TUnion<[TLiteral<"ok">, TLiteral<"error">]> }>
  uptime: TNumber
}> = Type.Object({
  status: Type.Union([Type.Literal("healthy"), Type.Literal("unhealthy")]),
  checks: Type.Object({ db: Type.Union([Type.Literal("ok"), Type.Literal("error")]) }),
  uptime: Type.Number(),
})
export type DataPathwayHealth = Static<typeof DataPathwayHealthSchema>

// ── Pump Pulse ──

export const DataPathwayPumpPulseResponseSchema = Type.Object({
  status: Type.String(),
})
export type DataPathwayPumpPulseResponse = Static<typeof DataPathwayPumpPulseResponseSchema>

const PumpPulseEntrySchema = Type.Object({
  flowType: Type.String(),
  timeBucket: Type.String(),
  eventId: Type.Union([Type.String(), Type.Null()]),
  isLive: Type.Boolean(),
  buffer: Type.Object({
    depth: Type.Number(),
    reserved: Type.Number(),
    sizeBytes: Type.Number(),
  }),
  counters: Type.Object({
    acknowledged: Type.Number(),
    failed: Type.Number(),
    pulled: Type.Number(),
  }),
  uptimeMs: Type.Number(),
  lastPulseAgeMs: Type.Number(),
  healthy: Type.Boolean(),
})

const PumpStatusAssignmentSchema = Type.Object({
  id: Type.String(),
  status: Type.String(),
  leaseRemainingMs: Type.Number(),
  lastHeartbeatAgeMs: Type.Number(),
  metrics: Type.Unknown(),
})

export const DataPathwayPumpStatusSchema = Type.Object({
  pathwayId: Type.String(),
  pulses: Type.Array(PumpPulseEntrySchema),
  assignment: Type.Union([PumpStatusAssignmentSchema, Type.Null()]),
})
export type DataPathwayPumpStatus = Static<typeof DataPathwayPumpStatusSchema>
