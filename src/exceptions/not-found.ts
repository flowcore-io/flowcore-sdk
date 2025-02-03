/**
 * An error thrown when a resource is not found
 */
export class NotFoundException extends Error {
  constructor(resource: string, filters: Record<string, string>) {
    super(`${resource} not found: ${JSON.stringify(filters)}`)
  }
}
