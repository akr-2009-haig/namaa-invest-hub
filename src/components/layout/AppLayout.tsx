import { ReactNode } from "react";
import { AppSidebar, SidebarTrigger, useSidebarState } from "./AppSidebar";
import { useContent } from "@/hooks/useContent";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import favicon from "/favicon.png";

export function AppLayout({ children }: { children: ReactNode }) {
  const { open, setOpen } = useSidebarState();
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar open={open} onOpenChange={setOpen} />

      <div className="lg:pr-72">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <img src={favicon} alt="" className="h-8 w-8" width={32} height={32} />
            <div className="font-display text-sm font-extrabold text-primary">{content.site_name}</div>
          </div>
          <SidebarTrigger onClick={() => setOpen(true)} />
        </header>

        <main>{children}</main>

        {/* Footer */}
        <footer className="mt-16 border-t border-border bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold">
                    <img src={favicon} alt="" className="h-9 w-9" width={36} height={36} />
                  </div>
                  <div>
                    <div className="font-display text-lg font-extrabold">{content.site_name}</div>
                    <div className="text-xs opacity-70">Namaa Digital Investment</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed opacity-80">
                  منصة استثمار رقمية ذكية وآمنة. مرخصة من هيئة السوق المالية السعودية.
                </p>
              </div>

              <div>
                <h3 className="mb-4 font-display text-lg font-bold text-gold">تواصل معنا</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> {content.contact.email}</li>
                  <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> {content.contact.phone}</li>
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {content.contact.address}</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-display text-lg font-bold text-gold">روابط سريعة</h3>
                <div className="flex flex-wrap gap-2">
                  {content.social_links.telegram && (
                    <a href={content.social_links.telegram} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 text-gold hover:bg-primary-foreground/20">
                      <Send className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs opacity-70">
              © {new Date().getFullYear()} {content.site_name}. جميع الحقوق محفوظة.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
