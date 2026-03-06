# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Commit is a CLI tool that analyzes `git diff` output and calls LLM APIs (OpenAI-compatible) to generate Conventional Commits formatted commit messages. Written in TypeScript, distributed via npm as `ai-commit-cli`.

## Architecture

Five source files in `src/`:

- **index.ts** — CLI entry point (Commander.js). Flow: load config → get diff → call LLM → interactive confirm/edit/regenerate/cancel
- **config.ts** — Reads env vars into a `Config` object
- **git.ts** — Runs `git diff --cached` and `git commit -m`
- **llm.ts** — Sends diff to OpenAI-compatible chat completions endpoint
- **prompt.ts** — Builds system prompt enforcing Conventional Commits format

## Build & Run

```bash
npm install
npm run build
npm link        # global install for testing
ai-commit -d    # dry-run test
```

## Environment Variables

Required: `AI_COMMIT_API_KEY`

Optional: `AI_COMMIT_API_URL` (default DeepSeek), `AI_COMMIT_MODEL`, `AI_COMMIT_LANGUAGE` (en/zh), `AI_COMMIT_MAX_TOKENS` (500)
