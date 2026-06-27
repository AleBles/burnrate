import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

import { describe, it, expect } from 'vitest'

function runCli(args: string[], home: string) {
  return spawnSync('bun', ['src/cli.ts', ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOME: home,
    },
    encoding: 'utf-8',
  })
}

describe('burnrate plan command', () => {
  it('persists plan set and clears on reset', async () => {
    const home = await mkdtemp(join(tmpdir(), 'burnrate-cli-plan-'))

    try {
      const setResult = runCli(['plan', 'set', 'claude-max'], home)
      expect(setResult.status).toBe(0)

      // Plans are stored provider-keyed under `plans`; the claude-max preset is
      // scoped to the 'claude' provider. The legacy singular `plan` is removed.
      const configPath = join(home, '.config', 'burnrate', 'config.json')
      const configRaw = await readFile(configPath, 'utf-8')
      const config = JSON.parse(configRaw) as { plans?: { claude?: { id?: string; monthlyUsd?: number } } }
      expect(config.plans?.claude?.id).toBe('claude-max')
      expect(config.plans?.claude?.monthlyUsd).toBe(200)

      const resetResult = runCli(['plan', 'reset'], home)
      expect(resetResult.status).toBe(0)

      const afterResetRaw = await readFile(configPath, 'utf-8')
      const afterReset = JSON.parse(afterResetRaw) as { plan?: unknown; plans?: unknown }
      expect(afterReset.plan).toBeUndefined()
      expect(afterReset.plans).toBeUndefined()
    } finally {
      await rm(home, { recursive: true, force: true })
    }
  })

  it('shows invalid reset-day value in error output', async () => {
    const home = await mkdtemp(join(tmpdir(), 'burnrate-cli-plan-'))

    try {
      const result = runCli(['plan', 'set', 'claude-max', '--reset-day', '99'], home)
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('--reset-day must be an integer from 1 to 28; got 99.')
    } finally {
      await rm(home, { recursive: true, force: true })
    }
  })
})
