import React from 'react'
import { Text } from 'ink'

import type { ProjectSummary } from '../../types.js'
import { formatCost, formatTokens } from '../../format.js'
import { GOLD, PANEL_COLORS } from './constants.js'
import { fit } from './format.js'
import { HBar } from './hbar.js'
import { Panel } from './panel.js'

const MODEL_COL_COST = 8
const MODEL_COL_TOKENS = 8
const MODEL_COL_CACHE = 7
const MODEL_COL_CALLS = 7
const MODEL_NAME_WIDTH = 14

export function ModelBreakdown({ projects, pw, bw }: { projects: ProjectSummary[]; pw: number; bw: number }) {
  const modelTotals: Record<string, { calls: number; costUSD: number; freshInput: number; output: number; cacheRead: number; cacheWrite: number }> = {}
  for (const project of projects) {
    for (const session of project.sessions) {
      for (const [model, data] of Object.entries(session.modelBreakdown)) {
        if (!modelTotals[model]) modelTotals[model] = { calls: 0, costUSD: 0, freshInput: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
        modelTotals[model].calls += data.calls
        modelTotals[model].costUSD += data.costUSD
        modelTotals[model].freshInput += data.tokens.inputTokens
        modelTotals[model].output += data.tokens.outputTokens
        modelTotals[model].cacheRead += data.tokens.cacheReadInputTokens
        modelTotals[model].cacheWrite += data.tokens.cacheCreationInputTokens
      }
    }
  }
  const sorted = Object.entries(modelTotals).sort(([, a], [, b]) => b.costUSD - a.costUSD)
  const maxCost = sorted[0]?.[1]?.costUSD ?? 0

  return (
    <Panel title="By Model" color={PANEL_COLORS.model} width={pw}>
      <Text dimColor wrap="truncate-end">{''.padEnd(bw + 1 + MODEL_NAME_WIDTH)}{'cost'.padStart(MODEL_COL_COST)}{'tokens'.padStart(MODEL_COL_TOKENS)}{'cache'.padStart(MODEL_COL_CACHE)}{'calls'.padStart(MODEL_COL_CALLS)}</Text>
      {sorted.map(([model, data], i) => {
        const totalInputForCache = data.freshInput + data.cacheRead + data.cacheWrite
        const cacheHit = totalInputForCache > 0 ? (data.cacheRead / totalInputForCache) * 100 : 0
        const cacheLabel = totalInputForCache > 0 ? `${cacheHit.toFixed(1)}%` : '-'
        const totalTokens = data.freshInput + data.output + data.cacheRead + data.cacheWrite
        return (
          <Text key={`${model}-${i}`} wrap="truncate-end">
            <HBar value={data.costUSD} max={maxCost} width={bw} />
            <Text> {fit(model, MODEL_NAME_WIDTH)}</Text>
            <Text color={GOLD}>{formatCost(data.costUSD).padStart(MODEL_COL_COST)}</Text>
            <Text color="#7B9EF5">{formatTokens(totalTokens).padStart(MODEL_COL_TOKENS)}</Text>
            <Text>{cacheLabel.padStart(MODEL_COL_CACHE)}</Text>
            <Text>{String(data.calls).padStart(MODEL_COL_CALLS)}</Text>
          </Text>
        )
      })}
    </Panel>
  )
}
