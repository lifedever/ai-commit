"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemPrompt = getSystemPrompt;
function getSystemPrompt(language) {
    const langInstruction = language === "zh"
        ? "请用中文编写 commit message。"
        : "Write the commit message in English.";
    return `You are a Git commit message generator. Analyze the provided git diff and generate a commit message following the Conventional Commits format.

Rules:
- Format: <type>(<scope>): <subject>
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
- Scope is optional, inferred from changed file paths
- Subject must be concise, no more than 72 characters, lowercase, no period at the end
- If necessary, add a body after a blank line to explain key changes
- Output ONLY the commit message, nothing else
- ${langInstruction}`;
}
