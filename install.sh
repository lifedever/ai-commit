#!/bin/bash
set -e

INSTALL_DIR="$HOME/.ai-commit"
REPO="https://github.com/lifedever/ai-commit.git"
REQUIRED_NODE_VERSION=18

# ─── Helper ──────────────────────────────────────
fail() {
  echo "❌ $1" >&2
  exit 1
}

# ─── Pre-flight checks ──────────────────────────
command -v git  >/dev/null 2>&1 || fail "未找到 git，请先安装 Git"
command -v node >/dev/null 2>&1 || fail "未找到 node，请先安装 Node.js >= $REQUIRED_NODE_VERSION"
command -v npm  >/dev/null 2>&1 || fail "未找到 npm，请先安装 Node.js >= $REQUIRED_NODE_VERSION"

NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_VERSION" ]; then
  fail "Node.js 版本过低 (v$(node -v))，需要 >= $REQUIRED_NODE_VERSION"
fi

# ─── Clean previous installation ─────────────────
echo "🔧 Installing ai-commit..."

if [ -d "$INSTALL_DIR" ]; then
  echo "📦 Removing previous version..."
  (cd "$INSTALL_DIR" && npm unlink -g 2>/dev/null) || true
  rm -rf "$INSTALL_DIR"
fi

# ─── Clone ───────────────────────────────────────
echo "📥 Downloading latest version..."
git clone --depth 1 "$REPO" "$INSTALL_DIR" || fail "下载失败，请检查网络连接"

# ─── Install & Build (in subshell to protect cwd) ─
(
  cd "$INSTALL_DIR"

  echo "📦 Installing dependencies..."
  npm install --include=dev --ignore-scripts || fail "依赖安装失败"

  echo "🔨 Building..."
  npm run build || fail "构建失败"

  [ -f dist/index.js ] || fail "构建产物 dist/index.js 不存在"
  chmod +x dist/index.js

  echo "🔗 Linking globally..."
  npm link 2>/dev/null || {
    echo "⚠️  npm link 失败，尝试使用 sudo..."
    sudo npm link || fail "npm link 失败，请检查权限"
  }
)

VERSION=$(node -e "console.log(require('$INSTALL_DIR/package.json').version)" 2>/dev/null || echo "unknown")

cat <<EOF

✅ ai-commit installed successfully! (v${VERSION})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Quick Start:

  1. Set your API key (add to ~/.bashrc or ~/.zshrc):

     export AI_COMMIT_API_KEY="sk-your-api-key"

  2. (Optional) Configure LLM provider:

     # Default: DeepSeek
     # No extra config needed

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

     # Claude Code (no API key needed)
     export AI_COMMIT_PROVIDER="claude"

  3. (Optional) Other settings:

     export AI_COMMIT_LANGUAGE="zh"    # Commit message language (en/zh)
     export AI_COMMIT_MAX_TOKENS="500" # Max tokens for generation

  4. Usage:

     git add .
     ai-commit              # Interactive mode
     ai-commit -y           # Auto-commit
     ai-commit -d           # Dry run (preview only)
     ai-commit -l zh        # Chinese commit message
     ai-commit -m gpt-4o    # Use specific model
     ai-commit -p claude    # Use Claude Code as provider
     ai-commit --update     # Update to latest version
     ai-commit --uninstall  # Uninstall

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  GitHub: https://github.com/lifedever/ai-commit

EOF
