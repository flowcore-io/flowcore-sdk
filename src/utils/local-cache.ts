export class LocalCache<T> {
  private cache: Map<string, T> = new Map()
  // deno-lint-ignore no-explicit-any
  private timers: Map<string, any> = new Map()

  constructor(private readonly defaultTtlMs?: number) {}

  get(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: T, ttlMs?: number) {
    clearTimeout(this.timers.get(key))
    this.cache.set(key, value)
    if (ttlMs ?? this.defaultTtlMs) {
      const timer = setTimeout(() => this.cache.delete(key), ttlMs ?? this.defaultTtlMs)
      this.timers.set(key, timer)
    }
  }

  delete(key: string) {
    clearTimeout(this.timers.get(key))
    this.cache.delete(key)
  }

  clear() {
    for (const key of this.timers.keys()) {
      clearTimeout(this.timers.get(key))
    }
    this.cache.clear()
    this.timers.clear()
  }
}
