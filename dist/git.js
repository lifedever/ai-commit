"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGitRepo = isGitRepo;
exports.getStagedDiff = getStagedDiff;
exports.getStagedStat = getStagedStat;
exports.commit = commit;
const child_process_1 = require("child_process");
function isGitRepo() {
    try {
        (0, child_process_1.execSync)("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
        return true;
    }
    catch {
        return false;
    }
}
function getStagedDiff() {
    const diff = (0, child_process_1.execSync)("git diff --cached", { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
    return diff.trim();
}
function getStagedStat() {
    return (0, child_process_1.execSync)("git diff --cached --stat", { encoding: "utf-8" }).trim();
}
function commit(message) {
    (0, child_process_1.execSync)(`git commit -m ${JSON.stringify(message)}`, { stdio: "inherit" });
}
