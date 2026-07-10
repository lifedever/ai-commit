# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Commit is a CLI tool that analyzes `git diff` output and calls LLM APIs to generate Conventional Commits formatted commit messages. Supports two providers: OpenAI-compatible API and Claude Code (`claude -p`). Written in TypeScript, distributed via npm as `ai-commit-cli`.

## Architecture

Seven source files in `src/`:

- **index.ts** — CLI entry point (Commander.js). Routes to openai or claude provider based on config
- **config.ts** — Reads env vars into a `Config` object. `provider` field selects openai/claude. Exports `GenerateResult` type
- **git.ts** — Runs `git diff --cached` and `git commit -m`
- **llm.ts** — Sends diff to OpenAI-compatible chat completions endpoint via undici fetch with EnvHttpProxyAgent (supports HTTPS_PROXY/HTTP_PROXY/NO_PROXY), returns `GenerateResult` with token usage
- **claude.ts** — Calls `claude -p` CLI to generate commit messages (Claude reads diff + source files itself), returns `GenerateResult`
- **prompt.ts** — Builds system prompt enforcing Conventional Commits format
- **update-check.ts** — Non-blocking version check against GitHub, 24h cache in `~/.ai-commit/.update-check`

## Hard Rules

- After any feature change, **MUST** update README.md, README_zh.md, docs/DESIGN.md, and CHANGELOG.md to reflect the changes
- After any feature change, **MUST** run `npm run build` to verify compilation passes
- After any feature change, **MUST** self-test with `ai-commit --dry-run` or equivalent to verify functionality
- Version lives **only** in `package.json` (`src/index.ts` reads it at runtime — do NOT reintroduce a hardcoded version)

## Release Process

1. Bump `version` in `package.json` (single source of truth), update CHANGELOG.md + CHANGELOG_zh.md
2. Commit `chore(release): vX.Y.Z`, tag `vX.Y.Z` (lightweight, matching history), push main + tag
3. **Pushing a version bump to main broadcasts an update prompt to all existing users within 24h** (`update-check.ts` reads main's raw package.json; `--update` reinstalls main HEAD via install.sh) — main must be release-ready before the bump lands
4. Update `homebrew-tap/Formula/ai-commit.rb`: url → new tag tarball, sha256 → **download to a file and hash at least twice, compare** (piped `curl | shasum` has produced a corrupt value right after tag push); `git pull --rebase` the tap before pushing
5. The formula **must keep its from-source build steps** (`npm install --include=dev` + `npm run build` before the global install): the GitHub tag tarball has no `dist/` and the build hook is `prepublishOnly`, which plain `npm install` never runs — removing them silently ships a formula that installs no binary
6. Create a GitHub Release: `gh release create vX.Y.Z` with the CHANGELOG entry as notes
7. Verify: `brew fetch lifedever/tap/ai-commit --force` (checksum) and ideally `brew reinstall ai-commit && brew test ai-commit` end-to-end

## Build & Run

```bash
npm install
npm run build
npm link        # global install for testing
ai-commit -d    # dry-run test
```

## Environment Variables

Required: `AI_COMMIT_API_KEY` (only for openai provider)

Optional: `AI_COMMIT_PROVIDER` (openai/claude, default openai), `AI_COMMIT_API_URL` (default DeepSeek), `AI_COMMIT_MODEL`, `AI_COMMIT_LANGUAGE` (en/zh), `AI_COMMIT_MAX_TOKENS` (500)

Proxy: `HTTPS_PROXY` / `HTTP_PROXY` (for openai provider), `NO_PROXY` (bypass)
