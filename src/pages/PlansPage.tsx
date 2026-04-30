import { useContent } from "@/hooks/useContent";
import { PageHeader } from "./AboutPage";
import { TrendingUp } from "lucide-react";

export function PlansPage() {
  const { content } = useContent();
  return (
    <div className="animate-fade-in">
      <PageHeader title="خطط الاستثمار" subtitle="اختر الخطة التي تناسب طموحك" />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-10">
          {content.plans.map((group, gi) => (
            <div key={gi}>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-3xl">{group.flag}</span>
                <h2 className="font-display text-2xl font-extrabold text-primary">{group.currency}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-gold hover:shadow-gold">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">مبلغ الاستثمار</div>
                        <div className="mt-1 font-display text-2xl font-extrabold text-primary">
                          {item.amount} <span className="text-base text-muted-foreground">{group.symbol}</span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-gradient-gold p-2 text-gold-foreground shadow-gold">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-primary/5 p-3">
                      <div className="text-xs font-bold text-muted-foreground">العائد اليومي</div>
                      <div className="mt-1 font-display text-xl font-extrabold text-gradient-gold">
                        {item.daily_return} {group.symbol}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
