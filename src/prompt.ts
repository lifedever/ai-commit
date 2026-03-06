export function getSystemPrompt(language: string, emoji: boolean): string {
  const langInstruction = language === "zh"
    ? "请用中文编写 commit message。"
    : "Write the commit message in English.";

  const emojiInstruction = emoji
    ? `- Add a relevant emoji at the beginning of the subject, e.g.:
  ✨ feat, 🐛 fix, 📝 docs, 💄 style, ♻️ refactor, ✅ test, 🔧 chore, ⚡ perf, 👷 ci, 📦 build
  Format: <emoji> <type>(<scope>): <subject>`
    : "- Format: <type>(<scope>): <subject>";

  return `You are a Git commit message generator. Analyze the provided git diff and generate a commit message following the Conventional Commits format.

Rules:
${emojiInstruction}
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
- Scope is optional, inferred from changed file paths
- Subject must be concise, no more than 72 characters, lowercase, no period at the end
- If necessary, add a body after a blank line to explain key changes
- Output ONLY the commit message, nothing else
- ${langInstruction}`;
}
