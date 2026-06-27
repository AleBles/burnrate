import React, { useState, useCallback, useEffect, useRef } from 'react'
import { render, Box, Text, useInput, useApp, useWindowSize } from 'ink'

import { type DateRange, type ProjectSummary } from './types.js'
import { parseAllSessions, filterProjectsByName } from './parser.js'
import { loadPricing } from './models.js'
import { getAllProviders } from './providers/index.js'
import { getPlanUsageOrNull, type PlanUsage } from './plan-usage.js'
import { ORANGE } from './components/dashboard/constants.js'
import { getLayout } from './components/dashboard/format.js'
import { PERIODS, PERIOD_LABELS, getDateRange, type Period } from './components/dashboard/period.js'
import { Panel } from './components/dashboard/panel.js'
import { PeriodTabs } from './components/dashboard/period-tabs.js'
import { StatusBar } from './components/dashboard/status-bar.js'
import { DashboardContent } from './components/dashboard/dashboard-content.js'

const FIXED_ROWS = 10 // PeriodTabs(1) + Overview(5) + StatusBar(4)

function InteractiveDashboard({ initialProjects, initialPeriod, initialProvider, initialPlanUsage, refreshSeconds, projectFilter, excludeFilter }: {
  initialProjects: ProjectSummary[]
  initialPeriod: Period
  initialProvider: string
  initialPlanUsage?: PlanUsage
  refreshSeconds?: number
  projectFilter?: string[]
  excludeFilter?: string[]
}) {
  const { exit } = useApp()
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [projects, setProjects] = useState<ProjectSummary[]>(initialProjects)
  const [loading, setLoading] = useState(false)
  const [activeProvider, setActiveProvider] = useState(initialProvider)
  const [detectedProviders, setDetectedProviders] = useState<string[]>([])
  const [planUsage, setPlanUsage] = useState<PlanUsage | undefined>(initialPlanUsage)
  const { columns } = useWindowSize()
  const totalRows = Math.max(process.stdout.rows, FIXED_ROWS)
  const { dashWidth } = getLayout(columns)
  const multipleProviders = detectedProviders.length > 1
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reloadGenerationRef = useRef(0)
  const scrollHeight = totalRows - FIXED_ROWS

  useEffect(() => {
    let cancelled = false
    async function detect() {
      const found: string[] = []
      for (const p of await getAllProviders()) { const s = await p.discoverSessions(); if (s.length > 0) found.push(p.name) }
      if (!cancelled) setDetectedProviders(found)
    }
    detect()
    return () => { cancelled = true }
  }, [])

  const reloadData = useCallback(async (p: Period, prov: string) => {
    const generation = ++reloadGenerationRef.current
    setLoading(true)
    try {
      const range = getDateRange(p)
      const data = await parseAllSessions(range, prov)
      if (reloadGenerationRef.current !== generation) return

      const filteredProjects = filterProjectsByName(data, projectFilter, excludeFilter)
      if (reloadGenerationRef.current !== generation) return

      setProjects(filteredProjects)
      const usage = await getPlanUsageOrNull()
      if (reloadGenerationRef.current !== generation) return
      setPlanUsage(usage ?? undefined)
    } catch (error) {
      console.error(error)
    } finally {
      if (reloadGenerationRef.current === generation) {
        setLoading(false)
      }
    }
  }, [projectFilter, excludeFilter])

  useEffect(() => {
    if (!refreshSeconds || refreshSeconds <= 0) return
    const id = setInterval(() => { reloadData(period, activeProvider) }, refreshSeconds * 1000)
    return () => clearInterval(id)
  }, [refreshSeconds, period, activeProvider, reloadData])

  const switchPeriod = useCallback((np: Period) => {
    if (np === period) return
    setPeriod(np)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { reloadData(np, activeProvider) }, 600)
  }, [period, activeProvider, reloadData])

  const switchPeriodImmediate = useCallback(async (np: Period) => {
    if (np === period) return
    setPeriod(np)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    await reloadData(np, activeProvider)
  }, [period, activeProvider, reloadData])

  useInput((input, key) => {
    if (input === 'q') { exit(); return }
    if (input === 'p' && multipleProviders) {
      const opts = ['all', ...detectedProviders]; const next = opts[(opts.indexOf(activeProvider) + 1) % opts.length]
      setActiveProvider(next)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      reloadData(period, next); return
    }
    const idx = PERIODS.indexOf(period)
    if (key.leftArrow) switchPeriod(PERIODS[(idx - 1 + PERIODS.length) % PERIODS.length]!)
    else if (key.rightArrow || key.tab) switchPeriod(PERIODS[(idx + 1) % PERIODS.length]!)
    else if (input === '1') switchPeriodImmediate('today')
    else if (input === '2') switchPeriodImmediate('week')
    else if (input === '3') switchPeriodImmediate('30days')
    else if (input === '4') switchPeriodImmediate('month')
    else if (input === '5') switchPeriodImmediate('all')
  })

  if (loading) {
    return (
      <Box flexDirection="column" width={dashWidth} height={totalRows}>
        <PeriodTabs active={period} providerName={activeProvider} showProvider={multipleProviders} />
        <Panel title="BurnRate" color={ORANGE} width={dashWidth}><Text dimColor>Loading {PERIOD_LABELS[period]}...</Text></Panel>
        <StatusBar width={dashWidth} showProvider={multipleProviders} />
      </Box>
    )
  }

  return (
    <Box flexDirection="column" width={dashWidth} height={totalRows}>
      <PeriodTabs active={period} providerName={activeProvider} showProvider={multipleProviders} />
      <DashboardContent projects={projects} period={period} columns={columns} activeProvider={activeProvider} planUsage={planUsage} scrollHeight={scrollHeight} />
      <StatusBar width={dashWidth} showProvider={multipleProviders} />
    </Box>
  )
}

function StaticDashboard({ projects, period, activeProvider, planUsage }: { projects: ProjectSummary[]; period: Period; activeProvider?: string; planUsage?: PlanUsage }) {
  const { columns } = useWindowSize()
  const { dashWidth } = getLayout(columns)
  return (
    <Box flexDirection="column" width={dashWidth}>
      <PeriodTabs active={period} />
      <DashboardContent projects={projects} period={period} columns={columns} activeProvider={activeProvider} planUsage={planUsage} />
    </Box>
  )
}

export async function renderDashboard(period: Period = 'week', provider: string = 'all', refreshSeconds?: number, projectFilter?: string[], excludeFilter?: string[], customRange?: DateRange | null): Promise<void> {
  await loadPricing()
  const range = customRange ?? getDateRange(period)
  const filteredProjects = filterProjectsByName(await parseAllSessions(range, provider), projectFilter, excludeFilter)
  const planUsage = await getPlanUsageOrNull()
  const isTTY = process.stdin.isTTY && process.stdout.isTTY
  if (isTTY) {
    const { waitUntilExit } = render(
      <InteractiveDashboard initialProjects={filteredProjects} initialPeriod={period} initialProvider={provider} initialPlanUsage={planUsage ?? undefined} refreshSeconds={refreshSeconds} projectFilter={projectFilter} excludeFilter={excludeFilter} />
    )
    await waitUntilExit()
  } else {
    const { unmount } = render(<StaticDashboard projects={filteredProjects} period={period} activeProvider={provider} planUsage={planUsage ?? undefined} />, { patchConsole: false })
    unmount()
  }
}
