import { Command } from "../../common/command.ts"
import { type PAT, PATSchema } from "../../contracts/pat.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the PAT create command
 */
export interface SecurityCreatePAT {
  /** The name of the PAT */
  name: string
  /** The description of the PAT */
  description?: string
}

/**
 * Create a Personal Access Token (PAT)
 */
export class SecurityCreatePATCommand extends Command<SecurityCreatePAT, PAT> {
  /**
   * Whether the command should retry on failure
   */
  protected override retryOnFailure: boolean = false

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
    return "https://security2.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/pat`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): PAT {
    return parseResponseHelper(PATSchema, rawResponse)
  }
}
