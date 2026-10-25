import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultLayoutSettings, layoutStorageKey, parseLayoutSettings, clampLayoutValue } from '../src/features/layout/settings.ts'

test('existing v3 preferences retain all saved dimensions', () => {
  assert.equal(layoutStorageKey, 'meridian-layout-settings-v3')
  const saved = { watchlistWidth: 300, detailsWidth: 270, chartHeight: 400, watchlistHeight: 600 }
  assert.deepEqual(parseLayoutSettings(JSON.stringify(saved)), saved)
})

test('missing, malformed and null records restore usable defaults', () => {
  for (const raw of [null, '', '{broken', 'null', '{}']) {
    assert.deepEqual(parseLayoutSettings(raw), defaultLayoutSettings)
  }
})

test('partial records preserve valid fields and default absent fields', () => {
  assert.deepEqual(parseLayoutSettings('{"chartHeight":420}'), { ...defaultLayoutSettings, chartHeight: 420 })
})

test('dimensions are bounded and rounded to the existing slider steps', () => {
  assert.equal(clampLayoutValue('watchlistWidth', -50), 220)
  assert.equal(clampLayoutValue('detailsWidth', 999), 340)
  assert.equal(clampLayoutValue('chartHeight', 366), 370)
  assert.equal(clampLayoutValue('watchlistHeight', Number.NaN), 450)
  assert.equal(clampLayoutValue('watchlistHeight', Infinity), 450)
})
