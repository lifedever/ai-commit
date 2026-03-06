export interface Config {
    apiKey: string;
    apiUrl: string;
    model: string;
    language: "en" | "zh";
    maxTokens: number;
}
export declare function loadConfig(overrides?: Partial<Pick<Config, "language" | "model">>): Config;
