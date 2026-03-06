# AI Commit

[English](./README.md)

AI 驱动的 Git Commit Message 生成器。分析暂存的代码变更，通过大语言模型自动生成 [Conventional Commits](https://www.conventionalcommits.org/) 格式的提交信息。

## 安装

一行命令安装（macOS / Linux）：

```bash
curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash
```

> 前置要求：Git、Node.js >= 18、npm

## 配置

设置 API Key（添加到 `~/.bashrc` 或 `~/.zshrc` 持久化）：

```bash
export AI_COMMIT_API_KEY="sk-your-api-key"
```

默认使用 DeepSeek，切换其他服务商：

```bash
# OpenAI
export AI_COMMIT_API_URL="https://api.openai.com/v1/chat/completions"
export AI_COMMIT_MODEL="gpt-4o-mini"

# 火山引擎
export AI_COMMIT_API_URL="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
export AI_COMMIT_MODEL="deepseek-v3-2-251201"

# 本地 Ollama
export AI_COMMIT_API_KEY="ollama"
export AI_COMMIT_API_URL="http://localhost:11434/v1/chat/completions"
export AI_COMMIT_MODEL="qwen2.5"
```

支持任何兼容 OpenAI API 格式的服务。

## 使用方式

```bash
# 先暂存改动
git add .

# 生成 commit message（交互式）
ai-commit

# 跳过确认，直接提交
ai-commit -y

# 仅预览，不提交
ai-commit --dry-run

# 生成中文 commit message
ai-commit -l zh

# 临时指定模型
ai-commit -m gpt-4o-mini
```

## 命令参数

| 参数 | 说明 |
|---|---|
| `-V, --version` | 显示版本号 |
| `-y, --yes` | 跳过确认，直接提交 |
| `-l, --language <lang>` | 指定提交信息语言（`en` / `zh`） |
| `-m, --model <model>` | 临时指定模型 |
| `-d, --dry-run` | 仅预览，不提交 |
| `--update` | 更新到最新版本 |
| `--uninstall` | 卸载 ai-commit |
| `-h, --help` | 显示帮助信息 |

## 设置 Git 别名（可选）

```bash
git config --global alias.ac '!ai-commit'

# 之后使用：
git ac
```

## 更新

```bash
ai-commit --update
```

## 卸载

```bash
ai-commit --uninstall
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|---|---|---|
| `AI_COMMIT_API_KEY` | **必需。** LLM 服务的 API Key | - |
| `AI_COMMIT_API_URL` | API 端点地址 | `https://api.deepseek.com/v1/chat/completions` |
| `AI_COMMIT_MODEL` | 模型名称 | `deepseek-chat` |
| `AI_COMMIT_LANGUAGE` | 提交信息语言（`en` / `zh`） | `en` |
| `AI_COMMIT_MAX_TOKENS` | 最大生成 token 数 | `500` |

## License

MIT
