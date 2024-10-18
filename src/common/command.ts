export abstract class Command<Input, Output> {
    public readonly input: Input
    private output?: Output

    constructor(input: Input) {
        this.output = undefined
        this.input = input
    }

    protected getPath(): string {
        return "/"
    }

    protected getBody(): string {
        return ""
    }

    protected getHeaders(): Record<string, string> {
        return {
            "Content-Type": "application/json",
        }
    }

    public getRequest() {
        return {
            body: this.getBody(),
            headers: this.getHeaders(),
            path: this.getPath(),
        }
    }
}
