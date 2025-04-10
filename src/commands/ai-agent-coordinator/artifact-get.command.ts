import { Type } from "@sinclair/typebox"
import { Command } from "../../common/command.ts"
import { ClientError } from "../../exceptions/client-error.ts"
import { NotFoundException } from "../../exceptions/not-found.ts"
import { parseResponseHelper } from "../../utils/parse-response-helper.ts"

export interface ArtifactGetCommandInput {
  artifactId: string
}

/**
 * Represents the structure of the artifact returned by the API.
 * Based on the Swagger spec example.
 */
const ArtifactSchema = Type.Object({
  artifactId: Type.String({ example: "artifact_code_123" }),
  artifactType: Type.Union([
    Type.Literal("code"),
    Type.Literal("markdown"),
    Type.Literal("table"),
    Type.Literal("visualization"),
    Type.Literal("html"),
    Type.Literal("mermaid"),
  ], { description: "Type of artifact" }),
  title: Type.String({ example: "Example Code Snippet" }),
  content: Type.Optional(Type.String({ description: "String content" })),
  data: Type.Optional(Type.Unknown({ description: "JSON data" })),
  url: Type.Optional(Type.String({ format: "uri", description: "URL content" })),
})

export type Artifact = typeof ArtifactSchema.static

export class ArtifactGetCommand extends Command<ArtifactGetCommandInput, Artifact> {
  protected override getMethod(): string {
    return "GET"
  }

  protected override getBaseUrl(): string {
    // Assuming the coordinator uses this base URL, adjust if needed
    return "https://ai-coordinator.api.flowcore.io"
  }

  protected override getPath(): string {
    return `/api/v1/artifacts/${this.input.artifactId}`
  }

  protected override getHeaders(): Record<string, string> {
    // GET requests typically don't need Content-Type
    // Authorization header is handled by the FlowcoreClient
    return {
      "Accept": "application/json",
    }
  }

  protected override parseResponse(rawResponse: unknown): Artifact {
    const response = parseResponseHelper(ArtifactSchema, rawResponse)
    return response
  }

  protected override handleClientError(error: ClientError): void {
    if (error.status === 404) {
      throw new NotFoundException("Artifact", { id: this.input.artifactId })
    }
    throw error
  }
} 