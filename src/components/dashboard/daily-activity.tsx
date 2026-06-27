import React from 'react'
import { Text } from 'ink'

import type { ProjectSummary } from '../../types.js'
import { formatCost, formatTokens } from '../../format.js'
import { dateKey } from '../../day-aggregator.js'
import { GOLD, PANEL_COLORS } from './constants.js'
import { HBar } from './hbar.js'
import { Panel } from './panel.js'

export function DailyActivity({ projects, days = 14, pw, bw }: { projects: ProjectSummary[]; days?: number; pw: number; bw: number }) {
  const dailyCosts: Record<string, number> = {}
  const dailyCalls: Record<string, number> = {}
  const dailyTokens: Record<string, number> = {}
  for (const project of projects) {
    for (const session of project.sessions) {
      for (const turn of session.turns) {
        if (!turn.timestamp) continue
        const day = dateKey(turn.timestamp)
        dailyCosts[day] = (dailyCosts[day] ?? 0) + turn.assistantCalls.reduce((s, c) => s + c.costUSD, 0)
        dailyCalls[day] = (dailyCalls[day] ?? 0) + turn.assistantCalls.length
        dailyTokens[day] = (dailyTokens[day] ?? 0) + turn.assistantCalls.reduce(
          (s, c) => s + c.usage.inputTokens + c.usage.outputTokens + c.usage.cacheReadInputTokens + c.usage.cacheCreationInputTokens,
          0,
        )
      }
    }
  }
  const sortedDays = days !== undefined ? Object.keys(dailyCosts).sort().slice(-days) : Object.keys(dailyCosts).sort()
  const maxCost = Math.max(...sortedDays.map(d => dailyCosts[d] ?? 0))

  return (
    <Panel title="Daily Activity" color={PANEL_COLORS.daily} width={pw}>
      <Text dimColor wrap="truncate-end">{''.padEnd(6 + bw)}{'cost'.padStart(8)}{'tokens'.padStart(8)}{'calls'.padStart(6)}</Text>
      {sortedDays.map(day => (
        <Text key={day} wrap="truncate-end">
          <Text dimColor>{day.slice(5)} </Text>
          <HBar value={dailyCosts[day] ?? 0} max={maxCost} width={bw} />
          <Text color={GOLD}>{formatCost(dailyCosts[day] ?? 0).padStart(8)}</Text>
          <Text color="#7B9EF5">{formatTokens(dailyTokens[day] ?? 0).padStart(8)}</Text>
          <Text>{String(dailyCalls[day] ?? 0).padStart(6)}</Text>
        </Text>
      ))}
    </Panel>
  )
}
