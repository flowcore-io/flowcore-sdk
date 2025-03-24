import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"
import { type Permission, PermissionSchema } from "../../contracts/permission.ts"

export interface PermissionsListInput {
  /** Filter by the type of the frn */
  type?: string
}

/**
 * Fetch an event type
 */
export class PermissionsListCommand extends Command<PermissionsListInput, Permission[]> {
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
    return "https://iam.api.flowcore.io"
  }

  /**
   * Get the path
   */
  protected override getPath(): string {
    const queryParams = new URLSearchParams()
    if (this.input.type) {
      queryParams.set("type", this.input.type)
    }
    return `/api/v1/permissions?${queryParams.toString()}`
  }

  /**
   * Parse the response
   */
  protected override parseResponse(rawResponse: unknown): Permission[] {
    const response = parseResponseHelper(Type.Array(PermissionSchema), rawResponse)
    return response
  }
}
