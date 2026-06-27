import React from 'react'
import { Box, Text } from 'ink'

import { DIM, ORANGE } from './constants.js'

export function StatusBar({ width, showProvider, refreshing }: { width: number; showProvider?: boolean; refreshing?: boolean }) {
  return (
    <Box borderStyle="round" borderColor={DIM} width={width} flexDirection="column" alignItems="center" paddingX={1}>
      <Text>
        <Text color={ORANGE} bold>{'<'}</Text><Text color={ORANGE}>{'>'}</Text><Text dimColor> switch   </Text>
        <Text color={ORANGE} bold>{'↑ / PgUp'}</Text><Text color={ORANGE}>{'↓ / PgDn'}</Text><Text dimColor> scroll </Text>
        <Text color={ORANGE} bold>q</Text><Text dimColor> quit   </Text>
        <Text color={ORANGE} bold>1</Text><Text dimColor> today   </Text>
        <Text color={ORANGE} bold>2</Text><Text dimColor> week   </Text>
        <Text color={ORANGE} bold>3</Text><Text dimColor> 30 days   </Text>
        <Text color={ORANGE} bold>4</Text><Text dimColor> month   </Text>
        <Text color={ORANGE} bold>5</Text><Text dimColor> all time</Text>
        {showProvider && (<><Text dimColor>   </Text><Text color={ORANGE} bold>p</Text><Text dimColor> provider</Text></>)}
        {refreshing && (<Text dimColor>   ↻ updating…</Text>)}
      </Text>
    </Box>
  )
}
