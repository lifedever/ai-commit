import { Config, GenerateResult } from "./config";
import { getSystemPrompt } from "./prompt";
import { getStagedStat } from "./git";

const MAX_DIFF_LENGTH = 15000;

interface ChatResponse {
  choices: { message: { content: string } }[];
  usage?: { total_tokens?: number };
}

function prepareDiffContent(diff: string): string {
  if (diff.length <= MAX_DIFF_LENGTH) {
    return diff;
  }

  const stat = getStagedStat();
  const truncated = diff.substring(0, MAX_DIFF_LENGTH);

  if (truncated.length + stat.length < MAX_DIFF_LENGTH * 1.5) {
    return `[Note: diff truncated due to length]\n\n${stat}\n\n${truncated}`;
  }

  return `[Note: only stat summary provided due to diff size]\n\n${stat}`;
}

export async function generateCommitMessage(diff: string, config: Config): Promise<GenerateResult> {
  const content = prepareDiffContent(diff);

  const body = {
    model: config.model,
    messages: [
      { role: "system", content: getSystemPrompt(config.language, config.emoji) },
      { role: "user", content },
    ],
    max_tokens: config.maxTokens,
    temperature: 0.3,
  };

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${text}`);
  }

  const data = (await response.json()) as ChatResponse;
  const message = data.choices?.[0]?.message?.content?.trim();

  if (!message) {
    throw new Error("API 返回内容为空");
  }

  return {
    message,
    provider: "openai",
    model: config.model,
    tokensUsed: data.usage?.total_tokens,
  };
}
