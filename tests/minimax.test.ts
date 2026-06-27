import { describe, it, expect, beforeEach } from 'bun:test'

import { getModelCosts, getShortModelName, resetPricingCache } from '../src/models.js'

// Verifies MiniMax pricing loaded from FALLBACK_PRICING (no network call).
// pricingCache is module-level state shared across the whole `bun test` run, so
// another test file calling loadPricing() leaks upstream pricing in here. Reset
// it before each test so getModelCosts falls through to FALLBACK_PRICING, which
// is what we want to validate.

describe('MiniMax model pricing', () => {
  beforeEach(() => resetPricingCache())


  it('returns pricing for MiniMax-M2.7', () => {
    const costs = getModelCosts('MiniMax-M2.7')
    expect(costs).not.toBeNull()
    expect(costs!.inputCostPerToken).toBe(0.3e-6)
    expect(costs!.outputCostPerToken).toBe(1.2e-6)
    expect(costs!.cacheReadCostPerToken).toBe(0.06e-6)
    expect(costs!.cacheWriteCostPerToken).toBe(0.375e-6)
    expect(costs!.fastMultiplier).toBe(1)
  })

  it('returns pricing for MiniMax-M2.7-highspeed', () => {
    const costs = getModelCosts('MiniMax-M2.7-highspeed')
    expect(costs).not.toBeNull()
    expect(costs!.inputCostPerToken).toBe(0.6e-6)
    expect(costs!.outputCostPerToken).toBe(2.4e-6)
    expect(costs!.cacheReadCostPerToken).toBe(0.06e-6)
    expect(costs!.cacheWriteCostPerToken).toBe(0.375e-6)
    expect(costs!.fastMultiplier).toBe(1)
  })

  it('highspeed pricing is distinct from base model pricing', () => {
    const base = getModelCosts('MiniMax-M2.7')
    const fast = getModelCosts('MiniMax-M2.7-highspeed')
    expect(fast!.inputCostPerToken).toBeGreaterThan(base!.inputCostPerToken)
    expect(fast!.outputCostPerToken).toBeGreaterThan(base!.outputCostPerToken)
  })

  it('returns short name for MiniMax-M2.7', () => {
    expect(getShortModelName('MiniMax-M2.7')).toBe('MiniMax M2.7')
  })

  it('returns short name for MiniMax-M2.7-highspeed', () => {
    expect(getShortModelName('MiniMax-M2.7-highspeed')).toBe('MiniMax M2.7 Highspeed')
  })

  it('handles MiniMax model ID with date suffix', () => {
    expect(getShortModelName('MiniMax-M2.7-20260101')).toBe('MiniMax M2.7')
  })
})
