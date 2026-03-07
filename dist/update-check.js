"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForUpdate = checkForUpdate;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const CACHE_DIR = path_1.default.join(process.env.HOME || "~", ".ai-commit");
const CACHE_FILE = path_1.default.join(CACHE_DIR, ".update-check");
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24h
const REMOTE_URL = "https://raw.githubusercontent.com/lifedever/ai-commit/main/package.json";
function readCache() {
    try {
        return JSON.parse((0, fs_1.readFileSync)(CACHE_FILE, "utf-8"));
    }
    catch {
        return null;
    }
}
function writeCache(data) {
    try {
        (0, fs_1.mkdirSync)(CACHE_DIR, { recursive: true });
        (0, fs_1.writeFileSync)(CACHE_FILE, JSON.stringify(data));
    }
    catch {
        // ignore
    }
}
function compareVersions(local, remote) {
    const l = local.split(".").map(Number);
    const r = remote.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
        if ((r[i] ?? 0) > (l[i] ?? 0))
            return true;
        if ((r[i] ?? 0) < (l[i] ?? 0))
            return false;
    }
    return false;
}
function checkForUpdate(localVersion) {
    const cache = readCache();
    if (cache && Date.now() - cache.lastCheck < CHECK_INTERVAL) {
        return Promise.resolve(compareVersions(localVersion, cache.latestVersion) ? cache.latestVersion : null);
    }
    return fetch(REMOTE_URL, { signal: AbortSignal.timeout(3000) })
        .then((res) => res.json())
        .then((data) => {
        const latestVersion = data.version;
        writeCache({ lastCheck: Date.now(), latestVersion });
        return compareVersions(localVersion, latestVersion) ? latestVersion : null;
    })
        .catch(() => null);
}
