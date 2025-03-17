import { Command } from "../../common/command.ts"
import { type PAT, PATSchema } from "../../contracts/pat.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * The input for the PAT get command
 */
export interface SecurityGetPAT {
  /** The id of the PAT */
  id: string
}

/**
 * Get a Personal Access Token (PAT)
 */
export class SecurityGetPATCommand extends Command<SecurityGetPAT, PAT> {
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

  /**
   * Get the path
   */
  protected override getPath(): string {
    return `/api/v1/pat/${this.input.id}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): PAT {
    return parseResponseHelper(PATSchema, rawResponse)
  }
}
