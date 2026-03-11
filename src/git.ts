import { execSync, execFileSync } from "child_process";

export function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function getStagedDiff(): string {
  const diff = execSync("git diff --cached", { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
  return diff.trim();
}

export function getStagedStat(): string {
  return execSync("git diff --cached --stat", { encoding: "utf-8" }).trim();
}

export function commit(message: string): void {
  execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
}

export const MAX_DIFF_LENGTH = 15000;

export function prepareDiffContent(diff: string): string {
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
