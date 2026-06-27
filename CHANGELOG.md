# Changelog

## Unreleased

- **3-column dashboard layout** on wide terminals (≥160 cols). The dash now scales 1 → 2 → 3 panels per row and uses the full terminal width in triple mode (no longer capped at 160).
- **Removed `overhead` column** from the project breakdown panel; the per-project context-budget probe is gone with it.

## 0.1.0 — Initial fork

Forked from [agentseal/codeburn](https://github.com/getagentseal/codeburn) at commit `8950552`.

### Focus

A CLI dedicated to monitoring AI token spend and costs. No menubar app, no waste-finder, no model comparison.

### Removed (vs. upstream codeburn)

- **macOS menubar app** — the entire `mac/` Swift app, the `burnrate menubar` install command, `status --format menubar-json` output, the daily cache that backed it, and the related day-aggregator helpers.
- **`optimize` command** — the waste-finding scanner and its in-TUI panel. The `o` keybinding and findings count in the dashboard status bar are gone.
- **`compare` command** — the side-by-side model comparison TUI. The `c` keybinding is gone.
- **`yield` command** — the experimental git-correlation feature (productive vs. reverted vs. abandoned spend). Heuristics were too noisy to be useful.

### Changed

- **Bun-native.** Drop Node entirely. Bun is the only supported runtime; `tsup` and `vitest` are replaced by `bun build` and `bun test`. `node:sqlite` is replaced by `bun:sqlite`. The npm shebang is `#!/usr/bin/env bun`.
- **Distribution.** Published to npm as `burnrate` and shipped as prebuilt single-file binaries on GitHub Releases (linux/darwin/windows × x64/arm64 via `bun build --compile`).
- **Rebranding** — package, bin, TUI titles, log prefixes, env vars, on-disk paths, and export schema all renamed:
  - `codeburn` (bin) → `burnrate`
  - `~/.config/codeburn/config.json` → `~/.config/burnrate/config.json`
  - `~/.cache/codeburn/` → `~/.cache/burnrate/`
  - `CODEBURN_VERBOSE` → `BURNRATE_VERBOSE`
  - `.codeburn-export` marker → `.burnrate-export`
  - `codeburn.export.v2` schema → `burnrate.export.v2`
- **Clean break on disk.** No backwards-compatible read of legacy `codeburn` paths. Existing users of upstream codeburn keep their data; BurnRate starts fresh.

### Kept

- All session parsers (Claude Code, Codex, Cursor, cursor-agent, Gemini CLI, Kiro, OpenCode, Pi, OMP, Copilot).
- The interactive TUI dashboard (sans optimize/compare overlays).
- `report`, `today`, `month`, `status`, `export`, `currency`, `model-alias`, `plan` commands.
- Plan-tracking with API-equivalent overage projection.
- Currency conversion with cached exchange rates.
- LiteLLM pricing with model-alias overrides.
