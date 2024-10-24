#! /bin/sh

deno run --allow-read --allow-write bin/publish.ts

deno publish --allow-dirty
