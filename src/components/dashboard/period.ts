export type Period = 'today' | 'week' | '30days' | 'month' | 'all'

export const PERIODS: Period[] = ['today', 'week', '30days', 'month', 'all']

export const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: '7 Days',
  '30days': '30 Days',
  month: 'This Month',
  all: 'All Time',
}

export function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  switch (period) {
    case 'today': return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end }
    case 'week': return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), end }
    case '30days': return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30), end }
    case 'month': return { start: new Date(now.getFullYear(), now.getMonth(), 1), end }
    case 'all': return { start: new Date(0), end }
  }
}
