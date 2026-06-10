export type Stub<T = (...args: any[]) => any, A extends any[] = T extends (...args: infer Args) => any ? Args : any[]> =
  (T extends (...args: any[]) => infer Return ? (...args: A) => Return : (...args: A) => unknown) & {
  calls: Array<{
    args: A
    returned?: T extends (...args: any[]) => infer Return ? Return : unknown
    error?: unknown
  }>
  restore(): void
}

export function stub<T extends object, K extends keyof T>(
  object: T,
  method: K,
  replacement?: T[K] extends (...args: any[]) => any ? T[K] : never,
): T[K] extends (...args: any[]) => any ? Stub<T[K]> : never {
  const original = object[method]
  if (typeof original !== "function") {
    throw new TypeError(`Cannot stub non-function property ${String(method)}`)
  }

  const calls: Stub["calls"] = []
  const stubbed = function (this: unknown, ...args: unknown[]) {
    try {
      const returned = typeof replacement === "function"
        ? replacement.apply(this, args)
        : original.apply(this, args)
      calls.push({ args: args as any[], returned })
      return returned
    } catch (error) {
      calls.push({ args: args as any[], error })
      throw error
    }
  } as Stub

  stubbed.calls = calls
  stubbed.restore = () => {
    object[method] = original
  }

  object[method] = stubbed as T[K]
  return stubbed as T[K] extends (...args: any[]) => any ? Stub<T[K]> : never
}
