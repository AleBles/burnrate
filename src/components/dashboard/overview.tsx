import React from 'react'
import { Box, Text } from 'ink'

import type { ProjectSummary } from '../../types.js'
import { formatCost, formatTokens } from '../../format.js'
import { type PlanUsage } from '../../plan-usage.js'
import { planDisplayName } from '../../plans.js'
import { DIM, GOLD, ORANGE, PANEL_COLORS, PLAN_BAR_WIDTH } from './constants.js'
import { renderPlanBar } from './format.js'

export function Overview({ projects, label, width, planUsage }: { projects: ProjectSummary[]; label: string; width: number; planUsage?: PlanUsage }) {
  const totalCost = projects.reduce((s, p) => s + p.totalCostUSD, 0)
  const totalCalls = projects.reduce((s, p) => s + p.totalApiCalls, 0)
  const totalSessions = projects.reduce((s, p) => s + p.sessions.length, 0)
  const allSessions = projects.flatMap(p => p.sessions)
  const totalInput = allSessions.reduce((s, sess) => s + sess.totalInputTokens, 0)
  const totalOutput = allSessions.reduce((s, sess) => s + sess.totalOutputTokens, 0)
  const totalCacheRead = allSessions.reduce((s, sess) => s + sess.totalCacheReadTokens, 0)
  const totalCacheWrite = allSessions.reduce((s, sess) => s + sess.totalCacheWriteTokens, 0)
  const allInputTokens = totalInput + totalCacheRead + totalCacheWrite
  const cacheHit = allInputTokens > 0
    ? (totalCacheRead / allInputTokens) * 100 : 0
  const planLabel = planUsage ? `${planDisplayName(planUsage.plan.id)}: ${formatCost(planUsage.spentApiEquivalentUsd)} API-equivalent vs ${formatCost(planUsage.budgetUsd)} plan` : ''
  const planPct = planUsage ? `${planUsage.percentUsed.toFixed(1)}%` : ''
  const planColor = planUsage
    ? planUsage.status === 'over'
      ? '#F55B5B'
      : planUsage.status === 'near'
        ? ORANGE
        : '#5BF58C'
    : DIM

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={PANEL_COLORS.overview} paddingX={1} width={width}>
      <Text wrap="truncate-end">
        <Text bold color={ORANGE}>BurnRate</Text>
        <Text dimColor>  {label}</Text>
      </Text>
      <Text wrap="truncate-end">
        <Text bold color={GOLD}>{formatCost(totalCost)}</Text>
        <Text dimColor> cost   </Text>
        <Text bold>{totalCalls.toLocaleString()}</Text>
        <Text dimColor> calls   </Text>
        <Text bold>{String(totalSessions)}</Text>
        <Text dimColor> sessions   </Text>
        <Text bold>{cacheHit.toFixed(1)}%</Text>
        <Text dimColor> cache hit</Text>
      </Text>
      <Text dimColor wrap="truncate-end">
        {formatTokens(totalInput)} in   {formatTokens(totalOutput)} out   {formatTokens(totalCacheRead)} cached   {formatTokens(totalCacheWrite)} written
      </Text>
      {planUsage && (
        <>
          <Text wrap="truncate-end">
            <Text color={planColor}>{planLabel}</Text>
            <Text>  </Text>
            <Text color={planColor}>{renderPlanBar(planUsage.percentUsed, PLAN_BAR_WIDTH)}</Text>
            <Text> </Text>
            <Text bold color={planColor}>{planPct}</Text>
          </Text>
          <Text dimColor wrap="truncate-end">
            {planUsage.status === 'under'
              ? `Well within plan. Projected month: ${formatCost(planUsage.projectedMonthUsd)} (reset in ${planUsage.daysUntilReset} days).`
              : planUsage.status === 'near'
                ? `Approaching plan limit. Projected month: ${formatCost(planUsage.projectedMonthUsd)} (reset in ${planUsage.daysUntilReset} days).`
                : `${(planUsage.spentApiEquivalentUsd / Math.max(planUsage.budgetUsd, 1)).toFixed(1)}x your subscription value. Projected month: ${formatCost(planUsage.projectedMonthUsd)} (reset in ${planUsage.daysUntilReset} days).`}
          </Text>
        </>
      )}
    </Box>
  )
}
