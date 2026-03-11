# 更新日志

[English](./CHANGELOG.md)

## [1.3.8] - 2026-03-11

### 修复

- Claude provider 现在能处理大 diff（>15K 字符），直接传入截断后的 diff 而非让 Claude 自己运行 git diff，避免大规模变更时超时
- 提取共享的 `prepareDiffContent` 工具函数，两种 provider 使用一致的 diff 截断策略

## [1.3.7] - 2026-03-08

### 新增

- 终端提示语言跟随 `AI_COMMIT_LANGUAGE` 配置（默认英文，设为 `zh` 显示中文）

## [1.3.6] - 2026-03-08

### 优化

- 支持 `-v` 查看版本号
- 代码清理与细节优化
- 修复已知问题

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
