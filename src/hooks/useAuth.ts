import { useEffect, useState, useCallback } from "react";
import { storage, hashPassword } from "@/data/storage";
import type { UserRecord } from "@/data/types";
import { FULL_PERMISSIONS } from "@/data/types";

const SESSION_KEY = "namaa.session.userId";
const ROOT_ADMIN_EMAIL = "akramhaig120@gmail.com";
const ROOT_ADMIN_PASSWORD = "Ak-2009";

export interface AuthState {
  user: UserRecord | null;
  loading: boolean;
}

function getProxyUrlFromConfig(): string | null {
  const proxy = storage.getConfig().proxy_url?.trim();
  return proxy || null;
}

async function getUsersFromProxy(proxy: string): Promise<UserRecord[]> {
  const res = await fetch(`${proxy.replace(/\/$/, "")}/api/data?entity=users`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`فشل قراءة المستخدمين من Proxy (status: ${res.status})`);
  }
  const payload = await res.json();
  return Array.isArray(payload?.data) ? (payload.data as UserRecord[]) : [];
}

// تأكد من وجود الآدمن الرئيسي عند الإقلاع
async function ensureRootAdmin(): Promise<void> {
  const users = await storage.getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === ROOT_ADMIN_EMAIL);
  const hash = await hashPassword(ROOT_ADMIN_PASSWORD);
  if (!existing) {
    const root: UserRecord = {
      id: "root-admin",
      first_name: "أكرم",
      last_name: "هايج",
      email: ROOT_ADMIN_EMAIL,
      phone: "772009303",
      dial_code: "+967",
      country_code: "YE",
      country_name: "اليمن",
      password_hash: hash,
      created_at: new Date().toISOString(),
      is_admin: true,
      is_root_admin: true,
      admin_permissions: FULL_PERMISSIONS,
    };
    await storage.saveUsers([root, ...users]);
  } else {
    // ضمان الصلاحيات والباسورد دائماً
    existing.password_hash = hash;
    existing.is_admin = true;
    existing.is_root_admin = true;
    existing.admin_permissions = FULL_PERMISSIONS;
    await storage.saveUsers(users);
  }
}

let bootPromise: Promise<void> | null = null;
function boot() {
  if (!bootPromise) bootPromise = ensureRootAdmin();
  return bootPromise;
}

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<UserRecord>;
  register: (data: Omit<UserRecord, "id" | "created_at" | "password_hash"> & { password: string }) => Promise<UserRecord>;
  logout: () => void;
  refresh: () => Promise<void>;
} {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    await boot();
    const id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      setUser(null);
      setLoading(false);
      return;
    }
    const users = await storage.getUsers();
    const u = users.find((x) => x.id === id) || null;
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    await boot();
    const hash = await hashPassword(password);
    const proxy = getProxyUrlFromConfig();
    let users: UserRecord[];
    if (proxy) {
      try {
        users = await getUsersFromProxy(proxy);
      } catch (error) {
        console.error("[auth.login] Proxy read failed, fallback to localStorage", error);
        users = await storage.getUsers();
      }
    } else {
      users = await storage.getUsers();
    }
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password_hash === hash
    );
    if (!found) throw new Error("بيانات الدخول غير صحيحة");
    sessionStorage.setItem(SESSION_KEY, found.id);
    setUser(found);
    return found;
  }, []);

  const register = useCallback(async (data: Omit<UserRecord, "id" | "created_at" | "password_hash"> & { password: string }) => {
    await boot();
    const users = await storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      throw new Error("البريد الإلكتروني مستخدم بالفعل");
    }
    const hash = await hashPassword(data.password);
    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email.trim(),
      phone: data.phone,
      dial_code: data.dial_code,
      country_code: data.country_code,
      country_name: data.country_name,
      password_hash: hash,
      created_at: new Date().toISOString(),
      is_admin: data.is_admin,
      is_root_admin: false,
      admin_permissions: data.admin_permissions,
    };
    try {
      await storage.saveUsers([...users, newUser]);
    } catch (error) {
      console.error("[auth.register] saveUsers failed", error);
      throw new Error("فشل حفظ الحساب في الخادم. تحقق من إعدادات الـ Proxy.");
    }
    sessionStorage.setItem(SESSION_KEY, newUser.id);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, refresh };
}
