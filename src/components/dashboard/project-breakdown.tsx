import React from 'react'
import { Text } from 'ink'

import type { ProjectSummary } from '../../types.js'
import { formatCost, formatTokens } from '../../format.js'
import { GOLD, PANEL_COLORS } from './constants.js'
import { fit, shortProject } from './format.js'
import { HBar } from './hbar.js'
import { Panel } from './panel.js'

const PROJECT_COL_AVG = 7
const PROJECT_COL_TOKENS = 8
const PROJECT_COL_BASE_WIDTH = 38

function projectTotalTokens(project: ProjectSummary): number {
  let total = 0
  for (const s of project.sessions) {
    total += s.totalInputTokens + s.totalOutputTokens + s.totalCacheReadTokens + s.totalCacheWriteTokens
  }
  return total
}

export function ProjectBreakdown({ projects, pw, bw }: { projects: ProjectSummary[]; pw: number; bw: number }) {
  const maxCost = Math.max(...projects.map(p => p.totalCostUSD))
  const nw = Math.max(8, pw - bw - PROJECT_COL_BASE_WIDTH)
  return (
    <Panel title="By Project" color={PANEL_COLORS.project} width={pw}>
      <Text dimColor wrap="truncate-end">
        {''.padEnd(bw + 1 + nw)}{'cost'.padStart(8)}{'tokens'.padStart(PROJECT_COL_TOKENS)}{'avg/s'.padStart(PROJECT_COL_AVG)}{'sess'.padStart(6)}
      </Text>
      {projects.slice(0, 8).map((project, i) => {
        const avgCost = project.sessions.length > 0
          ? formatCost(project.totalCostUSD / project.sessions.length)
          : '-'
        return (
          <Text key={`${project.project}-${i}`} wrap="truncate-end">
            <HBar value={project.totalCostUSD} max={maxCost} width={bw} />
            <Text dimColor> {fit(shortProject(project.project), nw)}</Text>
            <Text color={GOLD}>{formatCost(project.totalCostUSD).padStart(8)}</Text>
            <Text color="#7B9EF5">{formatTokens(projectTotalTokens(project)).padStart(PROJECT_COL_TOKENS)}</Text>
            <Text color={GOLD}>{avgCost.padStart(PROJECT_COL_AVG)}</Text>
            <Text>{String(project.sessions.length).padStart(6)}</Text>
          </Text>
        )
      })}
    </Panel>
  )
}
