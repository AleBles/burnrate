import type { TaskCategory } from '../../types.js'

export const MIN_WIDE = 90
export const MIN_TRIPLE = 160
export const ORANGE = '#FF8C42'
export const DIM = '#555555'
export const GOLD = '#FFD700'
export const PLAN_BAR_WIDTH = 10
export const PANEL_CHROME = 4

export const LANG_DISPLAY_NAMES: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  rust: 'Rust', go: 'Go', java: 'Java', cpp: 'C++', c: 'C', csharp: 'C#',
  ruby: 'Ruby', php: 'PHP', swift: 'Swift', kotlin: 'Kotlin',
  html: 'HTML', css: 'CSS', scss: 'SCSS', json: 'JSON', yaml: 'YAML',
  sql: 'SQL', shell: 'Shell', shellscript: 'Shell Script', bash: 'Bash',
  typescriptreact: 'TSX', javascriptreact: 'JSX',
  markdown: 'Markdown', dockerfile: 'Dockerfile', toml: 'TOML',
}

export const PANEL_COLORS = {
  overview: '#FF8C42',
  daily: '#5B9EF5',
  project: '#5BF5A0',
  sessions: '#FF6B6B',
  model: '#E05BF5',
  activity: '#F5C85B',
  tools: '#5BF5E0',
  mcp: '#F55BE0',
  bash: '#F5A05B',
}

export const PROVIDER_COLORS: Record<string, string> = {
  claude: '#FF8C42',
  codex: '#5BF5A0',
  cursor: '#00B4D8',
  opencode: '#A78BFA',
  pi: '#F472B6',
  all: '#FF8C42',
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  coding: '#5B9EF5',
  debugging: '#F55B5B',
  feature: '#5BF58C',
  refactoring: '#F5E05B',
  testing: '#E05BF5',
  exploration: '#5BF5E0',
  planning: '#7B9EF5',
  delegation: '#F5C85B',
  git: '#CCCCCC',
  'build/deploy': '#5BF5A0',
  conversation: '#888888',
  brainstorming: '#F55BE0',
  general: '#666666',
}

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  all: 'All',
  claude: 'Claude',
  codex: 'Codex',
  cursor: 'Cursor',
  opencode: 'OpenCode',
  pi: 'Pi',
}

export function getProviderDisplayName(name: string): string {
  return PROVIDER_DISPLAY_NAMES[name] ?? name
}
