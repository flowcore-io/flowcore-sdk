import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    index: "src/mod.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2022",
  platform: "node",
  splitting: false,
  treeshake: true,
  external: ["@sinclair/typebox", "@sinclair/typebox/value", "rxjs", "ws"],
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    }
  },
})
