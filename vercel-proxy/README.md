# Vercel Proxy لمشروع نماء الرقمية للاستثمار

هذا المجلد جاهز للنشر على Vercel. وظيفته: قراءة وكتابة ملفات JSON في GitHub repo خاص بدلاً من قاعدة بيانات.

## خطوات النشر

### 1) أنشئ GitHub Repo خاص
- اسم مقترح: `namaa-data`
- اختر **Private**
- ابدأه بـ README فقط

### 2) أنشئ GitHub Personal Access Token
- اذهب إلى: https://github.com/settings/tokens
- اضغط **Generate new token (classic)**
- أعطه صلاحية: `repo` (كاملة)
- انسخ التوكن (يبدأ بـ `ghp_...`)

### 3) انشر هذا المجلد على Vercel
1. اذهب إلى https://vercel.com/new
2. ارفع هذا المجلد (`vercel-proxy/`) أو اربطه بـ GitHub
3. في **Environment Variables** أضف:
   - `GITHUB_TOKEN` = التوكن من الخطوة 2
   - `GITHUB_OWNER` = اسم مستخدمك على GitHub
   - `GITHUB_REPO` = `namaa-data`
   - `GITHUB_BRANCH` = `main` (اختياري)
   - `ALLOW_ORIGIN` = `*` أو رابط موقعك بالضبط (أفضل)
4. اضغط **Deploy**

### 4) اربطه بالموقع
- افتح موقعك → **لوحة التحكم** → **الإعدادات (Proxy)**
- الصق رابط Vercel (مثل `https://namaa-proxy.vercel.app`)
- احفظ. الآن جميع البيانات تُحفظ في GitHub.

## كيفية تخزين الملفات في GitHub
سيتم إنشاء هذه الملفات تلقائياً في الريبو:
- `data/users.json`
- `data/wallets.json`
- `data/content.json`

## ⚠️ تحذيرات أمنية
- كلمات المرور مخزنة بـ SHA-256 (غير آمنة للإنتاج).
- أي شخص لديه وصول للريبو يستطيع رؤية كل البيانات.
- لا تستخدم هذا النظام لأموال حقيقية.
