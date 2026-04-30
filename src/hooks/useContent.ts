import { useEffect, useState, useCallback } from "react";
import { storage } from "@/data/storage";
import { DEFAULT_SITE_CONTENT } from "@/data/defaultContent";
import type { SiteContent } from "@/data/types";

export function useContent() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const c = await storage.getContent();
    setContent(c);
    setLoading(false);
    // تطبيق الألوان فوراً
    applyTheme(c);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (next: SiteContent) => {
    await storage.saveContent(next);
    setContent(next);
    applyTheme(next);
  }, []);

  return { content, loading, save, refresh };
}

export function applyTheme(c: SiteContent) {
  const root = document.documentElement;
  if (c.theme?.primary_hsl) root.style.setProperty("--primary", c.theme.primary_hsl);
  if (c.theme?.gold_hsl) {
    root.style.setProperty("--gold", c.theme.gold_hsl);
    root.style.setProperty("--accent", c.theme.gold_hsl);
    root.style.setProperty("--ring", c.theme.gold_hsl);
  }
  if (c.theme?.background_hsl) root.style.setProperty("--background", c.theme.background_hsl);
}
