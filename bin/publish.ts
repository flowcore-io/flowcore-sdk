import { format, increment, parse } from "@std/semver"

const denoJson = JSON.parse(Deno.readTextFileSync("./deno.json"))

const version = increment(parse(denoJson.version), "patch")

console.log(format(version))

denoJson.version = format(version)

Deno.writeTextFileSync("./deno.json", JSON.stringify(denoJson, null, 2))
