import { scheduleSearch } from './search-request'
import { useEffect, useState, type KeyboardEvent } from 'react'
import type { SymbolRecord } from '../../types/market'

// Owns search interaction state; market selection stays with the caller.
export function useSymbolSearch(
  searchSymbols: (query: string) => Promise<SymbolRecord[]>,
  setSelectedSymbol: (symbol: string) => void,
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SymbolRecord[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [activeResultIndex, setActiveResultIndex] = useState(0)
  const [selectedSearchRecord, setSelectedSearchRecord] = useState<SymbolRecord | null>(null)
  useEffect(() => scheduleSearch(query, searchSymbols, {
    success: (items) => {
      setResults(items)
      setActiveResultIndex(0)
      setSearchError(null)
    },
    failure: (reason) => {
      setResults([])
      setSearchError(reason instanceof Error ? reason.message : 'Symbol search failed')
    },
    complete: () => setIsSearchLoading(false),
  }), [query, searchSymbols])

  const selectSearchResult = (item: SymbolRecord) => {
    setSelectedSearchRecord(item)
    setSelectedSymbol(item.symbol)
    setQuery('')
    setResults([])
    setSearchError(null)
    setIsSearchLoading(false)
    setIsSearchOpen(false)
    setActiveResultIndex(0)
  }

  const activeResult = results[activeResultIndex] ?? results[0]

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setResults([])
    setSearchError(null)
    setActiveResultIndex(0)

    if (!value.trim()) {
      setResults([])
      setIsSearchLoading(false)
      setIsSearchOpen(false)
      return
    }

    setIsSearchOpen(true)
    setIsSearchLoading(true)
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen && event.key !== 'Escape') setIsSearchOpen(true)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveResultIndex((current) =>
        results.length ? (current + 1) % results.length : 0,
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveResultIndex((current) =>
        results.length ? (current - 1 + results.length) % results.length : 0,
      )
      return
    }

    if (event.key === 'Enter' && activeResult) {
      event.preventDefault()
      selectSearchResult(activeResult)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setQuery('')
      setResults([])
      setSearchError(null)
      setIsSearchLoading(false)
      setIsSearchOpen(false)
    }
  }

  return {
    query, results, isSearchOpen, isSearchLoading, searchError,
    activeResultIndex, selectedSearchRecord, setSelectedSearchRecord, setIsSearchOpen,
    setActiveResultIndex, selectSearchResult, handleSearchChange, handleSearchKeyDown,
  }
}
