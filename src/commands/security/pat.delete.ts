import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type PAT, PATSchema } from "../../contracts/pat.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the PAT delete command
 */
export interface SecurityDeletePAT {
  /** The id of the PAT */
  id: string
}

export interface SecurityDeletePATResponse {
  success: boolean
}

/**
 * Delete a Personal Access Token (PAT)
 */
export class SecurityDeletePATCommand extends Command<SecurityDeletePAT, SecurityDeletePATResponse> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "DELETE"
  }
  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://security2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/pat/${this.input.id}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): SecurityDeletePATResponse {
    return parseResponseHelper(
      Type.Object({
        success: Type.Boolean(),
      }),
      rawResponse,
    )
  }
}
