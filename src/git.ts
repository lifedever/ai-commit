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
