import React from 'react'
import { Box, Text } from 'ink'

import type { ProjectSummary } from '../../types.js'
import { type PlanUsage } from '../../plan-usage.js'
import { ScrollPanel } from '../scroll-panel.js'
import { ORANGE } from './constants.js'
import { getLayout } from './format.js'
import { PERIOD_LABELS, type Period } from './period.js'
import { Panel } from './panel.js'
import { Overview } from './overview.js'
import { DailyActivity } from './daily-activity.js'
import { ProjectBreakdown } from './project-breakdown.js'
import { ModelBreakdown } from './model-breakdown.js'
import { ActivityBreakdown } from './activity-breakdown.js'
import { TopSessions } from './top-sessions.js'
import { BashBreakdown, McpBreakdown, ToolBreakdown } from './calls-breakdown.js'

function Row({ horizontal, width, children }: { horizontal: boolean; width: number; children: React.ReactNode }) {
  if (horizontal) return <Box width={width}>{children}</Box>
  return <>{children}</>
}

export function DashboardContent({ projects, period, columns, activeProvider, planUsage, scrollHeight }: { projects: ProjectSummary[]; period: Period; columns?: number; activeProvider?: string; planUsage?: PlanUsage; scrollHeight?: number }) {
  const { dashWidth, wide, triple, halfWidth, thirdWidth, barWidth } = getLayout(columns)
  const isCursor = activeProvider === 'cursor'
  if (projects.length === 0) return <Panel title="BurnRate" color={ORANGE} width={dashWidth}><Text dimColor>No usage data found for {PERIOD_LABELS[period]}.</Text></Panel>
  const pw = triple ? thirdWidth : (wide ? halfWidth : dashWidth)
  const halfPw = wide ? halfWidth : dashWidth
  const days = period === 'all' ? undefined : (period === 'month' || period === '30days' ? 31 : 14)
  const content = triple ? (
    <>
      <Row horizontal width={dashWidth}>
        <DailyActivity projects={projects} days={days} pw={pw} bw={barWidth} />
        <ProjectBreakdown projects={projects} pw={pw} bw={barWidth} />
        <TopSessions projects={projects} pw={pw} bw={barWidth} />
      </Row>
      {isCursor ? (
        <Row horizontal width={dashWidth}>
          <ActivityBreakdown projects={projects} pw={pw} bw={barWidth} />
          <ModelBreakdown projects={projects} pw={pw} bw={barWidth} />
          <ToolBreakdown projects={projects} pw={pw} bw={barWidth} title="Languages" filterPrefix="lang:" />
        </Row>
      ) : (
        <>
          <Row horizontal width={dashWidth}>
            <ActivityBreakdown projects={projects} pw={pw} bw={barWidth} />
            <ModelBreakdown projects={projects} pw={pw} bw={barWidth} />
            <ToolBreakdown projects={projects} pw={pw} bw={barWidth} />
          </Row>
          <Row horizontal width={dashWidth}>
            <BashBreakdown projects={projects} pw={halfPw} bw={barWidth} />
            <McpBreakdown projects={projects} pw={halfPw} bw={barWidth} />
          </Row>
        </>
      )}
    </>
  ) : (
    <>
      <Row horizontal={wide} width={dashWidth}><DailyActivity projects={projects} days={days} pw={pw} bw={barWidth} /><ProjectBreakdown projects={projects} pw={pw} bw={barWidth} /></Row>
      <TopSessions projects={projects} pw={dashWidth} bw={barWidth} />
      <Row horizontal={wide} width={dashWidth}><ActivityBreakdown projects={projects} pw={pw} bw={barWidth} /><ModelBreakdown projects={projects} pw={pw} bw={barWidth} /></Row>
      {isCursor ? (
        <ToolBreakdown projects={projects} pw={dashWidth} bw={barWidth} title="Languages" filterPrefix="lang:" />
      ) : (
        <><Row horizontal={wide} width={dashWidth}><ToolBreakdown projects={projects} pw={pw} bw={barWidth} /><BashBreakdown projects={projects} pw={pw} bw={barWidth} /></Row><McpBreakdown projects={projects} pw={dashWidth} bw={barWidth} /></>
      )}
    </>
  )
  return (
    <Box flexDirection="column" width={dashWidth}>
      <Overview projects={projects} label={PERIOD_LABELS[period]} width={dashWidth} planUsage={planUsage} />
      {scrollHeight != null ? (
        <ScrollPanel height={scrollHeight}>{content}</ScrollPanel>
      ) : (
        content
      )}
    </Box>
  )
}
