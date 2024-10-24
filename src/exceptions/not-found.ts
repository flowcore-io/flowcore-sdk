export class NotFoundException extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
  }
}
