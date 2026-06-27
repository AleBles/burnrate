import React from 'react'
import { Box, Text } from 'ink'

export function Panel({ title, color, children, width }: { title: string; color: string; children: React.ReactNode; width: number }) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={color} paddingX={1} width={width}>
      <Text bold color={color}>{title}</Text>
      {children}
    </Box>
  )
}
