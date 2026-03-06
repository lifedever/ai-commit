#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const commander_1 = require("commander");
const prompts_1 = require("@inquirer/prompts");
const config_1 = require("./config");
const git_1 = require("./git");
const llm_1 = require("./llm");
const path_1 = __importDefault(require("path"));
// Handle subcommands before Commander parses
const subcommand = process.argv[2];
if (subcommand === "uninstall") {
    const installDir = path_1.default.resolve(process.env.HOME || "~", ".ai-commit");
    console.log("正在卸载 ai-commit...");
    try {
        (0, child_process_1.execSync)("npm unlink -g ai-commit-cli", { stdio: "inherit" });
    }
    catch {
        // ignore if not linked
    }
    try {
        (0, child_process_1.execSync)(`rm -rf "${installDir}"`, { stdio: "inherit" });
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
    .version("1.0.0")
    .option("-y, --yes", "跳过确认，直接提交")
    .option("-l, --language <lang>", "指定语言 (en/zh)")
    .option("-m, --model <model>", "指定模型")
    .option("-d, --dry-run", "仅生成 message，不提交")
    .action(async (opts) => {
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
    });
    let message;
    try {
        console.log("正在生成 commit message...");
        message = await (0, llm_1.generateCommitMessage)(diff, config);
    }
    catch (err) {
        console.error(`生成失败: ${err.message}`);
        process.exit(1);
    }
    console.log("\n" + "─".repeat(50));
    console.log(message);
    console.log("─".repeat(50) + "\n");
    if (opts.dryRun) {
        return;
    }
    if (opts.yes) {
        (0, git_1.commit)(message);
        console.log("✓ 提交成功");
        return;
    }
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
            return;
        }
        if (action === "regenerate") {
            try {
                console.log("正在重新生成...");
                message = await (0, llm_1.generateCommitMessage)(diff, config);
                console.log("\n" + "─".repeat(50));
                console.log(message);
                console.log("─".repeat(50) + "\n");
            }
            catch (err) {
                console.error(`生成失败: ${err.message}`);
            }
            continue;
        }
        // cancel
        console.log("已取消");
        return;
    }
});
program.parse();
