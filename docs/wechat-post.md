分享一个小工具：AI 自动生成 Git Commit Message 🎉

一行安装：
curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash

使用：
git add .
ai-commit

自动分析代码改动，生成规范的 commit message，支持 DeepSeek/OpenAI/火山引擎/Ollama/Claude Code 等，中英文都行。新增 Claude Code provider，能自主读取源文件理解上下文，commit 质量更高：ai-commit -p claude

GitHub：https://github.com/lifedever/ai-commit
欢迎 Star ⭐
