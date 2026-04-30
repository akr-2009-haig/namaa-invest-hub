import { useState } from "react";
import { useContent } from "@/hooks/useContent";
import { PageHeader } from "./AboutPage";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqPage() {
  const { content } = useContent();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="animate-fade-in">
      <PageHeader title="الأسئلة الشائعة" subtitle="إجابات لأكثر الأسئلة تكراراً" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="space-y-3">
          {content.faqs.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-right"
              >
                <span className="font-display text-base font-extrabold text-primary">{f.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-gold transition-transform", openIdx === i && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300", openIdx === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
