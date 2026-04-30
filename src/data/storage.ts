// طبقة تخزين موحّدة: localStorage محلياً، أو GitHub via Vercel Proxy عندما يُضبط الرابط.
// كل "ملف" هو كيان JSON مستقل (users.json, wallets.json, content.json, config.json).

import { DEFAULT_SITE_CONTENT } from "./defaultContent";
import type { SiteContent, UserRecord, WalletRecord, SiteConfig } from "./types";

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

function getProxyUrl(): string | null {
  try {
    const cfg = JSON.parse(localStorage.getItem(KEYS.CONFIG) || "{}") as SiteConfig;
    return cfg.proxy_url?.trim() || null;
  } catch {
    return null;
  }
}

async function readRemote<T>(entity: EntityName): Promise<T | null> {
  const proxy = getProxyUrl();
  if (!proxy) return null;
  try {
    const res = await fetch(`${proxy.replace(/\/$/, "")}/api/data?entity=${entity}`, {
      method: "GET",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

export interface RemoteWriteResult {
  ok: boolean;
  status: number;
  message: string;
}

async function writeRemote<T>(entity: EntityName, data: T): Promise<RemoteWriteResult> {
  const proxy = getProxyUrl();
  if (!proxy) {
    return { ok: false, status: 0, message: "Proxy URL is not configured" };
  }
  try {
    const res = await fetch(`${proxy.replace(/\/$/, "")}/api/data?entity=${entity}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const payload = await res.json();
        message = payload?.error || payload?.message || message;
      } catch {
        // ignore parse errors and keep HTTP status fallback
      }
      return { ok: false, status: res.status, message };
    }
    return { ok: true, status: res.status, message: "OK" };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}

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

// واجهة عامة
export const storage = {
  // المستخدمون
  async getUsers(): Promise<UserRecord[]> {
    const remote = await readRemote<UserRecord[]>("users");
    if (remote) {
      writeLocal("users", remote);
      return remote;
    }
    return readLocal<UserRecord[]>("users", []);
  },
  async saveUsers(users: UserRecord[]): Promise<void> {
    if (getProxyUrl()) {
      const result = await writeRemote("users", users);
      if (!result.ok) {
        console.error("[storage.saveUsers] Proxy write failed", result);
        throw new Error(`فشل حفظ users عبر Proxy: ${result.message} (status: ${result.status})`);
      }
      writeLocal("users", users);
      return;
    }
    writeLocal("users", users);
  },

  // المحافظ
  async getWallets(): Promise<WalletRecord[]> {
    const remote = await readRemote<WalletRecord[]>("wallets");
    if (remote) {
      writeLocal("wallets", remote);
      return remote;
    }
    return readLocal<WalletRecord[]>("wallets", []);
  },
  async saveWallets(wallets: WalletRecord[]): Promise<void> {
    if (getProxyUrl()) {
      const result = await writeRemote("wallets", wallets);
      if (!result.ok) {
        console.error("[storage.saveWallets] Proxy write failed", result);
        throw new Error(`فشل حفظ wallets عبر Proxy: ${result.message} (status: ${result.status})`);
      }
      writeLocal("wallets", wallets);
      return;
    }
    writeLocal("wallets", wallets);
  },

  // المحتوى
  async getContent(): Promise<SiteContent> {
    const remote = await readRemote<SiteContent>("content");
    if (remote) {
      writeLocal("content", remote);
      return remote;
    }
    return readLocal<SiteContent>("content", DEFAULT_SITE_CONTENT);
  },
  async saveContent(content: SiteContent): Promise<void> {
    if (getProxyUrl()) {
      const result = await writeRemote("content", content);
      if (!result.ok) {
        console.error("[storage.saveContent] Proxy write failed", result);
        throw new Error(`فشل حفظ content عبر Proxy: ${result.message} (status: ${result.status})`);
      }
      writeLocal("content", content);
      return;
    }
    writeLocal("content", content);
  },

  // الإعدادات (محلية فقط لأنها تحوي رابط الـ proxy)
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

// تشفير كلمة المرور (SHA-256). تنبيه: ليس بديلاً عن bcrypt في الإنتاج.
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
