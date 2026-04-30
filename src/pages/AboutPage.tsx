import { useContent } from "@/hooks/useContent";
import sign from "@/assets/namaa-sign.jpg";

export function AboutPage() {
  const { content } = useContent();
  return (
    <div className="animate-fade-in">
      <PageHeader title="من نحن" subtitle="تعرّف على نماء الرقمية للاستثمار" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="overflow-hidden rounded-2xl shadow-elegant">
          <img src={sign} alt="نماء الرقمية للاستثمار" className="h-auto w-full" loading="lazy" />
        </div>
        <div className="prose-styles mt-8 space-y-5 text-base leading-loose text-foreground">
          {content.about.split("\n\n").map((p, i) => (
            <p key={i} className="rounded-xl border-r-4 border-gold bg-card px-5 py-4 shadow-card">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-gradient-hero py-12 text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-base opacity-80">{subtitle}</p>}
      </div>
    </div>
  );
}
