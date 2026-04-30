import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { CountryPicker } from "./CountryPicker";
import { COUNTRIES, type Country } from "@/data/countries";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  first_name: z.string().trim().min(2, "الاسم مطلوب").max(50),
  last_name: z.string().trim().min(2, "اسم العائلة مطلوب").max(50),
  email: z.string().trim().email("بريد إلكتروني غير صحيح").max(255),
  phone: z.string().trim().min(5, "رقم الهاتف غير صحيح").max(20),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل").max(100),
});

interface Props {
  onClose: () => void;
}

export function RegisterDialog({ onClose }: Props) {
  const nav = useNavigate();
  const { register } = useAuth();

  const [country, setCountry] = useState<Country | undefined>(undefined);
  const [dialCountry, setDialCountry] = useState<Country | undefined>(undefined);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const onCountry = (c: Country) => {
    setCountry(c);
    if (!dialCountry) setDialCountry(c);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country) return toast.error("اختر دولتك");
    if (!dialCountry) return toast.error("اختر رمز الدولة للهاتف");
    if (!acceptPrivacy) return toast.error("يجب الموافقة على سياسة الخصوصية");

    const parsed = schema.safeParse({ first_name: firstName, last_name: lastName, email, phone, password });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);

    setLoading(true);
    try {
      const u = await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dial_code: dialCountry.dial,
        country_code: country.code,
        country_name: country.nameAr,
        password,
      });
      toast.success("تم إنشاء الحساب بنجاح");
      onClose();
      nav(u.is_admin ? "/admin" : "/wallet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-primary/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="my-8 w-full max-w-md rounded-2xl bg-card shadow-elegant animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-hero p-5 text-primary-foreground">
          <div>
            <h2 className="font-display text-xl font-extrabold">إنشاء حساب جديد</h2>
            <p className="text-xs opacity-80">ابدأ رحلتك الاستثمارية الآن</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Country */}
          <Field label="البلد">
            <CountryPicker value={country?.code} onChange={onCountry} placeholder="اختر دولتك" />
          </Field>

          <p className="rounded-lg bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
            أنت على وشك التسجيل في شركة نماء للاستثمار، المرخصة والمنظمة من قبل هيئة السوق السعودية والأمريكية. يرجى مراجعة الشروط قبل المتابعة.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم">
              <Input value={firstName} onChange={setFirstName} placeholder="اكتب اسمك" />
            </Field>
            <Field label="اسم العائلة">
              <Input value={lastName} onChange={setLastName} placeholder="اكتب اسم عائلتك" />
            </Field>
          </div>

          <Field label="رقم الهاتف">
            <div className="grid grid-cols-[110px_1fr] gap-2">
              <CountryPicker value={dialCountry?.code} onChange={setDialCountry} mode="dial" />
              <Input value={phone} onChange={setPhone} placeholder="رقم الهاتف" type="tel" />
            </div>
          </Field>

          <Field label="البريد الإلكتروني">
            <Input value={email} onChange={setEmail} placeholder="example@email.com" type="email" />
          </Field>

          <Field label="كلمة المرور">
            <div className="relative">
              <Input value={password} onChange={setPassword} placeholder="••••••••" type={showPwd ? "text" : "password"} />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <div className="space-y-2 pt-1">
            <Check2 checked={acceptTerms} onChange={setAcceptTerms}>
              أؤكد أنني ملتزم بكل شروط التداول الحلال
            </Check2>
            <Check2 checked={acceptPrivacy} onChange={setAcceptPrivacy}>
              أوافق على سياسة الخصوصية والشروط والأحكام
            </Check2>
          </div>

          <button
            type="submit"
            disabled={loading || !acceptPrivacy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 text-sm font-bold text-gold-foreground shadow-gold transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            تسجيل
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none"
    />
  );
}

function Check2({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs leading-snug">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer accent-gold"
      />
      <span>{children}</span>
    </label>
  );
}
