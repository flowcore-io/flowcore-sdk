import assert from "node:assert/strict"
import { expect } from "bun:test"

export function assertEquals<T>(actual: T, expected: T, msg?: string): void {
  assert.deepStrictEqual(actual, expected, msg)
}

export function assertExists<T>(actual: T, msg?: string): asserts actual is NonNullable<T> {
  assert.notStrictEqual(actual, null, msg)
  assert.notStrictEqual(actual, undefined, msg)
}

export function assertInstanceOf<T>(
  actual: unknown,
  expectedType: new (...args: any[]) => T,
  msg?: string,
): asserts actual is T {
  assert.ok(actual instanceof expectedType, msg)
}

export function assertObjectMatch(actual: unknown, expected: Record<string, unknown>, msg?: string): void {
  try {
    expect(actual).toMatchObject(expected)
  } catch (error) {
    if (msg) {
      throw new assert.AssertionError({
        message: msg,
        actual,
        expected,
      })
    }
    throw error
  }
}

export function assertArrayIncludes<T>(actual: T[], expected: T[], msg?: string): void {
  for (const expectedItem of expected) {
    const found = actual.some((actualItem) => {
      try {
        assert.deepStrictEqual(actualItem, expectedItem)
        return true
      } catch {
        return false
      }
    })
    assert.ok(found, msg ?? `Expected array to include ${JSON.stringify(expectedItem)}`)
  }
}

export async function assertRejects(
  fn: () => Promise<unknown> | unknown,
  expectedError?: new (...args: any[]) => Error,
  msgIncludes?: string,
): Promise<Error> {
  try {
    await fn()
  } catch (error) {
    if (expectedError) {
      assert.ok(error instanceof expectedError, `Expected ${expectedError.name}, got ${error?.constructor?.name}`)
    }
    if (msgIncludes) {
      assert.ok(error instanceof Error, "Rejected value must be an Error")
      assert.ok(error.message.includes(msgIncludes), `Expected error message to include ${msgIncludes}`)
    }
    return error as Error
  }

  throw new assert.AssertionError({
    message: "Expected function to reject",
  })
}

export function fail(msg = "Failed assertion"): never {
  throw new assert.AssertionError({ message: msg })
}
