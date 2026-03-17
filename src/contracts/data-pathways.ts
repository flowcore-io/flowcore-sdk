import { type Static, Type } from "@sinclair/typebox"

// ── Shared types ──

const SizeClassEnum = Type.Union([Type.Literal("small"), Type.Literal("medium"), Type.Literal("high")])


// ── Config building blocks ──

const EndpointConfigSchema = Type.Object({
  url: Type.String(),
  authHeaders: Type.Optional(Type.Record(Type.String(), Type.String())),
})

const BackoffConfigSchema = Type.Optional(
  Type.Object({
    initialMs: Type.Optional(Type.Integer()),
    maxMs: Type.Optional(Type.Integer()),
    multiplier: Type.Optional(Type.Number()),
  }),
)

const TimeoutConfigSchema = Type.Optional(
  Type.Object({
    deliveryMs: Type.Optional(Type.Integer()),
    fetchMs: Type.Optional(Type.Integer()),
  }),
)

const SourceConfigSchema = Type.Object({
  flowType: Type.String(),
  eventTypes: Type.Array(Type.String()),
  endpoints: Type.Array(EndpointConfigSchema),
  batchSize: Type.Optional(Type.Integer()),
  maxInFlight: Type.Optional(Type.Integer()),
  backoff: BackoffConfigSchema,
  timeouts: TimeoutConfigSchema,
})

const DataSourceConfigSchema = Type.Object({
  tenant: Type.String(),
  dataCore: Type.String(),
})

const AuthConfigSchema = Type.Object({
  apiKey: Type.String(),
})

/** User-facing pathway config — what the API accepts on create/update */
export const PathwayConfigSchema = Type.Object({
  sources: Type.Array(SourceConfigSchema),
})
export type PathwayConfig = Static<typeof PathwayConfigSchema>

/** Rendered pump config — what the worker receives (CP injects dataSource + auth) */
export const PumpConfigSchema = Type.Object({
  sources: Type.Array(SourceConfigSchema),
  dataSource: DataSourceConfigSchema,
  auth: Type.Optional(AuthConfigSchema),
})
export type PumpConfig = Static<typeof PumpConfigSchema>

// ── Pathways ──

export const DataPathwaySchema = Type.Object({
  id: Type.String(),
  tenant: Type.String(),
  dataCore: Type.String(),
  sizeClass: SizeClassEnum,
  enabled: Type.Boolean(),
  priority: Type.Integer(),
  version: Type.Integer(),
  labels: Type.Record(Type.String(), Type.String()),
  config: Type.Optional(PathwayConfigSchema),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathway = Static<typeof DataPathwaySchema>

export const DataPathwayListSchema = Type.Object({
  pathways: Type.Array(DataPathwaySchema),
  total: Type.Integer(),
})
export type DataPathwayList = Static<typeof DataPathwayListSchema>

export const DataPathwayMutationResponseSchema = Type.Object({
  pathwayId: Type.String(),
  status: Type.String(),
})
export type DataPathwayMutationResponse = Static<typeof DataPathwayMutationResponseSchema>

// ── Slots ──

export const DataPathwaySlotSchema = Type.Object({
  id: Type.String(),
  podUnitId: Type.String(),
  class: SizeClassEnum,
  labels: Type.Record(Type.String(), Type.String()),
  lastSeen: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwaySlot = Static<typeof DataPathwaySlotSchema>

export const DataPathwaySlotListSchema = Type.Object({
  slots: Type.Array(DataPathwaySlotSchema),
  total: Type.Integer(),
})
export type DataPathwaySlotList = Static<typeof DataPathwaySlotListSchema>

export const DataPathwaySlotMutationResponseSchema = Type.Object({
  slotId: Type.String(),
  status: Type.String(),
})
export type DataPathwaySlotMutationResponse = Static<typeof DataPathwaySlotMutationResponseSchema>

// ── Assignments ──

export const DataPathwayAssignmentSchema = Type.Object({
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

const AssignmentNextInnerSchema = Type.Object({
  assignmentId: Type.String(),
  pathwayId: Type.String(),
  slotId: Type.String(),
  generation: Type.Integer(),
  config: PumpConfigSchema,
  leaseTTL: Type.String(),
  status: Type.String(),
})

export const DataPathwayAssignmentNextSchema = Type.Object({
  assignment: Type.Union([AssignmentNextInnerSchema, Type.Null()]),
})
export type DataPathwayAssignmentNext = Static<typeof DataPathwayAssignmentNextSchema>

export const DataPathwayAssignmentListSchema = Type.Object({
  assignments: Type.Array(DataPathwayAssignmentSchema),
  total: Type.Integer(),
})
export type DataPathwayAssignmentList = Static<typeof DataPathwayAssignmentListSchema>

export const DataPathwayExpireLeasesResponseSchema = Type.Object({
  expired: Type.Integer(),
})
export type DataPathwayExpireLeasesResponse = Static<typeof DataPathwayExpireLeasesResponseSchema>

// ── Commands ──

export const DataPathwayCommandSchema = Type.Object({
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

export const DataPathwayCommandListSchema = Type.Object({
  commands: Type.Array(DataPathwayCommandSchema),
})
export type DataPathwayCommandList = Static<typeof DataPathwayCommandListSchema>

export const DataPathwayCommandResponseSchema = Type.Object({
  commandId: Type.String(),
  phase: Type.String(),
})
export type DataPathwayCommandResponse = Static<typeof DataPathwayCommandResponseSchema>

// ── Restarts ──

export const DataPathwayRestartRequestResponseSchema = Type.Object({
  restartRequestId: Type.String(),
  acceptedTargets: Type.Array(Type.String()),
  skippedTargets: Type.Array(Type.String()),
})
export type DataPathwayRestartRequestResponse = Static<typeof DataPathwayRestartRequestResponseSchema>

export const DataPathwayRestartRequestSchema = Type.Object({
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

const SlotCountSchema = Type.Object({
  free: Type.Integer(),
  used: Type.Integer(),
})

const ThreeClassIntegersSchema = Type.Object({
  small: Type.Integer(),
  medium: Type.Integer(),
  high: Type.Integer(),
})

export const DataPathwayCapacitySchema = Type.Object({
  slots: Type.Object({
    small: SlotCountSchema,
    medium: SlotCountSchema,
    high: SlotCountSchema,
  }),
  pendingAssignments: ThreeClassIntegersSchema,
})
export type DataPathwayCapacity = Static<typeof DataPathwayCapacitySchema>

// ── Quotas ──

export const DataPathwayQuotaSchema = Type.Object({
  tenant: Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwayQuota = Static<typeof DataPathwayQuotaSchema>

export const DataPathwayQuotaWithUsageSchema = Type.Object({
  tenant: Type.String(),
  maxSlots: ThreeClassIntegersSchema,
  used: ThreeClassIntegersSchema,
})
export type DataPathwayQuotaWithUsage = Static<typeof DataPathwayQuotaWithUsageSchema>

export const DataPathwayQuotaListSchema = Type.Object({
  quotas: Type.Array(DataPathwayQuotaSchema),
  total: Type.Integer(),
})
export type DataPathwayQuotaList = Static<typeof DataPathwayQuotaListSchema>

export const DataPathwayQuotaSetResponseSchema = Type.Object({
  tenant: Type.String(),
  status: Type.String(),
})
export type DataPathwayQuotaSetResponse = Static<typeof DataPathwayQuotaSetResponseSchema>

// ── Pump State ──

const PumpStateValueSchema = Type.Object({
  timeBucket: Type.String(),
  eventId: Type.Optional(Type.String()),
})

export const DataPathwayPumpStateSchema = Type.Object({
  assignmentId: Type.String(),
  state: Type.Union([PumpStateValueSchema, Type.Null()]),
})
export type DataPathwayPumpState = Static<typeof DataPathwayPumpStateSchema>

export const DataPathwayPumpStateSaveResponseSchema = Type.Object({
  status: Type.String(),
})
export type DataPathwayPumpStateSaveResponse = Static<typeof DataPathwayPumpStateSaveResponseSchema>
