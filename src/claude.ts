import { execSync } from "child_process";
import { Config } from "./config";
import { getSystemPrompt } from "./prompt";

function isClaudeInstalled(): boolean {
  try {
    execSync("which claude", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function generateCommitMessageWithClaude(config: Config): Promise<string> {
  if (!isClaudeInstalled()) {
    throw new Error(
      "未找到 claude 命令。请先安装 Claude Code:\n" +
      "  npm install -g @anthropic-ai/claude-code\n\n" +
      "安装后请确保 claude 命令在 PATH 中可用。"
    );
  }

  const systemPrompt = getSystemPrompt(config.language, config.emoji);

  const prompt = `${systemPrompt}

Please run \`git diff --cached\` to see the staged changes, then read any relevant source files to understand the context. Based on your analysis, generate a commit message.

Output ONLY the commit message, nothing else.`;

  const escapedPrompt = prompt.replace(/'/g, "'\\''");

  const result = execSync(
    `claude -p '${escapedPrompt}' --allowedTools 'Bash(git diff *),Bash(git log *),Read' --output-format text --max-turns 3`,
    {
      timeout: 60000,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  const message = result.trim();
  if (!message) {
    throw new Error("Claude 返回内容为空");
  }

  return message;
}
