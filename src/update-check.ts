import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const CACHE_DIR = path.join(process.env.HOME || "~", ".ai-commit");
const CACHE_FILE = path.join(CACHE_DIR, ".update-check");
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24h
const REMOTE_URL = "https://raw.githubusercontent.com/lifedever/ai-commit/main/package.json";

interface CacheData {
  lastCheck: number;
  latestVersion: string;
}

function readCache(): CacheData | null {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function writeCache(data: CacheData) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function compareVersions(local: string, remote: string): boolean {
  const l = local.split(".").map(Number);
  const r = remote.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((r[i] ?? 0) > (l[i] ?? 0)) return true;
    if ((r[i] ?? 0) < (l[i] ?? 0)) return false;
  }
  return false;
}

export function checkForUpdate(localVersion: string): Promise<string | null> {
  const cache = readCache();
  if (cache && Date.now() - cache.lastCheck < CHECK_INTERVAL) {
    return Promise.resolve(
      compareVersions(localVersion, cache.latestVersion) ? cache.latestVersion : null
    );
  }

  return fetch(REMOTE_URL, { signal: AbortSignal.timeout(3000) })
    .then((res) => res.json())
    .then((data: any) => {
      const latestVersion = data.version as string;
      writeCache({ lastCheck: Date.now(), latestVersion });
      return compareVersions(localVersion, latestVersion) ? latestVersion : null;
    })
    .catch(() => null);
}
