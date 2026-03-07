# 写了个小工具：AI 自动生成 Git Commit Message，一行命令安装

每次写 commit message 都很纠结？写得太随意又不规范？

做了一个命令行工具 **ai-commit**，自动分析 `git diff`，调用大模型生成 [Conventional Commits](https://www.conventionalcommits.org/) 格式的提交信息。

## 效果

```
$ git add .
$ ai-commit

正在生成 commit message...

──────────────────────────────────────────────────
feat(auth): add JWT token refresh mechanism
──────────────────────────────────────────────────

? 请选择操作:
❯ 确认提交
  编辑后提交
  重新生成
  取消
```

## 安装

```bash
curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash
```

需要 Node.js >= 18，一行搞定。

## 配置

只需要一个环境变量，配置你的 API Key：

```bash
# DeepSeek（默认）
export AI_COMMIT_API_KEY="sk-your-key"

# 也支持 OpenAI、火山引擎、Ollama 等任何 OpenAI 兼容 API
```

## 特点

- **零配置即用** — 默认 DeepSeek，配一个 Key 就能跑
- **Conventional Commits** — 自动生成 feat/fix/docs/refactor 等规范格式
- **交互式确认** — 生成后可以确认、编辑、重新生成或取消
- **中英文** — `ai-commit -l zh` 生成中文 commit message
- **模型随意切** — 支持任何 OpenAI API 兼容服务（DeepSeek、OpenAI、火山引擎、Ollama 本地模型等）
- **Claude Code 加持** — `ai-commit -p claude` 直接调用 Claude Code，能读取项目源文件理解上下文，commit message 质量更高
- **更新/卸载** — `ai-commit --update` 更新，`ai-commit --uninstall` 卸载

## 常用命令

```bash
ai-commit           # 交互式生成并提交
ai-commit -y        # 跳过确认直接提交
ai-commit -d        # 只看生成结果不提交
ai-commit -l zh     # 中文 commit message
ai-commit -p claude # 用 Claude Code 生成
ai-commit --update  # 更新到最新版
```

GitHub: https://github.com/lifedever/ai-commit

MIT 开源，TypeScript 写的，代码很简单。欢迎 Star、提 Issue、PR。
