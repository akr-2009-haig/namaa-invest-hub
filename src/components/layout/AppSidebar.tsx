import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Home, Info, Sparkles, TrendingUp, Wallet, Rocket, HelpCircle, Phone, LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";
import favicon from "/favicon.png";

const navItems = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/about", label: "من نحن", icon: Info },
  { to: "/features", label: "المميزات", icon: Sparkles },
  { to: "/plans", label: "خطط الاستثمار", icon: TrendingUp },
  { to: "/wallet", label: "المحفظة", icon: Wallet },
  { to: "/how-to-start", label: "كيفية البدء", icon: Rocket },
  { to: "/faq", label: "الأسئلة الشائعة", icon: HelpCircle },
  { to: "/contact", label: "تواصل معنا", icon: Phone },
];

export function AppSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, logout } = useAuth();
  const { content } = useContent();
  const location = useLocation();

  const close = () => onOpenChange(false);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground shadow-elegant transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex items-center justify-between gap-3 border-b border-sidebar-border p-5">
            <NavLink to="/" onClick={close} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
                <img src={favicon} alt="" className="h-8 w-8" width={32} height={32} />
              </div>
              <div>
                <div className="font-display text-base font-extrabold leading-tight text-sidebar-foreground">
                  {content.site_name}
                </div>
                <div className="text-[10px] font-medium tracking-wide text-sidebar-foreground/60">
                  Namaa Digital Investment
                </div>
              </div>
            </NavLink>
            <button onClick={close} className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={close}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-gradient-gold text-gold-foreground shadow-md"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}

              {user?.is_admin && (
                <li className="pt-2">
                  <NavLink
                    to="/admin"
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors",
                        isActive
                          ? "bg-gradient-gold text-gold-foreground shadow-md"
                          : "bg-sidebar-accent text-gold hover:bg-sidebar-accent/80"
                      )
                    }
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Auth area */}
          <div className="border-t border-sidebar-border p-3">
            {user ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-sidebar-accent p-3">
                  <div className="text-xs text-sidebar-foreground/60">مرحبًا</div>
                  <div className="truncate font-bold text-sidebar-foreground">
                    {user.first_name} {user.last_name}
                  </div>
                </div>
                <button
                  onClick={() => { logout(); close(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <NavLink
                  to="/login"
                  onClick={close}
                  state={{ from: location.pathname }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <LogIn className="h-4 w-4" /> تسجيل الدخول
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={close}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-gold px-3 py-2 text-sm font-bold text-gold-foreground shadow-gold"
                >
                  <UserPlus className="h-4 w-4" /> إنشاء حساب
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 text-foreground shadow-card lg:hidden"
      aria-label="فتح القائمة"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function useSidebarState() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
