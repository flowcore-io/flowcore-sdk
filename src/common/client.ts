import type { Command } from "./command.ts"

export interface ClientOptions {
    baseUrl?: string
    getAuthToken?: () => Promise<string> | string
}

export class Client {
    private readonly baseUrl: string
    private readonly getAuthToken?: () => Promise<string> | string
    constructor(options: ClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "https://graph.api.flowcore.io/graphql"
        this.getAuthToken = options.getAuthToken
    }

    async execute<Input, Output>(command: Command<Input, Output>): Promise<Output> {
        const request = command.getRequest()
        const authToken = await this.getAuthToken?.()
        const response = await fetch(this.baseUrl + request.path, {
            method: "POST",
            headers: {
                ...request.headers,
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: request.body,
        })
        return await {} as Output
    }
}
