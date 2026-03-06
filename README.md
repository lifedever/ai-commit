# AI Commit

[中文文档](./README_zh.md)

AI-powered Git commit message generator. Analyzes your staged changes and generates [Conventional Commits](https://www.conventionalcommits.org/) formatted messages using any OpenAI-compatible LLM.

## Install

One-line install (macOS / Linux):

```bash
curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash
```

> Requires: Git, Node.js >= 18, npm

## Configuration

Set your API key (add to `~/.bashrc` or `~/.zshrc` for persistence):

```bash
export AI_COMMIT_API_KEY="sk-your-api-key"
```

By default, it uses DeepSeek. To use other providers:

```bash
# OpenAI
export AI_COMMIT_API_URL="https://api.openai.com/v1/chat/completions"
export AI_COMMIT_MODEL="gpt-4o-mini"

# Volcengine
export AI_COMMIT_API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
export AI_COMMIT_MODEL="deepseek-v3-2-251201"

# Local Ollama
export AI_COMMIT_API_KEY="ollama"
export AI_COMMIT_API_URL="http://localhost:11434/v1/chat/completions"
export AI_COMMIT_MODEL="qwen2.5"
```

Any OpenAI API-compatible service works out of the box.

## Usage

```bash
# Stage your changes first
git add .

# Generate commit message (interactive)
ai-commit

# Auto-commit without confirmation
ai-commit -y

# Preview only, don't commit
ai-commit --dry-run

# Use Chinese for commit message
ai-commit -l zh

# Use a specific model
ai-commit -m gpt-4o-mini
```

## Git Alias (Optional)

```bash
git config --global alias.ac '!ai-commit'

# Then use:
git ac
```

## Update

Re-run the install script to update to the latest version:

```bash
curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash
```

## Uninstall

```bash
npm unlink -g ai-commit-cli && rm -rf ~/.ai-commit
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `AI_COMMIT_API_KEY` | **Required.** Your LLM API key | - |
| `AI_COMMIT_API_URL` | API endpoint | `https://api.deepseek.com/v1/chat/completions` |
| `AI_COMMIT_MODEL` | Model name | `deepseek-chat` |
| `AI_COMMIT_LANGUAGE` | Message language (`en` / `zh`) | `en` |
| `AI_COMMIT_MAX_TOKENS` | Max tokens for generation | `500` |

## License

MIT
