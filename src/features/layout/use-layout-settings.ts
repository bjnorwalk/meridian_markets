import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { clampLayoutValue, defaultLayoutSettings, layoutStorageKey, parseLayoutSettings, type LayoutSettingKey, type LayoutSettings } from './settings'

function readLayoutSettings(): LayoutSettings {
  try {
    return typeof window === 'undefined' ? defaultLayoutSettings : parseLayoutSettings(window.localStorage?.getItem(layoutStorageKey) ?? null)
  } catch {
    return defaultLayoutSettings
  }
}

export function useLayoutSettings() {
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(readLayoutSettings)

  useEffect(() => {
    try {
      window.localStorage?.setItem(layoutStorageKey, JSON.stringify(layoutSettings))
    } catch {
      // Layout persistence is optional; the controls still work for the current session.
    }
  }, [layoutSettings])

  const layoutStyle = useMemo(
    () => ({
      '--layout-watchlist-width': `${layoutSettings.watchlistWidth}px`,
      '--layout-details-width': `${layoutSettings.detailsWidth}px`,
      '--layout-chart-height': `${layoutSettings.chartHeight}px`,
      '--layout-watchlist-height': `${layoutSettings.watchlistHeight}px`,
    }) as CSSProperties,
    [layoutSettings],
  )

  const updateLayoutSetting = (key: LayoutSettingKey, value: string) => {
    setLayoutSettings((current) => ({
      ...current,
      [key]: clampLayoutValue(key, Number(value)),
    }))
  }

  const resetLayoutSettings = () => {
    setLayoutSettings(defaultLayoutSettings)
  }

  return { layoutSettings, layoutStyle, updateLayoutSetting, resetLayoutSettings }
}
