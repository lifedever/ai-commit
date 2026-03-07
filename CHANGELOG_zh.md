# 更新日志

[English](./CHANGELOG.md)

## [1.3.2] - 2026-03-08

### 修复

- `ai-commit --update` 先检查远程版本号，版本一致时跳过重新安装

## [1.3.1] - 2026-03-08

### 新增

- 自动更新检查：每次运行异步检查 GitHub 最新版本（非阻塞，3 秒超时）
- 检查结果缓存 24 小时（`~/.ai-commit/.update-check`）
- 有新版本时命令结束后以黄色文字提示

## [1.3.0] - 2026-03-08

### 新增

- 生成后显示元信息汇总行（provider、model、tokens、耗时），灰色 dim 字体
- OpenAI 模式返回 token 用量，Claude 模式解析 JSON 返回元信息

## [1.2.0] - 2026-03-08

### 新增

- Claude Code 作为 LLM provider（`-p claude` / `AI_COMMIT_PROVIDER=claude`）
- Claude Code 自主读取项目源文件理解上下文，生成更高质量的 commit message
- 新增 `-p, --provider` CLI 参数
- claude 模式无需配置 API Key

## [1.1.1] - 2026-03-07

### 新增

- emoji 支持：`-e` 参数和 `AI_COMMIT_EMOJI` 环境变量
- commit message 前添加相关 emoji（✨ feat、🐛 fix 等）

## [1.1.0] - 2026-03-07

### 新增

- `ai-commit --update` 更新命令
- `ai-commit --uninstall` 卸载命令
- MIT License

### 修复

- install.sh 增加前置检查和错误处理

## [1.0.0] - 2026-03-07

### 新增

- 核心功能：分析 `git diff --cached`，调用 OpenAI 兼容 API 生成 commit message
- Conventional Commits 格式输出
- 交互式确认、编辑、重新生成、取消
- 中英文支持（`-l en/zh`）
- 一行命令安装（`install.sh`）
- 支持 DeepSeek、OpenAI、火山引擎、Ollama 等任何 OpenAI API 兼容服务
