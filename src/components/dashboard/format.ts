import { homedir } from 'os'

import { MIN_TRIPLE, MIN_WIDE } from './constants.js'

function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

export function gradientColor(pct: number): string {
  if (pct <= 0.33) {
    const t = pct / 0.33
    return toHex(lerp(91, 245, t), lerp(158, 200, t), lerp(245, 91, t))
  }
  if (pct <= 0.66) {
    const t = (pct - 0.33) / 0.33
    return toHex(lerp(245, 255, t), lerp(200, 140, t), lerp(91, 66, t))
  }
  const t = (pct - 0.66) / 0.34
  return toHex(lerp(255, 245, t), lerp(140, 91, t), lerp(66, 91, t))
}

export function fit(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) : s.padEnd(n)
}

export function renderPlanBar(percentUsed: number, width: number): string {
  if (percentUsed <= 100) {
    const capped = Math.max(0, percentUsed)
    const filled = Math.round((capped / 100) * width)
    return `${'▓'.repeat(filled)}${'░'.repeat(Math.max(0, width - filled))}`
  }
  const factor = percentUsed / 100
  const chevrons = Math.min(4, Math.max(1, Math.floor(Math.log10(factor)) + 1))
  return `${'▓'.repeat(width)}${'▶'.repeat(chevrons)}`
}

const _homeEncoded = homedir().replace(/\//g, '-')

export function shortProject(encoded: string): string {
  let path = encoded.replace(/^-/, '')
  if (path.startsWith(_homeEncoded.replace(/^-/, ''))) {
    path = path.slice(_homeEncoded.replace(/^-/, '').length).replace(/^-/, '')
  }
  path = path.replace(/^private-tmp-[^-]+-[^-]+-/, '').replace(/^private-tmp-/, '').replace(/^tmp-/, '')
  if (!path) return 'home'
  const parts = path.split('-').filter(Boolean)
  if (parts.length <= 3) return parts.join('/')
  return parts.slice(-3).join('/')
}

export type Layout = { dashWidth: number; wide: boolean; triple: boolean; halfWidth: number; thirdWidth: number; barWidth: number }

export function getLayout(columns?: number): Layout {
  const termWidth = columns || parseInt(process.env['COLUMNS'] ?? '') || 80
  const triple = termWidth >= MIN_TRIPLE
  const dashWidth = triple ? termWidth : Math.min(160, termWidth)
  const wide = dashWidth >= MIN_WIDE
  const halfWidth = wide ? Math.floor(dashWidth / 2) : dashWidth
  const thirdWidth = triple ? Math.floor(dashWidth / 3) : halfWidth
  const colWidth = triple ? thirdWidth : halfWidth
  const inner = colWidth - 4
  const barWidth = Math.max(6, Math.min(10, inner - 30))
  return { dashWidth, wide, triple, halfWidth, thirdWidth, barWidth }
}
