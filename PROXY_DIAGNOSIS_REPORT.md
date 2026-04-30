# تقرير تشخيص شامل — مشروع `namaa-invest-hub`

## 1) ملخص المشكلة

المشكلة الظاهرة: المستخدم يحفظ رابط الـ Proxy من لوحة الأدمن وتظهر رسالة نجاح، ثم يسجّل مستخدمًا جديدًا، لكن:
- endpoint الـ Proxy على المسار `/api/data?entity=users` يرجع `{"data":[]}`.
- ملف `data/users.json` لا يظهر/لا يتحدث في مستودع `namaa-data`.
- تسجيل الدخول من متصفح/جهاز آخر يفشل (بيانات غير صحيحة).

النتيجة التحليلية: الواجهة تعتمد **استراتيجية fallback** (محلي أولًا + محاولة رفع صامتة للـ Proxy). عند فشل الكتابة للـ Proxy، لا يظهر خطأ للمستخدم لأن الدوال لا ترمي exception في الفشل، فيبدو التسجيل ناجحًا محليًا فقط (في `localStorage`) بينما البيانات لا تصل لـ GitHub.

---

## 2) خريطة الملفات المهمة

### الواجهة الأمامية (Frontend)
- `src/data/storage.ts`
  - طبقة التخزين الأساسية (Local + Remote Proxy).
  - إدارة `proxy_url` من config المحلي.
  - الدوال: `getUsers`, `saveUsers`, `readRemote`, `writeRemote`, `getConfig`, `saveConfig`.
- `src/hooks/useAuth.ts`
  - منطق التسجيل/الدخول.
  - `register()` يقرأ المستخدمين عبر `storage.getUsers()` ثم يحفظ عبر `storage.saveUsers()`.
  - `login()` يقرأ المستخدمين عبر `storage.getUsers()` ويطابق الإيميل/الهاش.
- `src/components/auth/RegisterDialog.tsx`
  - واجهة إنشاء الحساب (تستدعي `useAuth().register`).
- `src/components/auth/LoginDialog.tsx`
  - واجهة تسجيل الدخول (تستدعي `useAuth().login`).
- `src/pages/AdminPage.tsx`
  - قسم الإعدادات (Proxy URL) وحفظه محليًا.

### الباكند الخفيف (Vercel Proxy)
- `vercel-proxy/api/data.js`
  - endpoint وحيد `/api/data`.
  - يدعم `GET` و`PUT` للكيانات: `users`, `wallets`, `content` فقط.
  - يكتب في GitHub عبر API لمسارات `data/<entity>.json`.
- `vercel-proxy/README.md`
  - متطلبات النشر والمتغيرات البيئية (`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, ...).

---

## 3) مسار التسجيل الحالي خطوة بخطوة

1. المستخدم يملأ نموذج التسجيل في `RegisterDialog`.
2. `handleSubmit` يستدعي `register(...)` من `useAuth`.
3. `useAuth.register` ينفذ `boot()` أولًا (وقد ينشئ/يحدث root admin).
4. يقرأ المستخدمين الحاليين عبر `storage.getUsers()`:
   - يحاول أولًا `GET {proxy}/api/data?entity=users`.
   - لو نجح: يستخدم البيانات البعيدة + يزامنها إلى localStorage.
   - لو فشل: يرجع للـ localStorage (`namaa.users`).
5. يبني `newUser` ثم يستدعي `storage.saveUsers([...users, newUser])`.
6. `storage.saveUsers` يعمل بالترتيب:
   - يكتب محليًا فورًا (`localStorage.setItem("namaa.users", ...)`).
   - ثم يحاول `PUT` على الـ Proxy.
7. **مهم جدًا**: نتيجة `writeRemote` لا يتم التحقق منها، ولا تُرمى أخطاء للمستخدم عند فشل PUT.
8. الواجهة تعتبر العملية ناجحة وتعرض "تم إنشاء الحساب بنجاح".

خلاصة المسار: التسجيل "قد ينجح بصريًا" حتى لو الحفظ السحابي فشل فعليًا.

---

## 4) مسار تسجيل الدخول الحالي خطوة بخطوة

1. المستخدم يرسل البريد/كلمة المرور من `LoginDialog`.
2. `useAuth.login` ينفذ `boot()`.
3. يحسب `SHA-256` لكلمة المرور.
4. يقرأ `users` عبر `storage.getUsers()` بنفس منطق fallback:
   - يفضّل الـ Proxy عند النجاح.
   - يرجع للمحلي عند فشل القراءة البعيدة.
5. يبحث عن مستخدم مطابق بالإيميل + `password_hash`.
6. عند التطابق، يحفظ `sessionStorage` (`namaa.session.userId`).

الأثر على جهاز آخر:
- إذا الكتابة للـ Proxy لم تحدث أصلًا، الجهاز الآخر لا يملك localStorage المحلي للجهاز الأول، فيقرأ من Proxy الفارغ => لا يجد المستخدم => "بيانات الدخول غير صحيحة".

---

## 5) مسار حفظ إعدادات Proxy

1. في `AdminPage` داخل `SettingsSection`، الحقل `url` يقرأ ابتدائيًا من `storage.getConfig().proxy_url`.
2. عند الضغط على "حفظ":
   - `storage.saveConfig({ proxy_url: url.trim() || undefined })`.
3. `storage.saveConfig` يكتب في `localStorage` ضمن المفتاح `namaa.config`.
4. دالة `getProxyUrl()` في `storage.ts` تقرأ `namaa.config` وتستخرج `proxy_url`.

المعنى: إعداد رابط الـ Proxy **محلي لكل متصفح/جهاز** وليس إعدادًا مركزيًا عامًّا لكل المستخدمين.

---

## 6) هل الـ Proxy مستخدم فعليًا أم لا؟

نظريًا: نعم، إذا وُجد `proxy_url` في `namaa.config`.

عمليًا في الكود الحالي:
- كل عمليات القراءة/الكتابة للكيانات (`users/wallets/content`) تمر عبر `readRemote/writeRemote` أولًا (أو بالتوازي مع المحلي في حالة الكتابة).
- لكن لا توجد آلية "إلزام النجاح" أو "إظهار فشل الكتابة السحابية".

إذًا: قد يكون "مفعّل" من منظور UI، لكنه غير مضمون التنفيذ الفعلي بسبب الصمت عند الأخطاء.

---

## 7) السبب الجذري للمشكلة

### السبب الجذري الأساسي (Root Cause)
**تصميم التخزين الحالي يسمح بفشل صامت للكتابة البعيدة**:
- `saveUsers` (وأشباهها) يكتب محليًا ثم يستدعي `writeRemote` بدون التحقق من النتيجة.
- `writeRemote` يعيد `false` عند أي خطأ، لكن لا أحد يتعامل معه.
- بالتالي المستخدم يرى نجاحًا، بينما GitHub يبقى فارغًا.

### عوامل مساعدة قوية (Contributing Factors)
1. **إعداد proxy محلي وليس مركزي**:
   - ممكن الأدمن ضبط الرابط على جهازه فقط؛ جهاز آخر لن يملكه.
2. **عدم وجود شاشة تشخيص اتصال**:
   - لا يوجد Test Connection أو إظهار سبب خطأ (`401/403/404/500`).
3. **الـ Proxy يعيد `{"data":[]}` عند 404 لملف users.json**:
   - هذا طبيعي إذا الملف غير موجود بعد أو فشلت أول كتابة.
4. **اعتماد النشر على متغيرات Vercel**:
   - أي خطأ في `GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPO/GITHUB_BRANCH` يمنع الكتابة.

---

## 8) الملفات التي تحتاج تعديل لاحقًا (بدون تنفيذ الآن)

- `src/data/storage.ts`
  - جعل الكتابة البعيدة إلزامية (أو على الأقل إرجاع حالة مفصلة وإطلاق خطأ عند الفشل حسب النمط المطلوب).
  - توحيد سياسة القراءة/الكتابة وتسجيل الأخطاء.
- `src/hooks/useAuth.ts`
  - التعامل مع فشل `saveUsers` وإظهار رسالة دقيقة للمستخدم.
- `src/pages/AdminPage.tsx`
  - إضافة زر "اختبار الاتصال" مع عرض نتيجة GET/PUT التجريبية.
  - عرض حالة فعلية للاتصال بدل مجرد وجود `proxy_url`.
- `vercel-proxy/api/data.js`
  - تحسين رسائل الخطأ (تغليف أوضح لأخطاء GitHub API).
  - (اختياري) endpoint healthcheck صريح.

---

## 9) خطة إصلاح مقترحة (بدون تنفيذ)

1. **Phase 1 — Observable Errors**
   - تعديل storage لإرجاع نتيجة مفصلة للكتابة (`ok`, `status`, `message`).
   - إظهار toast فشل واضح عند تعذر رفع users.
2. **Phase 2 — Sync Policy**
   - تقرير قرار معماري: 
     - إما "Cloud-first إلزامي" (فشل الشبكة = فشل العملية).
     - أو "Offline-first" مع queue/retry ومؤشر "غير متزامن".
3. **Phase 3 — Proxy Diagnostics**
   - إضافة Test Connection في صفحة الإعدادات:
     - GET users
     - PUT بيانات test مؤقتة
     - GET تحقق
4. **Phase 4 — Shared Config Strategy**
   - نقل إعداد `proxy_url` لمصدر مركزي (env/build config) إن الهدف سلوك موحد عبر الأجهزة.
5. **Phase 5 — Security Hardening**
   - استبدال SHA-256 بآلية مصادقة آمنة حقيقية (Backend + salted hashing مثل bcrypt/argon2).

---

## 10) مخاطر وملاحظات أمنية

1. كلمات المرور تُخزن كـ `SHA-256` بدون salt ضمن JSON — غير مناسب للإنتاج.
2. بيانات المستخدمين محفوظة في GitHub repo (حتى لو private)؛ تحتاج حوكمة وصول قوية.
3. `ALLOW_ORIGIN="*"` قد يزيد سطح الهجوم (يفضل تحديد origin صريح).
4. عدم وجود Authentication/Authorization على endpoint الـ Proxy نفسه (الاعتماد فقط على سرية الرابط + GitHub token بالخادم).
5. وجود root admin ثابت في الكود (email/password معروفان) مخاطرة عالية إن لم يُعالج بنهج نشر آمن.

---

## استنتاج نهائي

المشكلة ليست أن واجهة التسجيل لا تستدعي الـ Proxy، بل أن الاستدعاء **غير موثوق وغير مُراقَب النتيجة**. لذلك تظهر رسالة نجاح وتُحفظ البيانات محليًا، بينما لا يتم إنشاء/تحديث `data/users.json` في `namaa-data` عند فشل PUT لأي سبب في بيئة Vercel/GitHub أو الشبكة. هذا يفسّر مباشرةً:
- `{"data":[]}` من endpoint،
- غياب البيانات في GitHub،
- وفشل تسجيل الدخول من جهاز آخر.
