import { RotateCcw } from 'lucide-react'
import { layoutRanges, type LayoutSettingKey, type LayoutSettings } from './settings'

type Props = {
  layoutSettings: LayoutSettings
  updateLayoutSetting: (key: LayoutSettingKey, value: string) => void
  resetLayoutSettings: () => void
}

export function LayoutPanel({ layoutSettings, updateLayoutSetting, resetLayoutSettings }: Props) {
  return (
        <section className="layout-panel" aria-label="Layout controls">
          <div className="layout-panel-heading">
            <span>Layout</span>
            <small>{layoutSettings.watchlistWidth}/{layoutSettings.detailsWidth}</small>
          </div>
          {(Object.keys(layoutRanges) as LayoutSettingKey[]).map((key) => {
            const range = layoutRanges[key]
            return (
              <label className="layout-control" key={key}>
                <span>{range.label}</span>
                <input
                  aria-label={`${range.label} size`}
                  max={range.max}
                  min={range.min}
                  onChange={(event) => updateLayoutSetting(key, event.target.value)}
                  onInput={(event) => updateLayoutSetting(key, event.currentTarget.value)}
                  step={range.step}
                  type="range"
                  value={layoutSettings[key]}
                />
                <em>{layoutSettings[key]}</em>
              </label>
            )
          })}
          <button aria-label="Reset layout" onClick={resetLayoutSettings} title="Reset layout" type="button">
            <RotateCcw aria-hidden="true" size={14} />
            Reset
          </button>
        </section>
  )
}
