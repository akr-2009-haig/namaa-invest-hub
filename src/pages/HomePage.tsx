import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import tower from "@/assets/namaa-tower.jpg";

export function HomePage() {
  const { content } = useContent();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-30">
          <img src={tower} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold backdrop-blur-sm animate-fade-up">
            <ShieldCheck className="h-3.5 w-3.5" />
            مرخصة من هيئة السوق المالية السعودية
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight md:text-6xl animate-fade-up">
            {content.hero_title}{" "}
            <span className="text-gradient-gold">بثقة وأمان</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed opacity-90 md:text-lg animate-fade-up">
            {content.hero_subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up">
            <Link to="/register" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-gold-foreground shadow-gold transition-transform hover:scale-105">
              ابدأ الآن
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-white/5 px-6 py-3 text-sm font-bold text-primary-foreground backdrop-blur-sm hover:bg-white/10">
              فتح حساب
            </Link>
          </div>

          {/* Building image card */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-gold/20 shadow-elegant animate-scale-in">
            <img src={tower} alt="مبنى نماء الرقمية للاستثمار" className="h-auto w-full object-cover" loading="eager" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { v: "+50K", l: "مستثمر نشط" },
            { v: "8", l: "عملات مدعومة" },
            { v: "24/7", l: "دعم فني" },
            { v: "100%", l: "شفافية" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-gradient-card p-5 text-center shadow-card">
              <div className="font-display text-2xl font-extrabold text-gradient-gold md:text-3xl">{s.v}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <QuickCard to="/plans" icon={TrendingUp} title="خطط الاستثمار" desc="استعرض خططنا المتنوعة بعملات متعددة" />
          <QuickCard to="/features" icon={Sparkles} title="مميزاتنا" desc="ما يجعلنا الخيار الأنسب لاستثمارك" />
          <QuickCard to="/how-to-start" icon={ShieldCheck} title="كيف تبدأ" desc="6 خطوات بسيطة لبدء رحلتك" />
        </div>
      </section>
    </div>
  );
}

function QuickCard({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground shadow-gold">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-extrabold text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-gold group-hover:gap-2 transition-all">
        اعرف المزيد <ArrowLeft className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
