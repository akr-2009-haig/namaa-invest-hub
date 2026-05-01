import { useContent } from "@/hooks/useContent";
import { PageHeader } from "./AboutPage";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function ContactPage() {
  const { content } = useContent();
  return (
    <div className="animate-fade-in">
      <PageHeader title="تواصل معنا" subtitle={content.contact.description} />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <ContactCard icon={Mail} label="البريد الإلكتروني" value={content.contact.email} href={`mailto:${content.contact.email}`} />
          <ContactCard icon={Phone} label="الهاتف" value={content.contact.phone} href={`tel:${content.contact.phone}`} />
          <ContactCard icon={MapPin} label="العنوان" value={content.contact.address} />
        </div>

        {(content.social_links.telegram || content.social_links.whatsapp) && (
          <div className="mt-10 rounded-2xl bg-gradient-hero p-8 text-center text-primary-foreground shadow-elegant">
            <h3 className="font-display text-2xl font-extrabold">تواصل سريع</h3>
            <p className="mt-2 text-sm opacity-80">فريقنا جاهز لخدمتك على مدار الساعة</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {content.social_links.telegram && (
                <a href={content.social_links.telegram} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-gold-foreground shadow-gold">
                  <Send className="h-4 w-4" /> تيليجرام
                </a>
              )}
              {content.social_links.whatsapp && (
                <a href={content.social_links.whatsapp} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-success px-6 py-3 text-sm font-bold text-success-foreground">
                  واتساب
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: string; href?: string }) {
  const Body = (
    <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-elegant">
      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground shadow-gold">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-bold text-primary" dir="ltr">{value}</div>
    </div>
  );
  return href ? <a href={href}>{Body}</a> : Body;
}
