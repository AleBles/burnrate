import React from 'react'
import { Box, Text } from 'ink'

import { DIM, ORANGE, PROVIDER_COLORS, getProviderDisplayName } from './constants.js'
import { PERIODS, PERIOD_LABELS, type Period } from './period.js'

export function PeriodTabs({ active, providerName, showProvider }: { active: Period; providerName?: string; showProvider?: boolean }) {
  return (
    <Box justifyContent="space-between" paddingX={1}>
      <Box gap={1}>
        {PERIODS.map(p => (
          <Text key={p} bold={active === p} color={active === p ? ORANGE : DIM}>
            {active === p ? `[ ${PERIOD_LABELS[p]} ]` : `  ${PERIOD_LABELS[p]}  `}
          </Text>
        ))}
      </Box>
      {showProvider && providerName && (
        <Box><Text color={DIM}>|  </Text><Text color={ORANGE} bold>[p]</Text><Text bold color={PROVIDER_COLORS[providerName] ?? ORANGE}> {getProviderDisplayName(providerName)}</Text></Box>
      )}
    </Box>
  )
}
