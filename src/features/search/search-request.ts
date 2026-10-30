import type { SymbolRecord } from '../../types/market.ts'

type SearchCallbacks = {
  success: (items: SymbolRecord[]) => void
  failure: (reason: unknown) => void
  complete: () => void
}

// Cleanup cancels a pending debounce and ignores an already-started request.
export function scheduleSearch(
  query: string,
  search: (query: string) => Promise<SymbolRecord[]>,
  callbacks: SearchCallbacks,
) {
  let active = true
  const trimmed = query.trim()
  const timer = trimmed ? setTimeout(() => {
    search(trimmed)
      .then((items) => { if (active) callbacks.success(items.slice(0, 12)) })
      .catch((reason: unknown) => { if (active) callbacks.failure(reason) })
      .finally(() => { if (active) callbacks.complete() })
  }, 120) : undefined
  return () => {
    active = false
    clearTimeout(timer)
  }
}
