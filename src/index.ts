#!/usr/bin/env node

import { execSync } from "child_process";
import { Command } from "commander";
import { select, input } from "@inquirer/prompts";
import { loadConfig } from "./config";
import { isGitRepo, getStagedDiff, commit } from "./git";
import { generateCommitMessage } from "./llm";
import path from "path";

// Handle subcommands before Commander parses
const subcommand = process.argv[2];

if (subcommand === "uninstall") {
  const installDir = path.resolve(process.env.HOME || "~", ".ai-commit");
  console.log("正在卸载 ai-commit...");
  try {
    execSync("npm unlink -g ai-commit-cli", { stdio: "inherit" });
  } catch {
    // ignore if not linked
  }
  try {
    execSync(`rm -rf "${installDir}"`, { stdio: "inherit" });
  } catch {
    // ignore
  }
  console.log("✅ ai-commit 已卸载");
  process.exit(0);
}

const program = new Command();

program
  .name("ai-commit")
  .description("AI-powered Git commit message generator")
  .version("1.0.0")
  .option("-y, --yes", "跳过确认，直接提交")
  .option("-l, --language <lang>", "指定语言 (en/zh)")
  .option("-m, --model <model>", "指定模型")
  .option("-d, --dry-run", "仅生成 message，不提交")
  .action(async (opts) => {
    if (!isGitRepo()) {
      console.error("错误: 当前目录不是 Git 仓库");
      process.exit(1);
    }

    const diff = getStagedDiff();
    if (!diff) {
      console.error("错误: 没有暂存的改动，请先 git add");
      process.exit(1);
    }

    const config = loadConfig({
      language: opts.language,
      model: opts.model,
    });

    let message: string;
    try {
      console.log("正在生成 commit message...");
      message = await generateCommitMessage(diff, config);
    } catch (err: any) {
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
      commit(message);
      console.log("✓ 提交成功");
      return;
    }

    // Interactive loop
    while (true) {
      const action = await select({
        message: "请选择操作:",
        choices: [
          { name: "确认提交", value: "commit" },
          { name: "编辑后提交", value: "edit" },
          { name: "重新生成", value: "regenerate" },
          { name: "取消", value: "cancel" },
        ],
      });

      if (action === "commit") {
        commit(message);
        console.log("✓ 提交成功");
        return;
      }

      if (action === "edit") {
        const edited = await input({
          message: "编辑 commit message:",
          default: message,
        });
        if (edited.trim()) {
          commit(edited.trim());
          console.log("✓ 提交成功");
        }
        return;
      }

      if (action === "regenerate") {
        try {
          console.log("正在重新生成...");
          message = await generateCommitMessage(diff, config);
          console.log("\n" + "─".repeat(50));
          console.log(message);
          console.log("─".repeat(50) + "\n");
        } catch (err: any) {
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
