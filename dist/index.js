#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const commander_1 = require("commander");
const prompts_1 = require("@inquirer/prompts");
const config_1 = require("./config");
const git_1 = require("./git");
const llm_1 = require("./llm");
const claude_1 = require("./claude");
const update_check_1 = require("./update-check");
const path_1 = __importDefault(require("path"));
const LOCAL_VERSION = "1.3.2";
// Handle subcommands before Commander parses
const subcommand = process.argv[2];
if (subcommand === "--help" || subcommand === "-h") {
    console.log(`Usage: ai-commit [options]

AI-powered Git commit message generator

Options:
  -V, --version          显示版本号
  -y, --yes              跳过确认，直接提交
  -l, --language <lang>  指定语言 (en/zh)
  -m, --model <model>    指定模型
  -e, --emoji            在 commit message 前添加 emoji
  -d, --dry-run          仅生成 message，不提交
  -p, --provider <provider>  LLM provider (openai/claude)
  --update               更新到最新版本
  --uninstall            卸载 ai-commit
  -h, --help             显示帮助信息`);
    process.exit(0);
}
if (subcommand === "update" || subcommand === "--update") {
    console.log("正在检查更新...");
    try {
        const result = (0, child_process_1.execSync)('curl -sf --max-time 5 https://raw.githubusercontent.com/lifedever/ai-commit/main/package.json', { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
        const remote = JSON.parse(result);
        if (remote.version === LOCAL_VERSION) {
            console.log(`当前已是最新版本 v${LOCAL_VERSION}`);
            process.exit(0);
        }
        console.log(`发现新版本 v${remote.version}（当前 v${LOCAL_VERSION}），正在更新...`);
    }
    catch {
        console.log("无法检查远程版本，继续更新...");
    }
    try {
        (0, child_process_1.execSync)("curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash", {
            stdio: "inherit",
            shell: "/bin/bash",
        });
    }
    catch {
        console.error("更新失败，请手动执行:");
        console.error("  curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash");
        process.exit(1);
    }
    process.exit(0);
}
if (subcommand === "uninstall" || subcommand === "--uninstall") {
    const installDir = path_1.default.resolve(process.env.HOME || "~", ".ai-commit");
    console.log("正在卸载 ai-commit...");
    try {
        (0, child_process_1.execSync)("npm unlink -g ai-commit-cli", { stdio: "inherit" });
    }
    catch {
        // ignore if not linked
    }
    try {
        (0, fs_1.rmSync)(installDir, { recursive: true, force: true });
    }
    catch {
        // ignore
    }
    console.log("✅ ai-commit 已卸载");
    process.exit(0);
}
const program = new commander_1.Command();
program
    .name("ai-commit")
    .description("AI-powered Git commit message generator")
    .version(LOCAL_VERSION)
    .option("-y, --yes", "跳过确认，直接提交")
    .option("-l, --language <lang>", "指定语言 (en/zh)")
    .option("-m, --model <model>", "指定模型")
    .option("-e, --emoji", "在 commit message 前添加 emoji")
    .option("-d, --dry-run", "仅生成 message，不提交")
    .option("-p, --provider <provider>", "LLM provider (openai/claude)")
    .action(async (opts) => {
    // Start update check early (non-blocking)
    const updatePromise = (0, update_check_1.checkForUpdate)(LOCAL_VERSION);
    if (!(0, git_1.isGitRepo)()) {
        console.error("错误: 当前目录不是 Git 仓库");
        process.exit(1);
    }
    const diff = (0, git_1.getStagedDiff)();
    if (!diff) {
        console.error("错误: 没有暂存的改动，请先 git add");
        process.exit(1);
    }
    const config = (0, config_1.loadConfig)({
        language: opts.language,
        model: opts.model,
        emoji: opts.emoji,
        provider: opts.provider,
    });
    const dim = (s) => `\x1b[2m${s}\x1b[0m`;
    const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
    async function showUpdateHint() {
        const latest = await updatePromise;
        if (latest) {
            console.log(yellow(`💡 新版本 v${latest} 可用（当前 v${LOCAL_VERSION}），运行 ai-commit --update 更新`));
        }
    }
    function printResult(result, elapsed) {
        console.log("\n" + "─".repeat(50));
        console.log(result.message);
        console.log("─".repeat(50));
        const parts = [
            `provider: ${result.provider}`,
            result.model ? `model: ${result.model}` : "",
            result.tokensUsed ? `tokens: ${result.tokensUsed}` : "",
            `time: ${elapsed}s`,
        ].filter(Boolean);
        console.log(dim(parts.join("  ·  ")));
        console.log();
    }
    let result;
    try {
        console.log("正在生成 commit message...");
        const start = Date.now();
        result = await (config.provider === "claude"
            ? (0, claude_1.generateCommitMessageWithClaude)(config)
            : (0, llm_1.generateCommitMessage)(diff, config));
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        printResult(result, elapsed);
    }
    catch (err) {
        console.error(`生成失败: ${err.message}`);
        process.exit(1);
    }
    let message = result.message;
    if (opts.dryRun) {
        await showUpdateHint();
        return;
    }
    if (opts.yes) {
        (0, git_1.commit)(message);
        console.log("✓ 提交成功");
        await showUpdateHint();
        return;
    }
    const generateFn = () => config.provider === "claude"
        ? (0, claude_1.generateCommitMessageWithClaude)(config)
        : (0, llm_1.generateCommitMessage)(diff, config);
    // Interactive loop
    while (true) {
        const action = await (0, prompts_1.select)({
            message: "请选择操作:",
            choices: [
                { name: "确认提交", value: "commit" },
                { name: "编辑后提交", value: "edit" },
                { name: "重新生成", value: "regenerate" },
                { name: "取消", value: "cancel" },
            ],
        });
        if (action === "commit") {
            (0, git_1.commit)(message);
            console.log("✓ 提交成功");
            await showUpdateHint();
            return;
        }
        if (action === "edit") {
            const edited = await (0, prompts_1.input)({
                message: "编辑 commit message:",
                default: message,
            });
            if (edited.trim()) {
                (0, git_1.commit)(edited.trim());
                console.log("✓ 提交成功");
            }
            await showUpdateHint();
            return;
        }
        if (action === "regenerate") {
            try {
                console.log("正在重新生成...");
                const start = Date.now();
                result = await generateFn();
                const elapsed = ((Date.now() - start) / 1000).toFixed(1);
                message = result.message;
                printResult(result, elapsed);
            }
            catch (err) {
                console.error(`生成失败: ${err.message}`);
            }
            continue;
        }
        // cancel
        console.log("已取消");
        await showUpdateHint();
        return;
    }
});
program.parse();
