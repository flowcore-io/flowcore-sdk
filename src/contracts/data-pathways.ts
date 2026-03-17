import {
  type Static,
  type TArray,
  type TBoolean,
  type TInteger,
  type TLiteral,
  type TNull,
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

// ── Pathways ──

export const DataPathwaySchema: TObject<{
  id: TString
  tenant: TString
  dataCore: TString
  sizeClass: TSizeClass
  enabled: TBoolean
  priority: TInteger
  version: TInteger
  labels: TStringRecord
  config: TUnknownRecord
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
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
  config: TUnknownRecord
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
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

type TAssignmentNextInner = TObject<{
  assignmentId: TString
  pathwayId: TString
  slotId: TString
  generation: TInteger
  config: TUnknownRecord
  leaseTTL: TString
  status: TString
}>
const AssignmentNextInnerSchema: TAssignmentNextInner = Type.Object({
  assignmentId: Type.String(),
  pathwayId: Type.String(),
  slotId: Type.String(),
  generation: Type.Integer(),
  config: Type.Record(Type.String(), Type.Unknown()),
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

export const DataPathwayRestartRequestResponseSchema: TObject<{
  restartRequestId: TString
  acceptedTargets: TArray<TString>
  skippedTargets: TArray<TString>
}> = Type.Object({
  restartRequestId: Type.String(),
  acceptedTargets: Type.Array(Type.String()),
  skippedTargets: Type.Array(Type.String()),
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
const PendingAssignmentsSchema: TThreeClassIntegers = Type.Object({
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
  pendingAssignments: PendingAssignmentsSchema,
})
export type DataPathwayCapacity = Static<typeof DataPathwayCapacitySchema>

// ── Quotas ──

const MaxSlotsSchema: TThreeClassIntegers = Type.Object({
  small: Type.Integer(),
  medium: Type.Integer(),
  high: Type.Integer(),
})

export const DataPathwayQuotaSchema: TObject<{
  tenant: TString
  maxSlots: TThreeClassIntegers
  createdAt: TString
  updatedAt: TString
}> = Type.Object({
  tenant: Type.String(),
  maxSlots: MaxSlotsSchema,
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
  maxSlots: MaxSlotsSchema,
  used: MaxSlotsSchema,
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
