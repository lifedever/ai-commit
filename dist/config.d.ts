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
export declare function loadConfig(overrides?: Partial<Pick<Config, "language" | "model" | "emoji" | "provider">>): Config;
