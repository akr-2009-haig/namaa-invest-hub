import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { storage } from "@/data/storage";
import type { WalletRecord } from "@/data/types";
import { PageHeader } from "./AboutPage";
import { Wallet, Search, Loader2, User, Mail, DollarSign, TrendingUp, Receipt, Hash, Smartphone, Building2, Briefcase, LogIn, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

const FIELD_META: Record<string, { label: string; icon: LucideIcon }> = {
  name: { label: "الاسم", icon: User },
  email: { label: "البريد الإلكتروني", icon: Mail },
  investment_amount: { label: "مبلغ الاستثمار", icon: DollarSign },
  profits: { label: "الأرباح", icon: TrendingUp },
  fees: { label: "الرسوم", icon: Receipt },
  iban: { label: "الآيبان", icon: Hash },
  digital_wallet: { label: "المحفظة الرقمية", icon: Smartphone },
  system_account: { label: "حساب النظام", icon: Building2 },
  system_wallet: { label: "محفظة النظام", icon: Briefcase },
};

export function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<WalletRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const all = await storage.getWallets();
      const found = all.find((w) => w.user_id === user.id) || null;
      setWallet(found);
      setLoading(false);
    })();
  }, [user]);

  if (authLoading) return <FullLoader />;

  if (!user) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="المحفظة الاستثمارية" />
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <Wallet className="mx-auto h-16 w-16 text-gold/50" />
          <h2 className="mt-4 font-display text-2xl font-extrabold text-primary">سجل دخولك</h2>
          <p className="mt-2 text-sm text-muted-foreground">للوصول إلى محفظتك يجب تسجيل الدخول أو إنشاء حساب جديد.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-bold text-gold-foreground shadow-gold">
              <LogIn className="h-4 w-4" /> تسجيل الدخول
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-primary">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="محفظتي الاستثمارية" subtitle={`أهلاً ${user.first_name}، إليك ملخص حسابك`} />
      <div className="mx-auto max-w-3xl px-6 py-10">
        {loading ? (
          <FullLoader />
        ) : wallet && Object.values(wallet.visible).some(Boolean) ? (
          <WalletCard wallet={wallet} userName={`${user.first_name} ${user.last_name}`} userEmail={user.email} />
        ) : (
          <NewSubscriberCard name={`${user.first_name} ${user.last_name}`} email={user.email} />
        )}

        {/* استعلام عن الأرباح */}
        <div className="mt-10">
          <ProfitsLookup />
        </div>
      </div>
    </div>
  );
}

function FullLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </div>
  );
}

function NewSubscriberCard({ name, email }: { name: string; email: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-elegant">
      <div className="bg-gradient-hero p-6 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold">
            <Wallet className="h-7 w-7 text-gold-foreground" />
          </div>
          <div>
            <div className="text-xs opacity-80">مرحباً بك</div>
            <div className="font-display text-xl font-extrabold">{name}</div>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <Row icon={User} label="الاسم" value={name} />
        <Row icon={Mail} label="البريد الإلكتروني" value={email} dir="ltr" />
        <Row icon={DollarSign} label="مبلغ الاستثمار" value="لم تشترك بعد" muted />
        <Row icon={TrendingUp} label="الأرباح" value="—" muted />
        <div className="rounded-xl bg-gold/10 p-4 text-center text-sm text-foreground">
          ابدأ رحلتك الاستثمارية بالاطلاع على{" "}
          <Link to="/plans" className="font-bold text-gold underline">خطط الاستثمار</Link>
        </div>
      </div>
    </div>
  );
}

function WalletCard({ wallet, userName, userEmail }: { wallet: WalletRecord; userName: string; userEmail: string }) {
  const visibleKeys = (Object.keys(wallet.visible) as Array<keyof typeof wallet.visible>).filter((k) => wallet.visible[k]);
  return (
    <div className="overflow-hidden rounded-3xl border border-gold/30 bg-gradient-card shadow-elegant">
      <div className="bg-gradient-hero p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold shadow-gold">
              <Wallet className="h-7 w-7 text-gold-foreground" />
            </div>
            <div>
              <div className="text-xs opacity-80">محفظة استثمارية</div>
              <div className="font-display text-xl font-extrabold">{userName}</div>
            </div>
          </div>
          <div className="rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success">نشطة</div>
        </div>
      </div>
      <div className="grid gap-3 p-6 sm:grid-cols-2">
        {visibleKeys.map((k) => {
          const meta = FIELD_META[k];
          const val = wallet.fields[k] || (k === "name" ? userName : k === "email" ? userEmail : "—");
          return <Row key={k} icon={meta.icon} label={meta.label} value={val} dir={k === "email" || k === "iban" ? "ltr" : undefined} />;
        })}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value, muted, dir }: { icon: LucideIcon; label: string; value: string; muted?: boolean; dir?: "ltr" | "rtl" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-muted-foreground">{label}</div>
        <div dir={dir} className={`truncate font-bold ${muted ? "text-muted-foreground" : "text-primary"}`}>{value}</div>
      </div>
    </div>
  );
}

function ProfitsLookup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ wallet: WalletRecord; user: { first_name: string; last_name: string; email: string } } | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSearch = async () => {
    if (!query.trim()) return toast.error("أدخل بياناتك");
    setLoading(true);
    setResult(null);
    setProgress(0);

    // شريط معالجة
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 120);

    const [users, wallets] = await Promise.all([storage.getUsers(), storage.getWallets()]);
    const q = query.trim().toLowerCase();
    const user = users.find((u) =>
      u.email.toLowerCase() === q ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.first_name.toLowerCase() === q
    );
    const wallet = user ? wallets.find((w) => w.user_id === user.id) : null;

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setLoading(false);
      if (user && wallet && Object.values(wallet.visible).some(Boolean)) {
        setResult({ wallet, user });
      } else if (user) {
        toast.info("لا توجد بيانات استثمار مفعّلة لهذا الحساب بعد");
      } else {
        toast.error("لم يتم العثور على نتائج");
      }
    }, 1400);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground shadow-gold">
            <Search className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="font-display text-lg font-extrabold text-primary">الاستعلام عن الأرباح</div>
            <div className="text-xs text-muted-foreground">أدخل اسمك أو بريدك الإلكتروني</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="mt-5 space-y-3 animate-fade-in">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="الاسم أو البريد الإلكتروني أو عنوان المحفظة"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
          <button onClick={handleSearch} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            استعلام
          </button>

          {loading && (
            <div className="space-y-2 pt-2">
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-center text-xs text-muted-foreground">جاري معالجة بياناتك...</div>
            </div>
          )}

          {result && (
            <div className="pt-4 animate-scale-in">
              <WalletCard
                wallet={result.wallet}
                userName={`${result.user.first_name} ${result.user.last_name}`}
                userEmail={result.user.email}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
