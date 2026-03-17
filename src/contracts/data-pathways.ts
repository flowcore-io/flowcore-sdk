import { type Static, Type } from "@sinclair/typebox"

// ── Enums ──

const SizeClassEnum = Type.Union([Type.Literal("small"), Type.Literal("medium"), Type.Literal("high")])
const AssignmentStatusEnum = Type.Union([
  Type.Literal("active"),
  Type.Literal("completed"),
  Type.Literal("failed"),
  Type.Literal("revoked"),
  Type.Literal("expired"),
])
const CommandPhaseEnum = Type.Union([
  Type.Literal("dispatched"),
  Type.Literal("acknowledged"),
  Type.Literal("restarting"),
  Type.Literal("running"),
  Type.Literal("failed"),
  Type.Literal("timedOut"),
])

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
  config: Type.Record(Type.String(), Type.Unknown()),
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
  config: Type.Record(Type.String(), Type.Unknown()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwayAssignment = Static<typeof DataPathwayAssignmentSchema>

export const DataPathwayAssignmentNextSchema = Type.Object({
  assignment: Type.Union([
    Type.Object({
      assignmentId: Type.String(),
      pathwayId: Type.String(),
      slotId: Type.String(),
      generation: Type.Integer(),
      config: Type.Record(Type.String(), Type.Unknown()),
      leaseTTL: Type.String(),
      status: Type.String(),
    }),
    Type.Null(),
  ]),
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

export const DataPathwayCapacitySchema = Type.Object({
  slots: Type.Object({
    small: SlotCountSchema,
    medium: SlotCountSchema,
    high: SlotCountSchema,
  }),
  pendingAssignments: Type.Object({
    small: Type.Integer(),
    medium: Type.Integer(),
    high: Type.Integer(),
  }),
})
export type DataPathwayCapacity = Static<typeof DataPathwayCapacitySchema>

// ── Quotas ──

const MaxSlotsSchema = Type.Object({
  small: Type.Integer(),
  medium: Type.Integer(),
  high: Type.Integer(),
})

export const DataPathwayQuotaSchema = Type.Object({
  tenant: Type.String(),
  maxSlots: MaxSlotsSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type DataPathwayQuota = Static<typeof DataPathwayQuotaSchema>

export const DataPathwayQuotaWithUsageSchema = Type.Object({
  tenant: Type.String(),
  maxSlots: MaxSlotsSchema,
  used: MaxSlotsSchema,
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

export const DataPathwayPumpStateSchema = Type.Object({
  assignmentId: Type.String(),
  state: Type.Union([
    Type.Object({
      timeBucket: Type.String(),
      eventId: Type.Optional(Type.String()),
    }),
    Type.Null(),
  ]),
})
export type DataPathwayPumpState = Static<typeof DataPathwayPumpStateSchema>

export const DataPathwayPumpStateSaveResponseSchema = Type.Object({
  status: Type.String(),
})
export type DataPathwayPumpStateSaveResponse = Static<typeof DataPathwayPumpStateSaveResponseSchema>
