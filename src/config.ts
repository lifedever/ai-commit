export interface Config {
  apiKey: string;
  apiUrl: string;
  model: string;
  language: "en" | "zh";
  maxTokens: number;
  emoji: boolean;
}

export function loadConfig(overrides?: Partial<Pick<Config, "language" | "model" | "emoji">>): Config {
  const apiKey = process.env.AI_COMMIT_API_KEY;
  if (!apiKey) {
    console.error(
      "错误: 未设置 AI_COMMIT_API_KEY 环境变量\n\n" +
      "请在 ~/.bashrc 或 ~/.zshrc 中添加:\n" +
      '  export AI_COMMIT_API_KEY="sk-your-api-key"\n\n' +
      "支持 DeepSeek、OpenAI 及任何 OpenAI API 兼容服务。"
    );
    process.exit(1);
  }

  const language = overrides?.language ?? process.env.AI_COMMIT_LANGUAGE ?? "en";
  if (language !== "en" && language !== "zh") {
    console.error(`错误: 不支持的语言 "${language}"，仅支持 en 或 zh`);
    process.exit(1);
  }

  return {
    apiKey,
    apiUrl: process.env.AI_COMMIT_API_URL ?? "https://api.deepseek.com/v1/chat/completions",
    model: overrides?.model ?? process.env.AI_COMMIT_MODEL ?? "deepseek-chat",
    language,
    maxTokens: parseInt(process.env.AI_COMMIT_MAX_TOKENS ?? "500", 10),
    emoji: overrides?.emoji ?? process.env.AI_COMMIT_EMOJI === "true",
  };
}
