"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommitMessageWithClaude = generateCommitMessageWithClaude;
const child_process_1 = require("child_process");
const prompt_1 = require("./prompt");
function isClaudeInstalled() {
    try {
        (0, child_process_1.execSync)("which claude", { stdio: "ignore" });
        return true;
    }
    catch {
        return false;
    }
}
async function generateCommitMessageWithClaude(config) {
    if (!isClaudeInstalled()) {
        throw new Error("未找到 claude 命令。请先安装 Claude Code:\n" +
            "  npm install -g @anthropic-ai/claude-code\n\n" +
            "安装后请确保 claude 命令在 PATH 中可用。");
    }
    const systemPrompt = (0, prompt_1.getSystemPrompt)(config.language, config.emoji);
    const prompt = `${systemPrompt}

Please run \`git diff --cached\` to see the staged changes, then read any relevant source files to understand the context. Based on your analysis, generate a commit message.

Output ONLY the commit message, nothing else.`;
    const escapedPrompt = prompt.replace(/'/g, "'\\''");
    const raw = (0, child_process_1.execSync)(`claude -p '${escapedPrompt}' --allowedTools 'Bash(git diff *),Bash(git log *),Read' --output-format json --max-turns 3`, {
        timeout: 60000,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    let message;
    let tokensUsed;
    let model;
    try {
        const json = JSON.parse(raw);
        message = (json.result ?? "").trim();
        model = json.model;
        if (json.usage) {
            tokensUsed = (json.usage.input_tokens ?? 0) + (json.usage.output_tokens ?? 0);
        }
    }
    catch {
        message = raw.trim();
    }
    if (!message) {
        throw new Error("Claude 返回内容为空");
    }
    return { message, provider: "claude", model, tokensUsed };
}
