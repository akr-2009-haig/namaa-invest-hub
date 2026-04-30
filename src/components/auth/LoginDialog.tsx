import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function LoginDialog({ onClose, onSwitchToRegister }: { onClose: () => void; onSwitchToRegister: () => void }) {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      if (remember) localStorage.setItem("namaa.remember.email", email);
      toast.success(`أهلاً بعودتك ${u.first_name}`);
      onClose();
      nav(u.is_admin ? "/admin" : "/wallet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-primary/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-elegant animate-scale-in">
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-hero p-5 text-primary-foreground">
          <div>
            <h2 className="font-display text-xl font-extrabold">تسجيل الدخول</h2>
            <p className="text-xs opacity-80">للوصول إلى حسابك ومتابعة استثماراتك</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold">البريد الإلكتروني</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="اكتب بريدك الإلكتروني" required
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold">كلمة المرور</span>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground" tabIndex={-1}>
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-xs">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-gold" />
              <span>تذكرني</span>
            </label>
            <button type="button" className="text-gold hover:underline" onClick={() => toast.info("راسل الدعم لاسترجاع كلمة المرور")}>
              نسيت كلمة المرور؟
            </button>
          </div>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 text-sm font-bold text-gold-foreground shadow-gold disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            دخول
          </button>

          <p className="text-center text-xs text-muted-foreground">
            ليس لديك حساب؟{" "}
            <button type="button" onClick={onSwitchToRegister} className="font-bold text-gold hover:underline">
              إنشاء حساب
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
