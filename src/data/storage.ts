// طبقة تخزين موحّدة: localStorage + GitHub عبر Vercel Proxy

import { DEFAULT_SITE_CONTENT } from "./defaultContent";
import type { SiteContent, UserRecord, WalletRecord, SiteConfig } from "./types";

// =======================
// Keys
// =======================
const KEYS = {
  USERS: "namaa.users",
  WALLETS: "namaa.wallets",
  CONTENT: "namaa.content",
  CONFIG: "namaa.config",
} as const;

type EntityName = "users" | "wallets" | "content" | "config";

function lsKey(entity: EntityName): string {
  switch (entity) {
    case "users": return KEYS.USERS;
    case "wallets": return KEYS.WALLETS;
    case "content": return KEYS.CONTENT;
    case "config": return KEYS.CONFIG;
  }
}

// =======================
// Proxy (احترافي)
// =======================
function getProxyUrl(): string | null {
  const DEFAULT_PROXY = "https://namaa-invest-hub-ufr2.vercel.app";

  try {
    const cfg = JSON.parse(localStorage.getItem(KEYS.CONFIG) || "{}") as SiteConfig;

    if (cfg.proxy_url && cfg.proxy_url.trim()) {
      return cfg.proxy_url.trim();
    }

    return DEFAULT_PROXY;

  } catch {
    return DEFAULT_PROXY;
  }
}

// =======================
// Remote Read
// =======================
async function readRemote<T>(entity: EntityName): Promise<T | null> {
  const proxy = getProxyUrl();
  if (!proxy) return null;

  try {
    const res = await fetch(`${proxy}/api/data?entity=${entity}`);

    if (!res.ok) return null;

    const json = await res.json();
    return json.data as T;

  } catch {
    return null;
  }
}

// =======================
// Remote Write (مع Retry)
// =======================
export interface RemoteWriteResult {
  ok: boolean;
  status: number;
  message: string;
}

async function writeRemote<T>(entity: EntityName, data: T): Promise<RemoteWriteResult> {
  const proxy = getProxyUrl();

  if (!proxy) {
    return { ok: false, status: 0, message: "Proxy not configured" };
  }

  const url = `${proxy}/api/data?entity=${entity}`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const payload = await res.json();
          message = payload?.error || payload?.message || message;
        } catch {}
        return { ok: false, status: res.status, message };
      }

      return { ok: true, status: res.status, message: "OK" };

    } catch (error) {
      if (attempt === 2) {
        return {
          ok: false,
          status: 0,
          message: error instanceof Error ? error.message : "Network error",
        };
      }
    }
  }

  return { ok: false, status: 0, message: "Unknown error" };
}

// =======================
// Local Storage
// =======================
function readLocal<T>(entity: EntityName, fallback: T): T {
  try {
    const raw = localStorage.getItem(lsKey(entity));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(entity: EntityName, data: T): void {
  localStorage.setItem(lsKey(entity), JSON.stringify(data));
}

// =======================
// API
// =======================
export const storage = {
  // ================= USERS =================
  async getUsers(): Promise<UserRecord[]> {
    const remote = await readRemote<UserRecord[]>("users");

    if (remote) {
      writeLocal("users", remote);
      return remote;
    }

    return readLocal<UserRecord[]>("users", []);
  },

  async saveUsers(users: UserRecord[]): Promise<void> {
    const result = await writeRemote("users", users);

    if (!result.ok) {
      console.warn("⚠️ Proxy failed, fallback to local", result);
      writeLocal("users", users); // fallback
      return;
    }

    writeLocal("users", users);
  },

  // ================= WALLETS =================
  async getWallets(): Promise<WalletRecord[]> {
    const remote = await readRemote<WalletRecord[]>("wallets");

    if (remote) {
      writeLocal("wallets", remote);
      return remote;
    }

    return readLocal<WalletRecord[]>("wallets", []);
  },

  async saveWallets(wallets: WalletRecord[]): Promise<void> {
    const result = await writeRemote("wallets", wallets);

    if (!result.ok) {
      console.warn("⚠️ Proxy failed, fallback to local", result);
      writeLocal("wallets", wallets);
      return;
    }

    writeLocal("wallets", wallets);
  },

  // ================= CONTENT =================
  async getContent(): Promise<SiteContent> {
    const remote = await readRemote<SiteContent>("content");

    if (remote) {
      writeLocal("content", remote);
      return remote;
    }

    return readLocal<SiteContent>("content", DEFAULT_SITE_CONTENT);
  },

  async saveContent(content: SiteContent): Promise<void> {
    const result = await writeRemote("content", content);

    if (!result.ok) {
      console.warn("⚠️ Proxy failed, fallback to local", result);
      writeLocal("content", content);
      return;
    }

    writeLocal("content", content);
  },

  // ================= CONFIG =================
  getConfig(): SiteConfig {
    return readLocal<SiteConfig>("config", {});
  },

  saveConfig(config: SiteConfig): void {
    writeLocal("config", config);
  },

  isUsingProxy(): boolean {
    return !!getProxyUrl();
  },
};

// =======================
// Password Hash
// =======================
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);

  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
