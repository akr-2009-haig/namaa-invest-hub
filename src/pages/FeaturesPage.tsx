import { useContent } from "@/hooks/useContent";
import { PageHeader } from "./AboutPage";
import * as Icons from "lucide-react";

export function FeaturesPage() {
  const { content } = useContent();
  return (
    <div className="animate-fade-in">
      <PageHeader title="المميزات" subtitle="ما يميز منصتنا" />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {content.features.map((f, i) => {
            const Icon = (Icons as any)[f.icon] || Icons.Sparkles;
            return (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-gradient-gold opacity-10 transition-opacity group-hover:opacity-30" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground shadow-gold">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-primary">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
