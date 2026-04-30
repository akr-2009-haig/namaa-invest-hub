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

async function writeRemote<T>(entity: EntityName, data: T): Promise<boolean> {
  const proxy = getProxyUrl();
  if (!proxy) return false;
  try {
    const res = await fetch(`${proxy.replace(/\/$/, "")}/api/data?entity=${entity}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch {
    return false;
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
    writeLocal("users", users);
    await writeRemote("users", users);
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
    writeLocal("wallets", wallets);
    await writeRemote("wallets", wallets);
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
    writeLocal("content", content);
    await writeRemote("content", content);
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
