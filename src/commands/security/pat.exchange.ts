import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the PAT create command
 */
export interface SecurityExchangePAT {
  /** The username of the user */
  username: string
  /** The Personal Access Token */
  pat: string
}

export interface SecurityExchangePATResponse {
  /** The token of the PAT */
  accessToken: string
}

/**
 * Exchange a Personal Access Token (PAT) for an access token
 */
export class SecurityExchangePATCommand extends Command<SecurityExchangePAT, SecurityExchangePATResponse> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

  /**
   * Get the method
   */
  protected override getMethod(): string {
    return "GET"
  }
  /**
   * Get the base url
   */
  protected override getBaseUrl(): string {
    return "https://security2.api.flowcore.io"
  }

  protected override getHeaders(): Record<string, string> {
    const headers = super.getHeaders()
    headers["x-flowcore-pat"] = this.input.pat
    return headers
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/pat/exchange/${this.input.username}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): SecurityExchangePATResponse {
    return parseResponseHelper(
      Type.Object({
        accessToken: Type.String(),
      }),
      rawResponse,
    )
  }
}
