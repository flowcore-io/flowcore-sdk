import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"
import {
  type EntitlementRequestAccessItem,
  type EntitlementResponse,
  EntitlementResponseSchema,
} from "./resolve-user-entitlements.ts"

export interface ResolveKeyEntitlementsInput {
  keyId: string
  mode: "tenant" | "organization"
  requestedAccess: EntitlementRequestAccessItem[]
}

export class ResolveKeyEntitlementsCommand extends Command<ResolveKeyEntitlementsInput, EntitlementResponse> {
  protected override retryOnFailure = true
  protected override getMethod(): string { return "POST" }
  protected override getBaseUrl(): string { return "https://iam.api.flowcore.io" }
  protected override getPath(): string { return `/api/v1/entitlements/keys/${this.input.keyId}` }
  protected override getBody(): Record<string, unknown> {
    return { mode: this.input.mode, requestedAccess: this.input.requestedAccess }
  }
  protected override parseResponse(rawResponse: unknown): EntitlementResponse {
    return parseResponseHelper(EntitlementResponseSchema, rawResponse)
  }
}
