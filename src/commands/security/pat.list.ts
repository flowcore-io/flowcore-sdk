import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { type PAT, PATSchema } from "../../contracts/pat.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

/**
 * List all your Personal Access Token (PAT)
 */
export class SecurityListPATCommand extends Command<void, PAT[]> {
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
    return `/api/v1/pat`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): PAT[] {
    return parseResponseHelper(Type.Array(PATSchema), rawResponse)
  }
}
