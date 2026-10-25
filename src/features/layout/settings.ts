export type LayoutSettingKey = 'watchlistWidth' | 'detailsWidth' | 'chartHeight' | 'watchlistHeight'
export type LayoutSettings = Record<LayoutSettingKey, number>
export const layoutStorageKey = 'meridian-layout-settings-v3'
export const defaultLayoutSettings: LayoutSettings = {
  watchlistWidth: 340,
  detailsWidth: 240,
  chartHeight: 360,
  watchlistHeight: 450,
}
export const layoutRanges: Record<LayoutSettingKey, { min: number; max: number; step: number; label: string }> = {
  watchlistWidth: { min: 220, max: 420, step: 10, label: 'Watchlist' },
  detailsWidth: { min: 210, max: 340, step: 10, label: 'Details' },
  chartHeight: { min: 320, max: 520, step: 10, label: 'Chart' },
  watchlistHeight: { min: 360, max: 680, step: 10, label: 'Rows' },
}

export function clampLayoutValue(key: LayoutSettingKey, value: number) {
  const range = layoutRanges[key]
  if (!Number.isFinite(value)) return defaultLayoutSettings[key]
  return Math.min(range.max, Math.max(range.min, Math.round(value / range.step) * range.step))
}

export function parseLayoutSettings(raw: string | null): LayoutSettings {
  try {
    const parsed = JSON.parse(raw ?? '{}') as Partial<LayoutSettings>
    return {
      watchlistWidth: clampLayoutValue('watchlistWidth', Number(parsed.watchlistWidth)),
      detailsWidth: clampLayoutValue('detailsWidth', Number(parsed.detailsWidth)),
      chartHeight: clampLayoutValue('chartHeight', Number(parsed.chartHeight)),
      watchlistHeight: clampLayoutValue('watchlistHeight', Number(parsed.watchlistHeight)),
    }
  } catch {
    return defaultLayoutSettings
  }
}

