import { assertEquals } from "@test/compat/assert"
import { describe, it } from "bun:test"
import * as sdk from "../../src/mod.ts"

// Keep type-only exports covered: runtime namespace checks cannot see them.
// @ts-expect-error Retired Scenario type.
import type { Scenario } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioCreateInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioDeleteInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioDeleteOutput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioFetchByIdInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioFetchByNameInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioFetchInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioListInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioListOutput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { ScenarioUpdateInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenario } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioAdapterFetchStateInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioAdapterFetchStateOutput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioAdapterKubernetesStatus } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioAdapterKubernetesStatusTypeBox } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioAdapterRestartInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioAdapterRestartOutput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioAdapterState } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioDeleteInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioDeleteOutput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioDeploymentState } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioFetchInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioListInput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioListItem } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioListOutput } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioNode } from "../../src/mod.ts"
// @ts-expect-error Retired Scenario type.
import type { LegacyScenarioNodeType } from "../../src/mod.ts"

type RetiredScenarioContracts =
  | Scenario
  | ScenarioCreateInput
  | ScenarioDeleteInput
  | ScenarioDeleteOutput
  | ScenarioFetchByIdInput
  | ScenarioFetchByNameInput
  | ScenarioFetchInput
  | ScenarioListInput
  | ScenarioListOutput
  | ScenarioUpdateInput
  | LegacyScenario
  | LegacyScenarioAdapterFetchStateInput
  | LegacyScenarioAdapterFetchStateOutput
  | LegacyScenarioAdapterKubernetesStatus
  | LegacyScenarioAdapterKubernetesStatusTypeBox
  | LegacyScenarioAdapterRestartInput
  | LegacyScenarioAdapterRestartOutput
  | LegacyScenarioAdapterState
  | LegacyScenarioDeleteInput
  | LegacyScenarioDeleteOutput
  | LegacyScenarioDeploymentState
  | LegacyScenarioFetchInput
  | LegacyScenarioListInput
  | LegacyScenarioListItem
  | LegacyScenarioListOutput
  | LegacyScenarioNode
  | LegacyScenarioNodeType

describe("public API", () => {
  it("does not export retired scenario commands", () => {
    const retiredExports = Object.keys(sdk).filter((name) => name.toLowerCase().includes("scenario"))

    assertEquals(retiredExports, [])
  })

  it("does not export the retired GraphQL command base", () => {
    assertEquals("GraphQlCommand" in sdk, false)
  })
})

void (undefined as unknown as RetiredScenarioContracts)
