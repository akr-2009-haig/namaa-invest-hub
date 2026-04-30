import { useContent } from "@/hooks/useContent";
import { PageHeader } from "./AboutPage";
import { Send } from "lucide-react";

export function HowToStartPage() {
  const { content } = useContent();
  return (
    <div className="animate-fade-in">
      <PageHeader title="كيفية البدء" subtitle="6 خطوات تفصلك عن رحلتك الاستثمارية" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="relative space-y-6">
          {content.steps.map((s, i) => (
            <div key={i} className="relative flex gap-5">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-display text-lg font-extrabold text-gold-foreground shadow-gold">
                  {i + 1}
                </div>
                {i < content.steps.length - 1 && <div className="mt-2 h-full w-0.5 flex-1 bg-gold/30" />}
              </div>
              <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-lg font-extrabold text-primary">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                {i === 3 && content.payment_link && (
                  <a href={content.payment_link} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-gold-foreground shadow-gold">
                    <Send className="h-4 w-4" />
                    تواصل مع الدعم للإيداع
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
