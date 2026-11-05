import { expect, test } from "bun:test"

test("strict notification transport rejects failed handshakes without URL fallback", async () => {
  const child = Bun.spawn([process.execPath, "test/fixtures/notification-strict.ts"], {
    cwd: `${import.meta.dir}/../../..`,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ])
  expect({ code, stderr }).toEqual({ code: 0, stderr: "" })
  expect(stdout).toContain("strict notification transport passed")
})
