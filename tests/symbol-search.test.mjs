import assert from 'node:assert/strict'
import { test } from 'node:test'
import { scheduleSearch } from '../src/features/search/search-request.ts'

const flush = () => new Promise((resolve) => setImmediate(resolve))
function fixture(t, search) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const events = []
  const start = (query) => scheduleSearch(query, search, {
    success: (items) => events.push(['success', items]),
    failure: (reason) => events.push(['failure', reason]),
    complete: () => events.push(['complete']),
  })
  return { events, start }
}

test('debounces, trims the query and limits results to twelve', async (t) => {
  const queries = []
  const items = Array.from({ length: 15 }, (_, i) => ({ symbol: String(i) }))
  const { events, start } = fixture(t, async (q) => { queries.push(q); return items })
  start(' AAPL ')
  t.mock.timers.tick(119)
  assert.deepEqual(queries, [])
  t.mock.timers.tick(1)
  await flush()
  assert.deepEqual(queries, ['AAPL'])
  assert.deepEqual(events, [['success', items.slice(0, 12)], ['complete']])
})

test('blank queries and cancelled debounce do not call the provider', async (t) => {
  let calls = 0
  const { events, start } = fixture(t, async () => { calls++; return [] })
  start('   ')
  start('AAPL')()
  t.mock.timers.tick(500)
  await flush()
  assert.equal(calls, 0)
  assert.deepEqual(events, [])
})

test('stale success and failure cannot overwrite a newer search', async (t) => {
  const pending = []
  const { events, start } = fixture(t, () => new Promise((resolve, reject) => pending.push({ resolve, reject })))
  const cancelFirst = start('old')
  t.mock.timers.tick(120)
  cancelFirst()
  const cancelSecond = start('also old')
  t.mock.timers.tick(120)
  cancelSecond()
  start('current')
  t.mock.timers.tick(120)
  pending[2].resolve([{ symbol: 'CURRENT' }])
  pending[0].resolve([{ symbol: 'OLD' }])
  pending[1].reject(new Error('obsolete failure'))
  await flush()
  assert.deepEqual(events, [['success', [{ symbol: 'CURRENT' }]], ['complete']])
})

test('active failure reports the reason and finishes loading', async (t) => {
  const error = new Error('provider unavailable')
  const { events, start } = fixture(t, async () => { throw error })
  start('AAPL')
  t.mock.timers.tick(120)
  await flush()
  assert.deepEqual(events, [['failure', error], ['complete']])
})
