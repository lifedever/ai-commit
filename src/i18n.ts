type Language = "en" | "zh";

const messages = {
  // Help text
  helpVersion: { en: "Show version", zh: "显示版本号" },
  helpYes: { en: "Skip confirmation, commit directly", zh: "跳过确认，直接提交" },
  helpLanguage: { en: "Specify language (en/zh)", zh: "指定语言 (en/zh)" },
  helpModel: { en: "Specify model", zh: "指定模型" },
  helpEmoji: { en: "Add emoji before commit message", zh: "在 commit message 前添加 emoji" },
  helpDryRun: { en: "Generate message only, do not commit", zh: "仅生成 message，不提交" },
  helpUpdate: { en: "Update to latest version", zh: "更新到最新版本" },
  helpUninstall: { en: "Uninstall ai-commit", zh: "卸载 ai-commit" },
  helpHelp: { en: "Show help", zh: "显示帮助信息" },

  // Update
  checkingUpdate: { en: "Checking for updates...", zh: "正在检查更新..." },
  alreadyLatest: { en: `Already up to date`, zh: `当前已是最新版本` },
  foundNewVersion: { en: "Found new version", zh: "发现新版本" },
  updating: { en: "updating...", zh: "正在更新..." },
  cannotCheckRemote: { en: "Cannot check remote version, continuing update...", zh: "无法检查远程版本，继续更新..." },
  updateFailed: { en: "Update failed, please run manually:", zh: "更新失败，请手动执行:" },
  newVersionAvailable: { en: "New version", zh: "新版本" },
  runToUpdate: { en: "available, run ai-commit --update to update", zh: "可用，运行 ai-commit --update 更新" },

  // Uninstall
  uninstalling: { en: "Uninstalling ai-commit...", zh: "正在卸载 ai-commit..." },
  uninstalled: { en: "ai-commit has been uninstalled", zh: "ai-commit 已卸载" },

  // Errors
  errNotGitRepo: { en: "Error: Current directory is not a Git repository", zh: "错误: 当前目录不是 Git 仓库" },
  errNoStagedChanges: { en: "Error: No staged changes, please run git add first", zh: "错误: 没有暂存的改动，请先 git add" },
  errNoApiKey: {
    en: "Error: AI_COMMIT_API_KEY environment variable is not set\n\nAdd to ~/.bashrc or ~/.zshrc:\n  export AI_COMMIT_API_KEY=\"sk-your-api-key\"\n\nSupports DeepSeek, OpenAI, and any OpenAI API compatible service.\n\nOr use Claude Code as provider:\n  export AI_COMMIT_PROVIDER=\"claude\"",
    zh: "错误: 未设置 AI_COMMIT_API_KEY 环境变量\n\n请在 ~/.bashrc 或 ~/.zshrc 中添加:\n  export AI_COMMIT_API_KEY=\"sk-your-api-key\"\n\n支持 DeepSeek、OpenAI 及任何 OpenAI API 兼容服务。\n\n或使用 Claude Code 作为 provider:\n  export AI_COMMIT_PROVIDER=\"claude\"",
  },
  errUnsupportedLang: { en: "Error: Unsupported language", zh: "错误: 不支持的语言" },
  errGenerate: { en: "Generation failed", zh: "生成失败" },

  // Main flow
  generating: { en: "Generating commit message...", zh: "正在生成 commit message..." },
  regenerating: { en: "Regenerating...", zh: "正在重新生成..." },
  commitSuccess: { en: "Committed successfully", zh: "提交成功" },
  cancelled: { en: "Cancelled", zh: "已取消" },

  // Interactive menu
  selectAction: { en: "Select an action:", zh: "请选择操作:" },
  actionCommit: { en: "Commit", zh: "确认提交" },
  actionEdit: { en: "Edit and commit", zh: "编辑后提交" },
  actionRegenerate: { en: "Regenerate", zh: "重新生成" },
  actionCancel: { en: "Cancel", zh: "取消" },
  editMessage: { en: "Edit commit message:", zh: "编辑 commit message:" },
} as const;

type MessageKey = keyof typeof messages;

let currentLang: Language = "en";

export function setLanguage(lang: Language) {
  currentLang = lang;
}

export function t(key: MessageKey): string {
  return messages[key][currentLang];
}

/**
 * Get language from env before config is loaded (for pre-Commander messages).
 */
export function initLanguageFromEnv() {
  const lang = process.env.AI_COMMIT_LANGUAGE;
  if (lang === "zh") {
    currentLang = "zh";
  }
}
