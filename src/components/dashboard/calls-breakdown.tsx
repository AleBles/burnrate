import React from 'react'
import { Text } from 'ink'

import type { ProjectSummary } from '../../types.js'
import { LANG_DISPLAY_NAMES, PANEL_COLORS } from './constants.js'
import { fit } from './format.js'
import { HBar } from './hbar.js'
import { Panel } from './panel.js'

type Session = ProjectSummary['sessions'][number]
type CallsAccessor = (session: Session) => Record<string, { calls: number }>

interface CallsBreakdownProps {
  projects: ProjectSummary[]
  pw: number
  bw: number
  title: string
  color: string
  accessor: CallsAccessor
  topN: number
  callsColWidth: number
  emptyText?: string
  filter?: (key: string) => boolean
  transformName?: (key: string) => string
}

function CallsBreakdown({ projects, pw, bw, title, color, accessor, topN, callsColWidth, emptyText, filter, transformName }: CallsBreakdownProps) {
  const totals: Record<string, number> = {}
  for (const project of projects) {
    for (const session of project.sessions) {
      for (const [key, data] of Object.entries(accessor(session))) {
        if (filter && !filter(key)) continue
        totals[key] = (totals[key] ?? 0) + data.calls
      }
    }
  }
  const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a)

  if (sorted.length === 0 && emptyText) {
    return <Panel title={title} color={color} width={pw}><Text dimColor>{emptyText}</Text></Panel>
  }

  const maxCalls = sorted[0]?.[1] ?? 0
  const nw = Math.max(6, pw - bw - 15)

  return (
    <Panel title={title} color={color} width={pw}>
      <Text dimColor wrap="truncate-end">{''.padEnd(bw + 1 + nw)}{'calls'.padStart(callsColWidth)}</Text>
      {sorted.slice(0, topN).map(([key, calls]) => {
        const display = transformName ? transformName(key) : key
        return (
          <Text key={key} wrap="truncate-end">
            <HBar value={calls} max={maxCalls} width={bw} />
            <Text> {fit(display, nw)}</Text>
            <Text>{String(calls).padStart(callsColWidth)}</Text>
          </Text>
        )
      })}
    </Panel>
  )
}

export function ToolBreakdown({ projects, pw, bw, title, filterPrefix }: { projects: ProjectSummary[]; pw: number; bw: number; title?: string; filterPrefix?: string }) {
  return (
    <CallsBreakdown
      projects={projects}
      pw={pw}
      bw={bw}
      title={title ?? 'Core Tools'}
      color={PANEL_COLORS.tools}
      accessor={s => s.toolBreakdown}
      topN={10}
      callsColWidth={7}
      filter={filterPrefix
        ? key => key.startsWith(filterPrefix)
        : key => !key.startsWith('lang:')}
      transformName={filterPrefix
        ? key => {
            const raw = key.slice(filterPrefix.length)
            return LANG_DISPLAY_NAMES[raw] ?? raw
          }
        : undefined}
    />
  )
}

export function McpBreakdown({ projects, pw, bw }: { projects: ProjectSummary[]; pw: number; bw: number }) {
  return (
    <CallsBreakdown
      projects={projects}
      pw={pw}
      bw={bw}
      title="MCP Servers"
      color={PANEL_COLORS.mcp}
      accessor={s => s.mcpBreakdown}
      topN={8}
      callsColWidth={6}
      emptyText="No MCP usage"
    />
  )
}

export function BashBreakdown({ projects, pw, bw }: { projects: ProjectSummary[]; pw: number; bw: number }) {
  return (
    <CallsBreakdown
      projects={projects}
      pw={pw}
      bw={bw}
      title="Shell Commands"
      color={PANEL_COLORS.bash}
      accessor={s => s.bashBreakdown}
      topN={10}
      callsColWidth={7}
      emptyText="No shell commands"
    />
  )
}
