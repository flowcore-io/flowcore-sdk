import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import { PolicyFilterSchema } from "../policy-filters.ts"
import { type Static, Type } from "@sinclair/typebox"

export interface EntitlementRequestAccessItem {
  action: string | string[]
  resource: string[]
}

export const EntitlementResponseSchema = Type.Object({
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
          filters: Type.Optional(Type.Array(PolicyFilterSchema)),
        }),
      ),
    }),
  ),
})

export type EntitlementResponse = Static<typeof EntitlementResponseSchema>

export interface ResolveUserEntitlementsInput {
  userId: string
  mode: "tenant" | "organization"
  requestedAccess: EntitlementRequestAccessItem[]
}

export class ResolveUserEntitlementsCommand extends Command<ResolveUserEntitlementsInput, EntitlementResponse> {
  protected override retryOnFailure = true
  protected override getMethod(): string { return "POST" }
  protected override getBaseUrl(): string { return "https://iam.api.flowcore.io" }
  protected override getPath(): string { return `/api/v1/entitlements/users/${this.input.userId}` }
  protected override getBody(): Record<string, unknown> {
    return { mode: this.input.mode, requestedAccess: this.input.requestedAccess }
  }
  protected override parseResponse(rawResponse: unknown): EntitlementResponse {
    return parseResponseHelper(EntitlementResponseSchema, rawResponse)
  }
}
