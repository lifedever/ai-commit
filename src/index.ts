#!/usr/bin/env node

import { execSync } from "child_process";
import { rmSync } from "fs";
import { Command } from "commander";
import { select, input } from "@inquirer/prompts";
import { loadConfig, GenerateResult } from "./config";
import { isGitRepo, getStagedDiff, commit } from "./git";
import { generateCommitMessage } from "./llm";
import { generateCommitMessageWithClaude } from "./claude";
import { checkForUpdate } from "./update-check";
import { t, initLanguageFromEnv, setLanguage } from "./i18n";
import path from "path";

const LOCAL_VERSION = "1.3.7";

// Init language from env for pre-Commander messages
initLanguageFromEnv();

const subcommand = process.argv[2];

if (subcommand === "--help" || subcommand === "-h") {
  console.log(`Usage: ai-commit [options]

AI-powered Git commit message generator

Options:
  -v, -V, --version      ${t("helpVersion")}
  -y, --yes              ${t("helpYes")}
  -l, --language <lang>  ${t("helpLanguage")}
  -m, --model <model>    ${t("helpModel")}
  -e, --emoji            ${t("helpEmoji")}
  -d, --dry-run          ${t("helpDryRun")}
  -p, --provider <provider>  LLM provider (openai/claude)
  --update               ${t("helpUpdate")}
  --uninstall            ${t("helpUninstall")}
  -h, --help             ${t("helpHelp")}`);
  process.exit(0);
}

if (subcommand === "update" || subcommand === "--update") {
  console.log(t("checkingUpdate"));
  try {
    const result = execSync(
      'curl -sf --max-time 5 https://raw.githubusercontent.com/lifedever/ai-commit/main/package.json',
      { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }
    );
    const remote = JSON.parse(result) as { version: string };
    if (remote.version === LOCAL_VERSION) {
      console.log(`${t("alreadyLatest")} v${LOCAL_VERSION}`);
      process.exit(0);
    }
    console.log(`${t("foundNewVersion")} v${remote.version}（current v${LOCAL_VERSION}），${t("updating")}`);
  } catch {
    console.log(t("cannotCheckRemote"));
  }
  try {
    execSync("curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash", {
      stdio: "inherit",
      shell: "/bin/bash",
    });
  } catch {
    console.error(`${t("updateFailed")}`);
    console.error("  curl -fsSL https://raw.githubusercontent.com/lifedever/ai-commit/main/install.sh | bash");
    process.exit(1);
  }
  process.exit(0);
}

if (subcommand === "uninstall" || subcommand === "--uninstall") {
  const installDir = path.resolve(process.env.HOME || "~", ".ai-commit");
  console.log(t("uninstalling"));
  try {
    execSync("npm unlink -g ai-commit-cli", { stdio: "inherit" });
  } catch {
    // ignore if not linked
  }
  try {
    rmSync(installDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
  console.log(`✅ ${t("uninstalled")}`);
  process.exit(0);
}

const program = new Command();

program
  .name("ai-commit")
  .description("AI-powered Git commit message generator")
  .version(LOCAL_VERSION, "-v, -V, --version")
  .option("-y, --yes", t("helpYes"))
  .option("-l, --language <lang>", t("helpLanguage"))
  .option("-m, --model <model>", t("helpModel"))
  .option("-e, --emoji", t("helpEmoji"))
  .option("-d, --dry-run", t("helpDryRun"))
  .option("-p, --provider <provider>", "LLM provider (openai/claude)")
  .action(async (opts) => {
    // If --language was passed, update i18n language
    if (opts.language === "zh" || opts.language === "en") {
      setLanguage(opts.language);
    }

    const updatePromise = checkForUpdate(LOCAL_VERSION);
    if (!isGitRepo()) {
      console.error(t("errNotGitRepo"));
      process.exit(1);
    }

    const diff = getStagedDiff();
    if (!diff) {
      console.error(t("errNoStagedChanges"));
      process.exit(1);
    }

    const config = loadConfig({
      language: opts.language,
      model: opts.model,
      emoji: opts.emoji,
      provider: opts.provider,
    });

    const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
    const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

    async function showUpdateHint() {
      const latest = await updatePromise;
      if (latest) {
        console.log(yellow(`💡 ${t("newVersionAvailable")} v${latest} ${t("runToUpdate")}`));
      }
    }

    function printResult(result: GenerateResult, elapsed: string) {
      console.log("\n" + "─".repeat(50));
      console.log(result.message);
      console.log("─".repeat(50));
      const parts: string[] = [
        `provider: ${result.provider}`,
        result.model ? `model: ${result.model}` : "",
        result.tokensUsed ? `tokens: ${result.tokensUsed}` : "",
        `time: ${elapsed}s`,
      ].filter(Boolean);
      console.log(dim(parts.join("  ·  ")));
      console.log();
    }

    let result: GenerateResult;
    try {
      console.log(t("generating"));
      const start = Date.now();
      result = await (config.provider === "claude"
        ? generateCommitMessageWithClaude(diff, config)
        : generateCommitMessage(diff, config));
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      printResult(result, elapsed);
    } catch (err: any) {
      console.error(`${t("errGenerate")}: ${err.message}`);
      process.exit(1);
    }

    let message = result.message;

    if (opts.dryRun) {
      await showUpdateHint();
      return;
    }

    if (opts.yes) {
      commit(message);
      console.log(`✓ ${t("commitSuccess")}`);
      await showUpdateHint();
      return;
    }

    const generateFn = (): Promise<GenerateResult> =>
      config.provider === "claude"
        ? generateCommitMessageWithClaude(diff, config)
        : generateCommitMessage(diff, config);

    // Interactive loop
    while (true) {
      const action = await select({
        message: t("selectAction"),
        choices: [
          { name: t("actionCommit"), value: "commit" },
          { name: t("actionEdit"), value: "edit" },
          { name: t("actionRegenerate"), value: "regenerate" },
          { name: t("actionCancel"), value: "cancel" },
        ],
      });

      if (action === "commit") {
        commit(message);
        console.log(`✓ ${t("commitSuccess")}`);
        await showUpdateHint();
        return;
      }

      if (action === "edit") {
        const edited = await input({
          message: t("editMessage"),
          default: message,
        });
        if (edited.trim()) {
          commit(edited.trim());
          console.log(`✓ ${t("commitSuccess")}`);
        }
        await showUpdateHint();
        return;
      }

      if (action === "regenerate") {
        try {
          console.log(t("regenerating"));
          const start = Date.now();
          result = await generateFn();
          const elapsed = ((Date.now() - start) / 1000).toFixed(1);
          message = result.message;
          printResult(result, elapsed);
        } catch (err: any) {
          console.error(`${t("errGenerate")}: ${err.message}`);
        }
        continue;
      }

      // cancel
      console.log(t("cancelled"));
      await showUpdateHint();
      return;
    }
  });

program.parse();
