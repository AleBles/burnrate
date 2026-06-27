import React from 'react'
import { Text } from 'ink'

import { CATEGORY_LABELS, type ProjectSummary, type TaskCategory } from '../../types.js'
import { formatCost } from '../../format.js'
import { CATEGORY_COLORS, DIM, GOLD, ORANGE, PANEL_COLORS } from './constants.js'
import { fit } from './format.js'
import { HBar } from './hbar.js'
import { Panel } from './panel.js'

export function ActivityBreakdown({ projects, pw, bw }: { projects: ProjectSummary[]; pw: number; bw: number }) {
  const categoryTotals: Record<string, { turns: number; costUSD: number; editTurns: number; oneShotTurns: number }> = {}
  for (const project of projects) {
    for (const session of project.sessions) {
      for (const [cat, data] of Object.entries(session.categoryBreakdown)) {
        if (!categoryTotals[cat]) categoryTotals[cat] = { turns: 0, costUSD: 0, editTurns: 0, oneShotTurns: 0 }
        categoryTotals[cat].turns += data.turns
        categoryTotals[cat].costUSD += data.costUSD
        categoryTotals[cat].editTurns += data.editTurns
        categoryTotals[cat].oneShotTurns += data.oneShotTurns
      }
    }
  }
  const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b.costUSD - a.costUSD)
  const maxCost = sorted[0]?.[1]?.costUSD ?? 0
  return (
    <Panel title="By Activity" color={PANEL_COLORS.activity} width={pw}>
      <Text dimColor wrap="truncate-end">{''.padEnd(bw + 14)}{'cost'.padStart(8)}{'turns'.padStart(6)}{'1-shot'.padStart(7)}</Text>
      {sorted.map(([cat, data]) => {
        const oneShotPct = data.editTurns > 0 ? Math.round((data.oneShotTurns / data.editTurns) * 100) + '%' : '-'
        return (
          <Text key={cat} wrap="truncate-end">
            <HBar value={data.costUSD} max={maxCost} width={bw} />
            <Text color={CATEGORY_COLORS[cat as TaskCategory] ?? '#666666'}> {fit(CATEGORY_LABELS[cat as TaskCategory] ?? cat, 13)}</Text>
            <Text color={GOLD}>{formatCost(data.costUSD).padStart(8)}</Text>
            <Text>{String(data.turns).padStart(6)}</Text>
            <Text color={data.editTurns === 0 ? DIM : oneShotPct === '100%' ? '#5BF58C' : ORANGE}>{String(oneShotPct).padStart(7)}</Text>
          </Text>
        )
      })}
    </Panel>
  )
}
