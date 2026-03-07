# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Commit is a CLI tool that analyzes `git diff` output and calls LLM APIs to generate Conventional Commits formatted commit messages. Supports two providers: OpenAI-compatible API and Claude Code (`claude -p`). Written in TypeScript, distributed via npm as `ai-commit-cli`.

## Architecture

Six source files in `src/`:

- **index.ts** — CLI entry point (Commander.js). Routes to openai or claude provider based on config
- **config.ts** — Reads env vars into a `Config` object. `provider` field selects openai/claude
- **git.ts** — Runs `git diff --cached` and `git commit -m`
- **llm.ts** — Sends diff to OpenAI-compatible chat completions endpoint
- **claude.ts** — Calls `claude -p` CLI to generate commit messages (Claude reads diff + source files itself)
- **prompt.ts** — Builds system prompt enforcing Conventional Commits format

## Hard Rules

- After any feature change, **MUST** update README.md, README_zh.md, and docs/ (DESIGN.md, v2ex-post.md, wechat-post.md) to reflect the changes
- After any feature change, **MUST** run `npm run build` to verify compilation passes
- After any feature change, **MUST** self-test with `ai-commit --dry-run` or equivalent to verify functionality

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
