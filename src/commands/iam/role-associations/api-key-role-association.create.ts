import { type Static, type TObject, type TString, Type } from "@sinclair/typebox"
import { Command } from "../../../common/command.ts"
import { parseResponseHelper } from "../../../utils/parse-response-helper.ts"

/**
 * The input for the api key role associations create command
 */
export interface ApiKeyRoleAssociationCreateInput {
  /** the api key id */
  apiKeyId: string
  /** the role id */
  roleId: string
}

/**
 * The response for the api key role associations create command
 */
const responseSchema: TObject<{
  roleId: TString
  organizationId: TString
  keyId: TString
}> = Type.Object({
  roleId: Type.String(),
  organizationId: Type.String(),
  keyId: Type.String(),
})

type ApiKeyRoleAssociationCreateOutput = Omit<Static<typeof responseSchema>, "keyId"> & {
  apiKeyId: string
}

/**
 * Create a api key role association
 */
export class ApiKeyRoleAssociationCreateCommand
  extends Command<ApiKeyRoleAssociationCreateInput, ApiKeyRoleAssociationCreateOutput> {
  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "POST"
  }

  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/role-associations/key/${this.input.apiKeyId}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): ApiKeyRoleAssociationCreateOutput {
    const { keyId, ...rest } = parseResponseHelper(responseSchema, rawResponse)
    return {
      ...rest,
      apiKeyId: keyId,
    }
  }
}
