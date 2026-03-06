"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCommitMessage = generateCommitMessage;
const prompt_1 = require("./prompt");
const git_1 = require("./git");
const MAX_DIFF_LENGTH = 15000;
function prepareDiffContent(diff) {
    if (diff.length <= MAX_DIFF_LENGTH) {
        return diff;
    }
    const stat = (0, git_1.getStagedStat)();
    const truncated = diff.substring(0, MAX_DIFF_LENGTH);
    if (truncated.length + stat.length < MAX_DIFF_LENGTH * 1.5) {
        return `[Note: diff truncated due to length]\n\n${stat}\n\n${truncated}`;
    }
    return `[Note: only stat summary provided due to diff size]\n\n${stat}`;
}
async function generateCommitMessage(diff, config) {
    const content = prepareDiffContent(diff);
    const body = {
        model: config.model,
        messages: [
            { role: "system", content: (0, prompt_1.getSystemPrompt)(config.language) },
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
    const data = (await response.json());
    const message = data.choices?.[0]?.message?.content?.trim();
    if (!message) {
        throw new Error("API 返回内容为空");
    }
    return message;
}
