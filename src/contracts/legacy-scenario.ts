import {
  type Static,
  type TLiteral,
  type TObject,
  type TOptional,
  type TString,
  type TUnion,
  Type,
} from "@sinclair/typebox"

/**
 * Deployment states for Legacy Scenarios
 */
export const LegacyScenarioDeploymentState = {
  NOT_DEPLOYED: "NOT_DEPLOYED",
  DEPLOYED: "DEPLOYED",
  PARTIALLY_DEPLOYED: "PARTIALLY_DEPLOYED",
  DELETING: "DELETING",
  DELETIN: "DELETING",
} as const

export type LegacyScenarioDeploymentState = TUnion<
  [
    TLiteral<typeof LegacyScenarioDeploymentState.NOT_DEPLOYED>,
    TLiteral<typeof LegacyScenarioDeploymentState.DEPLOYED>,
    TLiteral<typeof LegacyScenarioDeploymentState.PARTIALLY_DEPLOYED>,
    TLiteral<typeof LegacyScenarioDeploymentState.DELETING>,
  ]
>

/**
 * Kubernetes statuses for Legacy Scenario adapters
 */
export const LegacyScenarioAdapterKubernetesStatus = {
  RUNNING: "RUNNING",
  PENDING: "PENDING",
  FAILED: "FAILED",
  NOT_DEPLOYED: "NOT_DEPLOYED",
} as const

export type LegacyScenarioAdapterKubernetesStatus =
  (typeof LegacyScenarioAdapterKubernetesStatus)[keyof typeof LegacyScenarioAdapterKubernetesStatus]

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
  deploymentState: LegacyScenarioDeploymentState,
  createdAt: TString
  updatedAt: TString
  lastDeployed: TOptional<TString>
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
  lastDeployed: Type.Optional(Type.String()),
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
    status: TString
  }>
}> = Type.Object({
  kubernetes: Type.Object({
    status: Type.String(),
  }),
})

/**
 * The type for adapter state
 */
export type LegacyScenarioAdapterState = Static<typeof LegacyScenarioAdapterStateSchema>
