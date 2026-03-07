# AI Commit - 智能 Git Commit Message 生成器

## 项目概述

AI Commit 是一个命令行工具，通过分析 `git diff` 内容，调用大语言模型自动生成规范的 Git Commit Message。支持两种 provider：OpenAI 兼容 API（DeepSeek、OpenAI、火山引擎、Ollama 等）和 Claude Code（通过 `claude -p` 调用，能自主读取源文件理解上下文）。所有敏感配置通过环境变量管理。

## 核心特性

- 自动分析 staged changes，生成 Conventional Commits 格式的 commit message
- 支持任意 OpenAI API 兼容的大模型服务（DeepSeek、通义千问、GLM、Ollama 等）
- 支持 Claude Code 作为 provider，自主读取项目源文件，生成更高质量的 commit message
- 环境变量配置，安全管理 API Key
- 生成后支持交互式确认、编辑或重新生成
- 支持中/英文 commit message
- 可作为 git 子命令使用（`git ac`）

## 技术选型

| 项目 | 选择 | 理由 |
|------|------|------|
| 语言 | Node.js (TypeScript) | 生态成熟，npm 分发方便，跨平台 |
| CLI 框架 | Commander.js | 轻量、主流 |
| HTTP 请求 | node-fetch / 内置 fetch | 调用 LLM API |
| 交互 | Inquirer.js | 终端交互体验好 |
| 包管理 | npm | 通过 `npx` 可免安装使用 |

## 环境变量配置

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `AI_COMMIT_API_KEY` | LLM 服务的 API Key（openai 模式必需） | `sk-xxxxxxxx` |

### 可选变量（均有默认值）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `AI_COMMIT_PROVIDER` | LLM provider | `openai`（默认）或 `claude` |
| `AI_COMMIT_API_URL` | API 端点地址 | `https://api.deepseek.com/v1/chat/completions` |
| `AI_COMMIT_MODEL` | 模型名称 | `deepseek-chat` |
| `AI_COMMIT_LANGUAGE` | commit message 语言 | `en`（可选 `zh`） |
| `AI_COMMIT_MAX_TOKENS` | 最大生成 token 数 | `500` |

### 配置示例

```bash
# ~/.bashrc 或 ~/.zshrc

# DeepSeek（默认）
export AI_COMMIT_API_KEY="sk-your-deepseek-key"

# 如果使用 Claude Code
export AI_COMMIT_PROVIDER="claude"
# 无需 API Key，Claude Code 自己管理认证

# 如果使用 OpenAI
export AI_COMMIT_API_KEY="sk-your-openai-key"
export AI_COMMIT_API_URL="https://api.openai.com/v1/chat/completions"
export AI_COMMIT_MODEL="gpt-4o-mini"

# 如果使用本地 Ollama
export AI_COMMIT_API_KEY="ollama"
export AI_COMMIT_API_URL="http://localhost:11434/v1/chat/completions"
export AI_COMMIT_MODEL="qwen2.5"
```

## 项目结构

```
ai-commit/
├── src/
│   ├── index.ts          # CLI 入口
│   ├── config.ts         # 环境变量读取与校验
│   ├── git.ts            # Git 操作（获取 diff、执行 commit）
│   ├── llm.ts            # OpenAI 兼容 API 调用
│   ├── claude.ts         # Claude Code provider（通过 claude -p 调用）
│   └── prompt.ts         # Prompt 模板管理
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── .env.example
```

## 模块设计

### 1. config.ts - 配置管理

```typescript
interface Config {
  provider: "openai" | "claude";
  apiKey: string;
  apiUrl: string;
  model: string;
  language: "en" | "zh";
  maxTokens: number;
}

function loadConfig(): Config;
// 从环境变量读取配置，缺少 API_KEY 时抛出明确错误提示
```

### 2. git.ts - Git 操作

```typescript
function getStagedDiff(): string;
// 执行 git diff --cached，返回 diff 内容
// 无 staged changes 时抛出提示

function commit(message: string): void;
// 执行 git commit -m "message"
```

### 3. claude.ts - Claude Code 调用

```typescript
async function generateCommitMessageWithClaude(config: Config): Promise<string>;
// 检查 claude CLI 是否存在，构造 prompt，调用 claude -p
// Claude 自己运行 git diff --cached 并读取源文件理解上下文
// 不传 diff 内容，让 Claude 自主获取，这是比 API 模式质量更高的原因
```

### 4. llm.ts - OpenAI 兼容 API 调用

```typescript
async function generateCommitMessage(diff: string, config: Config): Promise<string>;
// 构建请求体，调用 OpenAI 兼容 API，返回生成的 commit message
```

请求体格式（OpenAI 兼容）：

```json
{
  "model": "deepseek-chat",
  "messages": [
    { "role": "system", "content": "系统提示词" },
    { "role": "user", "content": "git diff 内容" }
  ],
  "max_tokens": 500,
  "temperature": 0.3
}
```

### 5. prompt.ts - Prompt 模板

```typescript
function getSystemPrompt(language: string): string;
```

System Prompt 核心要求：
- 输出 Conventional Commits 格式：`<type>(<scope>): <subject>`
- type 包含：feat / fix / docs / style / refactor / test / chore / perf / ci / build
- scope 可选，从改动文件路径推断
- subject 简洁，不超过 72 字符
- 如有必要，附加 body 说明关键改动
- 只输出 commit message，不输出其他内容

### 6. index.ts - CLI 主流程

```
┌─────────────────────────┐
│  读取环境变量配置         │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│  获取 git staged diff    │
│  （无改动则退出）         │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│  调用 LLM 生成 message   │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│  展示 message，用户选择   │
│  ┌─ 确认提交             │
│  ├─ 编辑后提交           │
│  ├─ 重新生成             │
│  └─ 取消                 │
└─────────────────────────┘
```

CLI 参数：

```
Usage: ai-commit [options]

Options:
  -y, --yes        跳过确认，直接提交
  -l, --language   指定语言（覆盖环境变量）
  -m, --model      指定模型（覆盖环境变量）
  -p, --provider   LLM provider（openai/claude）
  -d, --dry-run    仅生成 message，不提交
  -v, --version    显示版本号
  -h, --help       显示帮助信息
```

## 安装与使用

### 安装

```bash
# 全局安装
npm install -g ai-commit-cli

# 或免安装使用
npx ai-commit-cli
```

### 使用

```bash
# 1. 配置环境变量
export AI_COMMIT_API_KEY="sk-your-key"

# 2. 正常开发，暂存改动
git add .

# 3. 生成并提交
ai-commit

# 直接提交，跳过确认
ai-commit -y

# 仅预览，不提交
ai-commit --dry-run

# 使用中文
ai-commit -l zh
```

### 设置 Git 别名（可选）

```bash
git config --global alias.ac '!npx ai-commit-cli'
# 之后可使用 git ac
```

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 未设置 `AI_COMMIT_API_KEY` | 输出配置指引并退出 |
| 不在 Git 仓库中 | 提示"当前目录不是 Git 仓库" |
| 无 staged changes | 提示"没有暂存的改动，请先 git add" |
| API 请求失败 | 展示错误信息（状态码 + 响应内容） |
| diff 内容过长 | 截断并提示，或仅发送 `--stat` 摘要 |

## Diff 过长处理策略

当 diff 超过模型上下文限制时，按优先级降级：

1. 完整 diff（默认）
2. 截断 diff，保留前 N 行 + `git diff --stat` 概要
3. 仅发送 `git diff --stat` + 变更文件列表

## 发布计划

### v1.0.0

- 核心功能：diff 分析 + commit message 生成
- 交互式确认流程
- OpenAI 兼容 API 支持
- 中英文支持

### v1.1.0（规划）

- 支持配置文件 `.aicommitrc`
- 自定义 Prompt 模板
- `git hook` 集成（prepare-commit-msg）

### v1.2.0（规划）

- 多 commit message 候选
- 支持 monorepo（按 package 分组 diff）

## 开源协议

MIT License
