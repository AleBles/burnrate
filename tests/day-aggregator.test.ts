import { describe, expect, it } from 'vitest'

import { dateKey } from '../src/day-aggregator.js'

describe('dateKey', () => {
  it('formats local-time YYYY-MM-DD from an ISO timestamp', () => {
    const iso = '2026-04-15T15:30:00.000Z'
    const expected = (() => {
      const d = new Date(iso)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()
    expect(dateKey(iso)).toBe(expected)
  })

  it('respects local time even when UTC is on a different day', () => {
    const iso = '2026-04-01T01:30:00.000Z'
    const d = new Date(iso)
    expect(dateKey(iso)).toBe(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  })
})
