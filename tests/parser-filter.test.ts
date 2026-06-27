import { describe, it, expect } from 'vitest'

import { filterProjectsByName } from '../src/parser.js'
import type { ProjectSummary } from '../src/types.js'

function makeProject(project: string, projectPath = project): ProjectSummary {
  return {
    project,
    projectPath,
    sessions: [],
    totalCostUSD: 0,
    totalApiCalls: 0,
  }
}

describe('filterProjectsByName', () => {
  const projects = [
    makeProject('burnrate', '/Users/alice/burnrate'),
    makeProject('test', '/Users/alice/projects/test'),
    makeProject('dashboard', '/Users/alice/test/dashboard'),
    makeProject('sandbox', '/tmp/sandbox'),
  ]

  it('returns all projects when no filters given', () => {
    expect(filterProjectsByName(projects)).toEqual(projects)
    expect(filterProjectsByName(projects, [], [])).toEqual(projects)
    expect(filterProjectsByName(projects, undefined, undefined)).toEqual(projects)
  })

  it('include matches project name (case-insensitive substring)', () => {
    const result = filterProjectsByName(projects, ['burnrate'])
    expect(result.map(p => p.project)).toEqual(['burnrate'])
  })

  it('include is case-insensitive', () => {
    const result = filterProjectsByName(projects, ['TEST'])
    expect(result.map(p => p.project).sort()).toEqual(['dashboard', 'test'])
  })

  it('include matches substring in path when name does not match', () => {
    const result = filterProjectsByName(projects, ['alice/projects'])
    expect(result.map(p => p.project)).toEqual(['test'])
  })

  it('include uses OR semantics across patterns', () => {
    const result = filterProjectsByName(projects, ['burnrate', 'sandbox'])
    expect(result.map(p => p.project).sort()).toEqual(['burnrate', 'sandbox'])
  })

  it('exclude removes matching projects (AND-negation across patterns)', () => {
    const result = filterProjectsByName(projects, undefined, ['burnrate', 'sandbox'])
    expect(result.map(p => p.project).sort()).toEqual(['dashboard', 'test'])
  })

  it('exclude matches path substring', () => {
    const result = filterProjectsByName(projects, undefined, ['/tmp'])
    expect(result.map(p => p.project)).not.toContain('sandbox')
  })

  it('exclude is applied after include', () => {
    const result = filterProjectsByName(projects, ['test'], ['dashboard'])
    expect(result.map(p => p.project)).toEqual(['test'])
  })

  it('returns empty array when no project matches include', () => {
    expect(filterProjectsByName(projects, ['does-not-exist'])).toEqual([])
  })

  it('empty-string pattern matches every project', () => {
    const resultInclude = filterProjectsByName(projects, [''])
    expect(resultInclude).toHaveLength(projects.length)
    const resultExclude = filterProjectsByName(projects, undefined, [''])
    expect(resultExclude).toEqual([])
  })

  it('does not mutate the input array', () => {
    const input = [makeProject('a'), makeProject('b')]
    const snapshot = [...input]
    filterProjectsByName(input, ['a'], ['b'])
    expect(input).toEqual(snapshot)
  })
})
