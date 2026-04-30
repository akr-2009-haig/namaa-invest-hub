import { useState, useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useContent } from "@/hooks/useContent";
import { storage, hashPassword } from "@/data/storage";
import { COUNTRIES, type Country } from "@/data/countries";
import type { UserRecord, WalletRecord, AdminPermissions, SiteContent, FeatureItem, FaqItem, PlanGroup } from "@/data/types";
import { FULL_PERMISSIONS, EMPTY_PERMISSIONS } from "@/data/types";
import { CountryPicker } from "@/components/CountryPicker";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Home as HomeIcon, Sparkles, TrendingUp, HelpCircle, Phone,
  Link as LinkIcon, Type, Palette, Eye, Wallet as WalletIcon, Plus, Trash2, Save, Loader2,
  Settings as SettingsIcon, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminSection =
  | "overview" | "admins" | "home" | "features" | "plans" | "faq"
  | "contact" | "social" | "site_name" | "colors" | "preview" | "wallets" | "settings";

interface NavItem { id: AdminSection; label: string; icon: any; perm: keyof AdminPermissions | "always"; }
const ADMIN_NAV: NavItem[] = [
  { id: "overview",  label: "نظرة عامة",            icon: LayoutDashboard, perm: "manage_dashboard" },
  { id: "admins",    label: "إدارة الآدمنين",        icon: Users,           perm: "manage_admins" },
  { id: "home",      label: "إدارة الرئيسية",        icon: HomeIcon,        perm: "manage_home" },
  { id: "features",  label: "إدارة المميزات",        icon: Sparkles,        perm: "manage_features" },
  { id: "plans",     label: "إدارة خطط الاستثمار",   icon: TrendingUp,      perm: "manage_plans" },
  { id: "faq",       label: "الأسئلة الشائعة",       icon: HelpCircle,      perm: "manage_faq" },
  { id: "contact",   label: "تواصل معنا",            icon: Phone,           perm: "manage_contact" },
  { id: "social",    label: "روابط التواصل",         icon: LinkIcon,        perm: "manage_social_links" },
  { id: "site_name", label: "اسم الموقع",            icon: Type,            perm: "manage_site_name" },
  { id: "colors",    label: "الألوان",               icon: Palette,         perm: "manage_colors" },
  { id: "preview",   label: "معاينة الموقع",         icon: Eye,             perm: "manage_preview" },
  { id: "wallets",   label: "المحافظ الاستثمارية",   icon: WalletIcon,      perm: "manage_wallets" },
  { id: "settings",  label: "الإعدادات (Proxy)",     icon: SettingsIcon,    perm: "always" },
];

export function AdminPage() {
  const { user, loading } = useAuth();
  const [section, setSection] = useState<AdminSection>("overview");

  if (loading) return <div className="p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" /></div>;
  if (!user || !user.is_admin) return <Navigate to="/" replace />;

  const perms = user.admin_permissions || EMPTY_PERMISSIONS;
  const allowed = ADMIN_NAV.filter((n) => n.perm === "always" || perms[n.perm]);
  const currentNav = allowed.find((n) => n.id === section) || allowed[0];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
              <Shield className="h-6 w-6 text-gold-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold">لوحة التحكم</h1>
              <p className="text-xs opacity-80">مرحباً {user.first_name} — أدمن رئيسي</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* Side nav */}
          <aside className="space-y-1 rounded-2xl border border-border bg-card p-2 shadow-card lg:sticky lg:top-4 lg:self-start">
            {allowed.map((n) => {
              const Icon = n.icon;
              return (
                <button key={n.id} onClick={() => setSection(n.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    currentNav?.id === n.id ? "bg-gradient-gold text-gold-foreground shadow-md" : "text-foreground hover:bg-secondary"
                  )}>
                  <Icon className="h-4 w-4" />
                  {n.label}
                </button>
              );
            })}
          </aside>

          {/* Main */}
          <main className="rounded-2xl border border-border bg-card p-5 shadow-card md:p-6">
            {currentNav?.id === "overview" && <OverviewSection />}
            {currentNav?.id === "admins" && <AdminsSection currentUser={user} />}
            {currentNav?.id === "home" && <HomeContentSection />}
            {currentNav?.id === "features" && <FeaturesSection />}
            {currentNav?.id === "plans" && <PlansSection />}
            {currentNav?.id === "faq" && <FaqSection />}
            {currentNav?.id === "contact" && <ContactSection />}
            {currentNav?.id === "social" && <SocialSection />}
            {currentNav?.id === "site_name" && <SiteNameSection />}
            {currentNav?.id === "colors" && <ColorsSection />}
            {currentNav?.id === "preview" && <PreviewSection />}
            {currentNav?.id === "wallets" && <WalletsSection />}
            {currentNav?.id === "settings" && <SettingsSection />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewSection() {
  const [stats, setStats] = useState({ users: 0, admins: 0, wallets: 0 });
  useEffect(() => {
    (async () => {
      const [users, wallets] = await Promise.all([storage.getUsers(), storage.getWallets()]);
      setStats({ users: users.length, admins: users.filter((u) => u.is_admin).length, wallets: wallets.length });
    })();
  }, []);
  return (
    <Section title="نظرة عامة" desc="ملخص سريع للنظام">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="إجمالي المستخدمين" value={stats.users} />
        <Stat label="الآدمنين" value={stats.admins} />
        <Stat label="المحافظ المُفعّلة" value={stats.wallets} />
      </div>
      <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-sm text-foreground">
        <strong>وضع التخزين:</strong>{" "}
        {storage.isUsingProxy() ? <span className="text-success font-bold">GitHub عبر Proxy ✓</span> : <span className="text-muted-foreground">localStorage فقط (محلي)</span>}
        <p className="mt-2 text-xs text-muted-foreground">
          لتفعيل الحفظ السحابي، اذهب إلى قسم "الإعدادات (Proxy)" وأدخل رابط Vercel Proxy الخاص بك.
        </p>
      </div>
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 text-center shadow-card">
      <div className="font-display text-3xl font-extrabold text-gradient-gold">{value}</div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

/* ---------- Admins ---------- */
function AdminsSection({ currentUser }: { currentUser: UserRecord }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  const refresh = async () => setUsers(await storage.getUsers());
  useEffect(() => { refresh(); }, []);

  const admins = users.filter((u) => u.is_admin);

  return (
    <Section title="إدارة الآدمنين" desc="إنشاء وإدارة آدمنين بصلاحيات مخصصة"
      action={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-gold-foreground shadow-gold"><Plus className="h-4 w-4" /> إضافة آدمن</button>}>
      <div className="space-y-2">
        {admins.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
            <div>
              <div className="font-bold text-primary">{a.first_name} {a.last_name} {a.is_root_admin && <span className="ms-2 rounded bg-gold/20 px-2 py-0.5 text-xs text-gold">رئيسي</span>}</div>
              <div className="text-xs text-muted-foreground" dir="ltr">{a.email} · {a.dial_code} {a.phone}</div>
            </div>
            {!a.is_root_admin && currentUser.is_root_admin && (
              <button
                onClick={async () => {
                  if (!confirm(`حذف الآدمن ${a.first_name}؟`)) return;
                  const next = users.filter((u) => u.id !== a.id);
                  await storage.saveUsers(next);
                  refresh();
                  toast.success("تم الحذف");
                }}
                className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {showForm && <AdminForm onClose={() => setShowForm(false)} onCreated={refresh} />}
    </Section>
  );
}

function AdminForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [country, setCountry] = useState<Country | undefined>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<AdminPermissions>({ ...FULL_PERMISSIONS });
  const [saving, setSaving] = useState(false);

  const togglePerm = (k: keyof AdminPermissions) => setPerms((p) => ({ ...p, [k]: !p[k] }));

  const submit = async () => {
    if (!country) return toast.error("اختر الدولة");
    if (!firstName || !lastName || !email || !password || !phone) return toast.error("املأ جميع الحقول");
    setSaving(true);
    try {
      const users = await storage.getUsers();
      if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) throw new Error("البريد مستخدم");
      const newAdmin: UserRecord = {
        id: crypto.randomUUID(),
        first_name: firstName.trim(), last_name: lastName.trim(),
        email: email.trim(), phone: phone.trim(),
        dial_code: country.dial, country_code: country.code, country_name: country.nameAr,
        password_hash: await hashPassword(password),
        created_at: new Date().toISOString(),
        is_admin: true, is_root_admin: false,
        admin_permissions: perms,
      };
      await storage.saveUsers([...users, newAdmin]);
      toast.success("تم إنشاء الآدمن");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ");
    } finally { setSaving(false); }
  };

  const PERM_LABELS: Record<keyof AdminPermissions, string> = {
    view_user_sections: "عرض جميع أقسام المستخدمين",
    manage_dashboard: "الوصول إلى لوحة التحكم",
    manage_admins: "إدارة الآدمنين",
    manage_home: "إدارة الصفحة الرئيسية",
    manage_features: "إدارة المميزات",
    manage_plans: "إدارة خطط الاستثمار",
    manage_faq: "إدارة الأسئلة الشائعة",
    manage_contact: "إدارة تواصل معنا",
    manage_social_links: "إدارة روابط التواصل",
    manage_site_name: "إدارة اسم الموقع",
    manage_colors: "إدارة الألوان",
    manage_preview: "معاينة الموقع",
    manage_wallets: "إدارة المحافظ الاستثمارية",
  };

  return (
    <Modal onClose={onClose} title="إضافة آدمن جديد">
      <div className="space-y-3">
        <Field label="الدولة"><CountryPicker value={country?.code} onChange={setCountry} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الاسم"><TextInput value={firstName} onChange={setFirstName} /></Field>
          <Field label="اسم العائلة"><TextInput value={lastName} onChange={setLastName} /></Field>
        </div>
        <Field label="رقم الهاتف"><TextInput value={phone} onChange={setPhone} /></Field>
        <Field label="البريد الإلكتروني"><TextInput value={email} onChange={setEmail} type="email" /></Field>
        <Field label="كلمة المرور"><TextInput value={password} onChange={setPassword} type="text" /></Field>

        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="mb-3 font-bold text-primary">الصلاحيات</div>
          <div className="grid gap-2">
            {(Object.keys(PERM_LABELS) as Array<keyof AdminPermissions>).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm hover:bg-background">
                <input type="checkbox" checked={perms[k]} onChange={() => togglePerm(k)} className="h-4 w-4 accent-gold" />
                <span>{PERM_LABELS[k]}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 font-bold text-gold-foreground shadow-gold disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          إنشاء الآدمن
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Home Content ---------- */
function HomeContentSection() {
  const { content, save } = useContent();
  const [hero_title, setHT] = useState(content.hero_title);
  const [hero_subtitle, setHS] = useState(content.hero_subtitle);
  const [about, setAbout] = useState(content.about);
  useEffect(() => { setHT(content.hero_title); setHS(content.hero_subtitle); setAbout(content.about); }, [content]);

  const handleSave = async () => {
    await save({ ...content, hero_title, hero_subtitle, about });
    toast.success("تم الحفظ");
  };

  return (
    <Section title="إدارة الصفحة الرئيسية والـ من نحن">
      <Field label="عنوان الـ Hero"><TextInput value={hero_title} onChange={setHT} /></Field>
      <Field label="نص الـ Hero"><Textarea value={hero_subtitle} onChange={setHS} rows={4} /></Field>
      <Field label="نص من نحن (افصل الفقرات بسطر فارغ)"><Textarea value={about} onChange={setAbout} rows={10} /></Field>
      <SaveBtn onClick={handleSave} />
    </Section>
  );
}

/* ---------- Features ---------- */
function FeaturesSection() {
  const { content, save } = useContent();
  const [items, setItems] = useState<FeatureItem[]>(content.features);
  useEffect(() => setItems(content.features), [content]);

  const update = (i: number, patch: Partial<FeatureItem>) => setItems((arr) => arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const add = () => setItems((arr) => [...arr, { icon: "Sparkles", title: "ميزة جديدة", description: "وصف الميزة" }]);

  return (
    <Section title="إدارة المميزات" action={<button onClick={add} className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-3 py-2 text-sm font-bold text-gold-foreground"><Plus className="h-4 w-4" /> إضافة</button>}>
      <div className="space-y-3">
        {items.map((f, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="أيقونة (Lucide)"><TextInput value={f.icon} onChange={(v) => update(i, { icon: v })} /></Field>
              <Field label="العنوان"><TextInput value={f.title} onChange={(v) => update(i, { title: v })} /></Field>
              <Field label="الوصف"><TextInput value={f.description} onChange={(v) => update(i, { description: v })} /></Field>
            </div>
            <button onClick={() => remove(i)} className="mt-2 text-xs text-destructive hover:underline"><Trash2 className="inline h-3 w-3" /> حذف</button>
          </div>
        ))}
      </div>
      <SaveBtn onClick={async () => { await save({ ...content, features: items }); toast.success("تم الحفظ"); }} />
    </Section>
  );
}

/* ---------- Plans ---------- */
function PlansSection() {
  const { content, save } = useContent();
  const [plans, setPlans] = useState<PlanGroup[]>(content.plans);
  useEffect(() => setPlans(content.plans), [content]);

  const updateGroup = (i: number, patch: Partial<PlanGroup>) => setPlans((a) => a.map((g, idx) => idx === i ? { ...g, ...patch } : g));
  const updateItem = (gi: number, ii: number, patch: Partial<{ amount: string; daily_return: string }>) =>
    setPlans((a) => a.map((g, idx) => idx !== gi ? g : { ...g, items: g.items.map((it, j) => j === ii ? { ...it, ...patch } : it) }));
  const addItem = (gi: number) => updateGroup(gi, { items: [...plans[gi].items, { amount: "0", daily_return: "0" }] });
  const removeItem = (gi: number, ii: number) => updateGroup(gi, { items: plans[gi].items.filter((_, j) => j !== ii) });
  const addGroup = () => setPlans((a) => [...a, { currency: "عملة جديدة", symbol: "$", flag: "🌍", items: [] }]);
  const removeGroup = (gi: number) => setPlans((a) => a.filter((_, i) => i !== gi));

  return (
    <Section title="إدارة خطط الاستثمار" action={<button onClick={addGroup} className="rounded-xl bg-gradient-gold px-3 py-2 text-sm font-bold text-gold-foreground"><Plus className="inline h-4 w-4" /> إضافة عملة</button>}>
      <div className="space-y-5">
        {plans.map((g, gi) => (
          <div key={gi} className="rounded-2xl border border-border bg-background p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <Field label="العلم"><TextInput value={g.flag} onChange={(v) => updateGroup(gi, { flag: v })} /></Field>
              <Field label="اسم العملة"><TextInput value={g.currency} onChange={(v) => updateGroup(gi, { currency: v })} /></Field>
              <Field label="الرمز"><TextInput value={g.symbol} onChange={(v) => updateGroup(gi, { symbol: v })} /></Field>
            </div>
            <div className="mt-3 space-y-2">
              {g.items.map((it, ii) => (
                <div key={ii} className="flex items-end gap-2">
                  <Field label="المبلغ"><TextInput value={it.amount} onChange={(v) => updateItem(gi, ii, { amount: v })} /></Field>
                  <Field label="العائد اليومي"><TextInput value={it.daily_return} onChange={(v) => updateItem(gi, ii, { daily_return: v })} /></Field>
                  <button onClick={() => removeItem(gi, ii)} className="mb-2 rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => addItem(gi)} className="text-xs text-gold hover:underline"><Plus className="inline h-3 w-3" /> إضافة بند</button>
                <button onClick={() => removeGroup(gi)} className="text-xs text-destructive hover:underline mr-auto"><Trash2 className="inline h-3 w-3" /> حذف العملة</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <SaveBtn onClick={async () => { await save({ ...content, plans }); toast.success("تم الحفظ"); }} />
    </Section>
  );
}

/* ---------- FAQ ---------- */
function FaqSection() {
  const { content, save } = useContent();
  const [faqs, setFaqs] = useState<FaqItem[]>(content.faqs);
  useEffect(() => setFaqs(content.faqs), [content]);

  return (
    <Section title="الأسئلة الشائعة" action={<button onClick={() => setFaqs([...faqs, { q: "سؤال جديد", a: "إجابة" }])} className="rounded-xl bg-gradient-gold px-3 py-2 text-sm font-bold text-gold-foreground"><Plus className="inline h-4 w-4" /> إضافة</button>}>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-4">
            <Field label="السؤال"><TextInput value={f.q} onChange={(v) => setFaqs(faqs.map((x, idx) => idx === i ? { ...x, q: v } : x))} /></Field>
            <Field label="الإجابة"><Textarea value={f.a} onChange={(v) => setFaqs(faqs.map((x, idx) => idx === i ? { ...x, a: v } : x))} rows={3} /></Field>
            <button onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="text-xs text-destructive hover:underline"><Trash2 className="inline h-3 w-3" /> حذف</button>
          </div>
        ))}
      </div>
      <SaveBtn onClick={async () => { await save({ ...content, faqs }); toast.success("تم الحفظ"); }} />
    </Section>
  );
}

/* ---------- Contact ---------- */
function ContactSection() {
  const { content, save } = useContent();
  const [c, setC] = useState(content.contact);
  useEffect(() => setC(content.contact), [content]);
  return (
    <Section title="إدارة تواصل معنا">
      <Field label="البريد الإلكتروني"><TextInput value={c.email} onChange={(v) => setC({ ...c, email: v })} /></Field>
      <Field label="الهاتف"><TextInput value={c.phone} onChange={(v) => setC({ ...c, phone: v })} /></Field>
      <Field label="العنوان"><TextInput value={c.address} onChange={(v) => setC({ ...c, address: v })} /></Field>
      <Field label="الوصف"><Textarea value={c.description} onChange={(v) => setC({ ...c, description: v })} rows={3} /></Field>
      <SaveBtn onClick={async () => { await save({ ...content, contact: c }); toast.success("تم الحفظ"); }} />
    </Section>
  );
}

/* ---------- Social ---------- */
function SocialSection() {
  const { content, save } = useContent();
  const [s, setS] = useState(content.social_links);
  const [pay, setPay] = useState(content.payment_link);
  useEffect(() => { setS(content.social_links); setPay(content.payment_link); }, [content]);
  return (
    <Section title="روابط التواصل والدعم">
      <Field label="رابط الإيداع/الدعم (يظهر في خطوة الإيداع)"><TextInput value={pay} onChange={setPay} /></Field>
      <Field label="تيليجرام"><TextInput value={s.telegram || ""} onChange={(v) => setS({ ...s, telegram: v })} /></Field>
      <Field label="واتساب (رابط مباشر)"><TextInput value={s.whatsapp || ""} onChange={(v) => setS({ ...s, whatsapp: v })} /></Field>
      <Field label="تويتر / X"><TextInput value={s.twitter || ""} onChange={(v) => setS({ ...s, twitter: v })} /></Field>
      <Field label="إنستغرام"><TextInput value={s.instagram || ""} onChange={(v) => setS({ ...s, instagram: v })} /></Field>
      <Field label="فيسبوك"><TextInput value={s.facebook || ""} onChange={(v) => setS({ ...s, facebook: v })} /></Field>
      <SaveBtn onClick={async () => { await save({ ...content, social_links: s, payment_link: pay }); toast.success("تم الحفظ"); }} />
    </Section>
  );
}

/* ---------- Site name ---------- */
function SiteNameSection() {
  const { content, save } = useContent();
  const [n, setN] = useState(content.site_name);
  useEffect(() => setN(content.site_name), [content]);
  return (
    <Section title="اسم الموقع">
      <Field label="الاسم الذي يظهر في الواجهة والشريط الجانبي"><TextInput value={n} onChange={setN} /></Field>
      <SaveBtn onClick={async () => { await save({ ...content, site_name: n }); toast.success("تم الحفظ"); }} />
    </Section>
  );
}

/* ---------- Colors ---------- */
function ColorsSection() {
  const { content, save } = useContent();
  const [t, setT] = useState(content.theme);
  useEffect(() => setT(content.theme), [content]);

  // Live preview
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", t.primary_hsl);
    root.style.setProperty("--gold", t.gold_hsl);
    root.style.setProperty("--accent", t.gold_hsl);
    root.style.setProperty("--ring", t.gold_hsl);
    root.style.setProperty("--background", t.background_hsl);
  }, [t]);

  const presets = [
    { name: "نماء (افتراضي)", primary_hsl: "224 65% 18%", gold_hsl: "42 70% 55%", background_hsl: "220 30% 98%" },
    { name: "زمردي", primary_hsl: "160 60% 18%", gold_hsl: "45 90% 55%", background_hsl: "150 30% 98%" },
    { name: "ملكي", primary_hsl: "270 50% 22%", gold_hsl: "42 80% 58%", background_hsl: "270 30% 98%" },
    { name: "ذهبي داكن", primary_hsl: "30 30% 12%", gold_hsl: "45 85% 55%", background_hsl: "40 30% 96%" },
  ];

  return (
    <Section title="الألوان والثيم" desc="معاينة فورية أثناء التعديل، اضغط حفظ للتثبيت">
      <div className="grid gap-2 sm:grid-cols-4">
        {presets.map((p) => (
          <button key={p.name} onClick={() => setT({ primary_hsl: p.primary_hsl, gold_hsl: p.gold_hsl, background_hsl: p.background_hsl })}
            className="rounded-xl border border-border bg-card p-3 text-sm font-bold hover:border-gold">
            <div className="mb-2 flex h-8 overflow-hidden rounded-lg">
              <div className="flex-1" style={{ background: `hsl(${p.primary_hsl})` }} />
              <div className="flex-1" style={{ background: `hsl(${p.gold_hsl})` }} />
            </div>
            {p.name}
          </button>
        ))}
      </div>
      <Field label="اللون الأساسي (HSL: 224 65% 18%)"><TextInput value={t.primary_hsl} onChange={(v) => setT({ ...t, primary_hsl: v })} /></Field>
      <Field label="اللون الذهبي (HSL)"><TextInput value={t.gold_hsl} onChange={(v) => setT({ ...t, gold_hsl: v })} /></Field>
      <Field label="لون الخلفية (HSL)"><TextInput value={t.background_hsl} onChange={(v) => setT({ ...t, background_hsl: v })} /></Field>
      <SaveBtn onClick={async () => { await save({ ...content, theme: t }); toast.success("تم حفظ الألوان"); }} />
    </Section>
  );
}

/* ---------- Preview ---------- */
function PreviewSection() {
  return (
    <Section title="معاينة الموقع" desc="معاينة كاملة كما يراها المستخدمون">
      <div className="overflow-hidden rounded-2xl border border-border" style={{ height: "70vh" }}>
        <iframe src="/" title="معاينة" className="h-full w-full" />
      </div>
      <a href="/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gold hover:underline">
        فتح في تبويب جديد ↗
      </a>
    </Section>
  );
}

/* ---------- Wallets ---------- */
function WalletsSection() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [editing, setEditing] = useState<UserRecord | null>(null);

  const load = async () => {
    setUsers(await storage.getUsers());
    setWallets(await storage.getWallets());
  };
  useEffect(() => { load(); }, []);

  const regular = users.filter((u) => !u.is_admin);

  return (
    <Section title="إدارة المحافظ الاستثمارية" desc="حدد الحقول التي تظهر للمستخدم في محفظته">
      <div className="space-y-2">
        {regular.length === 0 && <div className="rounded-xl bg-secondary p-4 text-center text-sm text-muted-foreground">لا يوجد مستخدمون مسجلون بعد</div>}
        {regular.map((u) => {
          const w = wallets.find((x) => x.user_id === u.id);
          const visibleCount = w ? Object.values(w.visible).filter(Boolean).length : 0;
          return (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
              <div>
                <div className="font-bold text-primary">{u.first_name} {u.last_name}</div>
                <div className="text-xs text-muted-foreground" dir="ltr">{u.email}</div>
                <div className="mt-1 text-xs text-muted-foreground">{visibleCount} حقل مفعّل</div>
              </div>
              <button onClick={() => setEditing(u)} className="rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-gold-foreground">تعديل المحفظة</button>
            </div>
          );
        })}
      </div>
      {editing && <WalletEditor user={editing} wallets={wallets} onClose={() => setEditing(null)} onSaved={load} />}
    </Section>
  );
}

function WalletEditor({ user, wallets, onClose, onSaved }: { user: UserRecord; wallets: WalletRecord[]; onClose: () => void; onSaved: () => void }) {
  const existing = wallets.find((w) => w.user_id === user.id);
  const [fields, setFields] = useState<WalletRecord["fields"]>(existing?.fields || {});
  const [visible, setVisible] = useState<WalletRecord["visible"]>(existing?.visible || {});

  const FIELDS: Array<{ key: keyof WalletRecord["fields"]; label: string }> = [
    { key: "name", label: "الاسم" },
    { key: "email", label: "البريد الإلكتروني" },
    { key: "investment_amount", label: "مبلغ الاشتراك" },
    { key: "profits", label: "الأرباح" },
    { key: "fees", label: "الرسوم" },
    { key: "iban", label: "الآيبان" },
    { key: "digital_wallet", label: "المحفظة الرقمية" },
    { key: "system_account", label: "حساب النظام" },
    { key: "system_wallet", label: "محفظة النظام" },
  ];

  const save = async () => {
    const all = await storage.getWallets();
    const next: WalletRecord = {
      user_id: user.id,
      fields,
      visible,
      updated_at: new Date().toISOString(),
    };
    const filtered = all.filter((w) => w.user_id !== user.id);
    await storage.saveWallets([...filtered, next]);
    toast.success("تم حفظ المحفظة");
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose} title={`محفظة: ${user.first_name} ${user.last_name}`}>
      <div className="space-y-3">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="rounded-xl border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold text-sm">{label}</span>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input type="checkbox" checked={!!visible[key]} onChange={(e) => setVisible({ ...visible, [key]: e.target.checked })} className="h-4 w-4 accent-gold" />
                إظهار للمستخدم
              </label>
            </div>
            <TextInput value={fields[key] || ""} onChange={(v) => setFields({ ...fields, [key]: v })} placeholder={`أدخل ${label}`} />
          </div>
        ))}
        <SaveBtn onClick={save} />
      </div>
    </Modal>
  );
}

/* ---------- Settings (Proxy) ---------- */
function SettingsSection() {
  const [url, setUrl] = useState(storage.getConfig().proxy_url || "");
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    const proxy = url.trim();
    if (!proxy) {
      toast.error("أدخل رابط Proxy أولاً");
      return;
    }
    setTesting(true);
    try {
      const readRes = await fetch(`${proxy.replace(/\/$/, "")}/api/data?entity=users`, { method: "GET" });
      const readPayload = await readRes.json().catch(() => ({}));
      if (!readRes.ok) {
        throw new Error(readPayload?.error || `GET failed (status: ${readRes.status})`);
      }

      const users = Array.isArray(readPayload?.data) ? readPayload.data : [];
      const writeRes = await fetch(`${proxy.replace(/\/$/, "")}/api/data?entity=users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: users }),
      });
      const writePayload = await writeRes.json().catch(() => ({}));
      if (!writeRes.ok) {
        throw new Error(writePayload?.error || `PUT failed (status: ${writeRes.status})`);
      }

      toast.success("الاتصال ناجح والكتابة إلى GitHub تعمل");
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل اختبار الاتصال";
      toast.error(message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Section title="إعدادات الـ Backend (GitHub via Vercel Proxy)" desc="اختياري. اتركه فارغاً للتخزين المحلي فقط">
      <div className="rounded-xl border border-border bg-background p-3 text-sm">
        {storage.isUsingProxy() ? (
          <span className="font-bold text-success">التخزين السحابي مفعّل</span>
        ) : (
          <span className="text-muted-foreground">التخزين المحلي فقط</span>
        )}
      </div>
      <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 text-sm text-foreground">
        <strong className="block">كيف يعمل؟</strong>
        <ol className="mt-2 list-decimal space-y-1 pr-4 text-xs text-muted-foreground">
          <li>أنشئ مستودع GitHub خاص فارغ.</li>
          <li>انسخ كود الـ Proxy من ملف <code className="rounded bg-secondary px-1">vercel-proxy/</code> في مشروعك.</li>
          <li>انشره على Vercel وأضف متغيرات البيئة: <code>GITHUB_TOKEN</code>, <code>GITHUB_OWNER</code>, <code>GITHUB_REPO</code>.</li>
          <li>الصق رابط Vercel هنا (مثلاً <code>https://my-proxy.vercel.app</code>).</li>
        </ol>
      </div>
      <Field label="رابط Vercel Proxy">
        <TextInput value={url} onChange={setUrl} placeholder="https://your-proxy.vercel.app" />
      </Field>
      <div className="flex gap-2">
        <button onClick={() => { storage.saveConfig({ proxy_url: url.trim() || undefined }); toast.success("تم الحفظ، سيتم استخدام Proxy للقراءة والكتابة"); }}
          className="flex-1 rounded-xl bg-gradient-gold py-3 font-bold text-gold-foreground shadow-gold">حفظ</button>
        <button onClick={testConnection} disabled={testing}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm disabled:opacity-50">
          {testing && <Loader2 className="h-4 w-4 animate-spin" />}
          اختبار الاتصال
        </button>
        <button onClick={() => { storage.saveConfig({}); setUrl(""); toast.info("تم التعطيل، التخزين محلي فقط"); }}
          className="rounded-xl border border-border px-4 py-3 text-sm">تعطيل</button>
      </div>
    </Section>
  );
}

/* ---------- Reusable bits ---------- */
function Section({ title, desc, action, children }: { title: string; desc?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-primary">{title}</h2>
          {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold">{label}</span>{children}</label>;
}
function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />;
}
function Textarea({ value, onChange, rows = 4 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />;
}
function SaveBtn({ onClick }: { onClick: () => void | Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <button onClick={async () => { setBusy(true); try { await onClick(); } finally { setBusy(false); } }}
      disabled={busy}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-bold text-gold-foreground shadow-gold disabled:opacity-50">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ التغييرات
    </button>
  );
}
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-primary/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-card shadow-elegant animate-scale-in">
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-hero p-4 text-primary-foreground">
          <h3 className="font-display text-lg font-extrabold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/10">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
