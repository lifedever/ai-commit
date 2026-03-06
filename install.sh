#!/bin/bash
set -e

INSTALL_DIR="$HOME/.ai-commit"
REPO="https://github.com/lifedever/ai-commit.git"

echo "🔧 Installing ai-commit..."

# Clean previous installation
if [ -d "$INSTALL_DIR" ]; then
  echo "📦 Removing previous version..."
  cd "$INSTALL_DIR" && npm unlink -g 2>/dev/null || true
  rm -rf "$INSTALL_DIR"
fi

# Clone and install
echo "📥 Downloading latest version..."
git clone --depth 1 "$REPO" "$INSTALL_DIR"

cd "$INSTALL_DIR"
echo "📦 Installing dependencies and building..."
npm install --include=dev --ignore-scripts
npm run build

echo "🔗 Linking globally..."
chmod +x dist/index.js
npm link

echo ""
echo "✅ ai-commit installed successfully!"
echo ""
echo "Usage:"
echo "  1. Set your API key:"
echo "     export AI_COMMIT_API_KEY=\"sk-your-api-key\""
echo ""
echo "  2. Stage changes and run:"
echo "     git add ."
echo "     ai-commit"
