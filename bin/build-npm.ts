// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt"
import denoJson from "../deno.json" with { type: "json" }
await emptyDir("./npm")

await build({
  entryPoints: ["./src/mod.ts"],
  test: false,
  outDir: "./npm",
  importMap: "./deno.json",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    name: denoJson.name,
    description: denoJson.description,
    version: denoJson.version,
    license: denoJson.license,
    repository: {
      type: "git",
      url: "git+https://github.com/flowcore-io/flowcore-sdk.git",
    },
    bugs: {
      url: "https://github.com/flowcore-io/flowcore-sdk/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    // Deno.copyFileSync("LICENSE", "npm/LICENSE")
    Deno.copyFileSync("README.md", "npm/README.md")
    Deno.copyFileSync("CHANGELOG.md", "npm/CHANGELOG.md")
  },
})
