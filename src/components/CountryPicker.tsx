import { useState, useMemo } from "react";
import { Search, Check, ChevronDown } from "lucide-react";
import { COUNTRIES, type Country } from "@/data/countries";
import { cn } from "@/lib/utils";

interface Props {
  value?: string; // country code
  onChange: (c: Country) => void;
  mode?: "country" | "dial";
  placeholder?: string;
}

export function CountryPicker({ value, onChange, mode = "country", placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = useMemo(() => COUNTRIES.find((c) => c.code === value), [value]);

  const filtered = useMemo(() => {
    if (!q.trim()) return COUNTRIES;
    const t = q.trim().toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.nameAr.toLowerCase().includes(t) ||
        c.nameEn.toLowerCase().includes(t) ||
        c.dial.includes(t) ||
        c.code.toLowerCase().includes(t)
    );
  }, [q]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm hover:border-gold focus:border-gold focus:outline-none"
      >
        <div className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <span className="text-lg">{selected.flag}</span>
              <span className="truncate font-medium">
                {mode === "dial" ? selected.dial : selected.nameAr}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder ?? (mode === "dial" ? "رمز" : "اختر الدولة")}</span>
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 max-h-72 w-full min-w-[240px] overflow-hidden rounded-xl border border-border bg-popover shadow-elegant animate-scale-in">
            <div className="flex items-center gap-2 border-b border-border p-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => { onChange(c); setOpen(false); setQ(""); }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent/20",
                      selected?.code === c.code && "bg-accent/15"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{c.flag}</span>
                      <span className="font-medium">{c.nameAr}</span>
                      <span className="text-xs text-muted-foreground">{c.dial}</span>
                    </span>
                    {selected?.code === c.code && <Check className="h-4 w-4 text-gold" />}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">لا توجد نتائج</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
