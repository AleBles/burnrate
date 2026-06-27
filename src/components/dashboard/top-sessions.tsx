import React from 'react'
import { Text } from 'ink'

import type { ProjectSummary } from '../../types.js'
import { formatCost, formatTokens } from '../../format.js'
import { GOLD, PANEL_CHROME, PANEL_COLORS } from './constants.js'
import { fit, shortProject } from './format.js'
import { HBar } from './hbar.js'
import { Panel } from './panel.js'

const TOP_SESSIONS_DATE_LEN = 10
const TOP_SESSIONS_COST_COL = 8
const TOP_SESSIONS_TOKENS_COL = 8
const TOP_SESSIONS_CALLS_COL = 6

export function TopSessions({ projects, pw, bw }: { projects: ProjectSummary[]; pw: number; bw: number }) {
  const allSessions = projects.flatMap(p =>
    p.sessions.map(s => ({ ...s, projectName: p.project }))
  )
  const top = [...allSessions].sort((a, b) => b.totalCostUSD - a.totalCostUSD).slice(0, 5)

  if (top.length === 0) {
    return <Panel title="Top Sessions" color={PANEL_COLORS.sessions} width={pw}><Text dimColor>No sessions</Text></Panel>
  }

  const maxCost = top[0].totalCostUSD
  const nw = Math.max(8, pw - bw - TOP_SESSIONS_COST_COL - TOP_SESSIONS_TOKENS_COL - TOP_SESSIONS_CALLS_COL - 1 - PANEL_CHROME)

  return (
    <Panel title="Top Sessions" color={PANEL_COLORS.sessions} width={pw}>
      <Text dimColor wrap="truncate-end">{''.padEnd(bw + 1 + nw)}{'cost'.padStart(TOP_SESSIONS_COST_COL)}{'tokens'.padStart(TOP_SESSIONS_TOKENS_COL)}{'calls'.padStart(TOP_SESSIONS_CALLS_COL)}</Text>
      {top.map((session, i) => {
        const date = session.firstTimestamp
          ? session.firstTimestamp.slice(0, TOP_SESSIONS_DATE_LEN)
          : '----------'
        const label = `${date} ${shortProject(session.projectName)}`
        const totalTokens = session.totalInputTokens + session.totalOutputTokens + session.totalCacheReadTokens + session.totalCacheWriteTokens
        return (
          <Text key={`${session.sessionId}-${i}`} wrap="truncate-end">
            <HBar value={session.totalCostUSD} max={maxCost} width={bw} />
            <Text dimColor> {fit(label, nw - 1)}</Text>
            <Text color={GOLD}>{formatCost(session.totalCostUSD).padStart(TOP_SESSIONS_COST_COL)}</Text>
            <Text color="#7B9EF5">{formatTokens(totalTokens).padStart(TOP_SESSIONS_TOKENS_COL)}</Text>
            <Text>{String(session.apiCalls).padStart(TOP_SESSIONS_CALLS_COL)}</Text>
          </Text>
        )
      })}
    </Panel>
  )
}
