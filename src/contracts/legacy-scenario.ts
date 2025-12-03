import {
  type Static,
  type TLiteral,
  type TObject,
  type TNull,
  type TOptional,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * Deployment states for Legacy Scenarios
 */
export const LegacyScenarioDeploymentState = {
  // when updating this object remember to update the type too
  NOT_DEPLOYED: "NOT_DEPLOYED",
  DEPLOYED: "DEPLOYED",
  PARTIALLY_DEPLOYED: "PARTIALLY_DEPLOYED",
  DELETING: "DELETING",
} as const

type LegacyScenarioDeploymentStateTypeBox = TUnion<
  [
    TLiteral<typeof LegacyScenarioDeploymentState.NOT_DEPLOYED>,
    TLiteral<typeof LegacyScenarioDeploymentState.DEPLOYED>,
    TLiteral<typeof LegacyScenarioDeploymentState.PARTIALLY_DEPLOYED>,
    TLiteral<typeof LegacyScenarioDeploymentState.DELETING>,
  ]
>

export type LegacyScenarioDeploymentState = Static<LegacyScenarioDeploymentStateTypeBox>

/**
 * Kubernetes statuses for Legacy Scenario adapters
 */
export const LegacyScenarioAdapterKubernetesStatus = {
  // when updating this object remember to update the type too
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  INITIALIZING: "INITIALIZING",
  READY: "READY",
  DELETED: "DELETED",
} as const

export type LegacyScenarioAdapterKubernetesStatusTypeBox = TUnion<
  [
    TLiteral<typeof LegacyScenarioAdapterKubernetesStatus.CREATED>,
    TLiteral<typeof LegacyScenarioAdapterKubernetesStatus.UPDATED>,
    TLiteral<typeof LegacyScenarioAdapterKubernetesStatus.INITIALIZING>,
    TLiteral<typeof LegacyScenarioAdapterKubernetesStatus.READY>,
    TLiteral<typeof LegacyScenarioAdapterKubernetesStatus.DELETED>,
  ]
>

export type LegacyScenarioAdapterKubernetesStatus = Static<LegacyScenarioAdapterKubernetesStatusTypeBox>

/**
 * Node types in Legacy Scenarios
 */
export const LegacyScenarioNodeType = {
  Adapter: "Adapter",
  DataCore: "DataCore",
} as const

export type LegacyScenarioNodeType = (typeof LegacyScenarioNodeType)[keyof typeof LegacyScenarioNodeType]

/**
 * The schema for a Legacy Scenario node
 */
export const LegacyScenarioNodeSchema: TObject<{
  id: TString
  type: TString
  name: TString
  description: TOptional<TString>
  data: TOptional<TString>
  parents: ReturnType<typeof Type.Array<TString>>
  children: ReturnType<typeof Type.Array<TString>>
}> = Type.Object({
  /** Unique identifier for the node */
  id: Type.String(),
  /** Type of the node (Adapter or DataCore) */
  type: Type.String(),
  /** Name of the node */
  name: Type.String(),
  /** Description of the node */
  description: Type.Optional(Type.String()),
  /** Node configuration data as JSON string */
  data: Type.Optional(Type.String()),
  /** Parent node IDs */
  parents: Type.Array(Type.String()),
  /** Child node IDs */
  children: Type.Array(Type.String()),
})

/**
 * The type for a Legacy Scenario node
 */
export type LegacyScenarioNode = Static<typeof LegacyScenarioNodeSchema>

/**
 * The schema for a Legacy Scenario (list view)
 */
export const LegacyScenarioListItemSchema: TObject<{
  id: TString
  name: TString
  description: TOptional<TString>
  flowcoreUserId: TString
  deploymentState: LegacyScenarioDeploymentStateTypeBox
  createdAt: TString
  updatedAt: TString
  lastDeployed: TUnion<[TString, TNull]>
}> = Type.Object({
  /** Unique identifier for the scenario */
  id: Type.String(),
  /** Name of the scenario */
  name: Type.String(),
  /** Description of the scenario */
  description: Type.Optional(Type.String()),
  /** ID of the user who created the scenario */
  flowcoreUserId: Type.String(),
  /** Current deployment state */
  deploymentState: Type.Union([
    Type.Literal(LegacyScenarioDeploymentState.NOT_DEPLOYED),
    Type.Literal(LegacyScenarioDeploymentState.DEPLOYED),
    Type.Literal(LegacyScenarioDeploymentState.PARTIALLY_DEPLOYED),
    Type.Literal(LegacyScenarioDeploymentState.DELETING),
  ]),
  /** Creation timestamp */
  createdAt: Type.String(),
  /** Last update timestamp */
  updatedAt: Type.String(),
  /** Last deployment timestamp */
  lastDeployed: Type.Union([Type.String(), Type.Null()]),
})

/**
 * The type for a Legacy Scenario list item
 */
export type LegacyScenarioListItem = Static<typeof LegacyScenarioListItemSchema>

/**
 * The schema for a Legacy Scenario (full view with nodes)
 */
export const LegacyScenarioSchema: TObject<{
  id: TString
  name: TString
  description: TOptional<TString>
  flowcoreUserId: TString
  organizationId: TString
  deploymentState: TString
  createdAt: TString
  updatedAt: TString
  nodes: ReturnType<typeof Type.Array<typeof LegacyScenarioNodeSchema>>
}> = Type.Object({
  /** Unique identifier for the scenario */
  id: Type.String(),
  /** Name of the scenario */
  name: Type.String(),
  /** Description of the scenario */
  description: Type.Optional(Type.String()),
  /** ID of the user who created the scenario */
  flowcoreUserId: Type.String(),
  /** ID of the organization that owns this scenario */
  organizationId: Type.String(),
  /** Current deployment state */
  deploymentState: Type.String(),
  /** Creation timestamp */
  createdAt: Type.String(),
  /** Last update timestamp */
  updatedAt: Type.String(),
  /** Nodes in the scenario */
  nodes: Type.Array(LegacyScenarioNodeSchema),
})

/**
 * The type for a Legacy Scenario
 */
export type LegacyScenario = Static<typeof LegacyScenarioSchema>

/**
 * The schema for adapter state
 */
export const LegacyScenarioAdapterStateSchema: TObject<{
  kubernetes: TObject<{
    status: LegacyScenarioAdapterKubernetesStatusTypeBox
  }>
}> = Type.Object({
  kubernetes: Type.Object({
    status: Type.Union([
      Type.Literal(LegacyScenarioAdapterKubernetesStatus.CREATED),
      Type.Literal(LegacyScenarioAdapterKubernetesStatus.UPDATED),
      Type.Literal(LegacyScenarioAdapterKubernetesStatus.INITIALIZING),
      Type.Literal(LegacyScenarioAdapterKubernetesStatus.READY),
      Type.Literal(LegacyScenarioAdapterKubernetesStatus.DELETED),
    ]),
  }),
})

/**
 * The type for adapter state
 */
export type LegacyScenarioAdapterState = Static<typeof LegacyScenarioAdapterStateSchema>
