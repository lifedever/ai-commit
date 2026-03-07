# Changelog

[中文版](./CHANGELOG_zh.md)

All notable changes to this project will be documented in this file.

## [1.3.5] - 2026-03-08

### Fixed

- Use GitHub API instead of raw.githubusercontent.com for version check (avoid CDN cache delay)

## [1.3.4] - 2026-03-08

### Fixed

- Support `-v` as version flag (in addition to `-V` and `--version`)

## [1.3.3] - 2026-03-08

### Improved

- Code cleanup and repo hygiene optimizations
- Split CHANGELOG into English and Chinese versions

## [1.3.2] - 2026-03-08

### Fixed

- `ai-commit --update` checks remote version first, skips reinstall when already up to date

## [1.3.1] - 2026-03-08

### Added

- Auto update check: async version check against GitHub on each run (non-blocking, 3s timeout)
- Check result cached for 24 hours (`~/.ai-commit/.update-check`)
- Yellow hint displayed at command exit when new version available

## [1.3.0] - 2026-03-08

### Added

- Generation stats summary line (provider, model, tokens, elapsed time) in dim gray
- OpenAI mode returns token usage, Claude mode parses JSON for metadata

## [1.2.0] - 2026-03-08

### Added

- Claude Code as LLM provider (`-p claude` / `AI_COMMIT_PROVIDER=claude`)
- Claude Code reads project source files autonomously for better context, higher quality commit messages
- New `-p, --provider` CLI option
- No API key required for Claude mode

## [1.1.1] - 2026-03-07

### Added

- Emoji support: `-e` flag and `AI_COMMIT_EMOJI` environment variable
- Prepend relevant emoji to commit messages (✨ feat, 🐛 fix, etc.)

## [1.1.0] - 2026-03-07

### Added

- `ai-commit --update` command
- `ai-commit --uninstall` command
- MIT License

### Fixed

- install.sh: add pre-flight checks and error handling

## [1.0.0] - 2026-03-07

### Added

- Core feature: analyze `git diff --cached`, call OpenAI-compatible API to generate commit messages
- Conventional Commits format output
- Interactive confirm, edit, regenerate, cancel
- Chinese/English support (`-l en/zh`)
- One-line install (`install.sh`)
- Support DeepSeek, OpenAI, Volcengine, Ollama and any OpenAI API-compatible service
