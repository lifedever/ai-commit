export interface GenerateResult {
  message: string;
  provider: string;
  model?: string;
  tokensUsed?: number;
}

export interface Config {
  provider: "openai" | "claude";
  apiKey: string;
  apiUrl: string;
  model: string;
  language: "en" | "zh";
  maxTokens: number;
  emoji: boolean;
}

export function loadConfig(overrides?: Partial<Pick<Config, "language" | "model" | "emoji" | "provider">>): Config {
  const { t } = require("./i18n");
  const provider = overrides?.provider ?? (process.env.AI_COMMIT_PROVIDER as Config["provider"]) ?? "openai";

  const apiKey = process.env.AI_COMMIT_API_KEY ?? "";
  if (provider === "openai" && !apiKey) {
    console.error(t("errNoApiKey"));
    process.exit(1);
  }

  const language = overrides?.language ?? process.env.AI_COMMIT_LANGUAGE ?? "en";
  if (language !== "en" && language !== "zh") {
    console.error(`${t("errUnsupportedLang")} "${language}"，en/zh only`);
    process.exit(1);
  }

  return {
    provider,
    apiKey,
    apiUrl: process.env.AI_COMMIT_API_URL ?? "https://api.deepseek.com/v1/chat/completions",
    model: overrides?.model ?? process.env.AI_COMMIT_MODEL ?? "deepseek-chat",
    language,
    maxTokens: parseInt(process.env.AI_COMMIT_MAX_TOKENS ?? "500", 10),
    emoji: overrides?.emoji ?? process.env.AI_COMMIT_EMOJI === "true",
  };
}
