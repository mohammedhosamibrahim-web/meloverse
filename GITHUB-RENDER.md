# نشر MeloVerse دائمًا عبر GitHub + Render — خطوات كاملة (مجاني 100%، بلا بطاقة)

> المشروع **جاهز ومُلتزم في git** محليًا — كل ما تحتاجه: حساب GitHub + حساب Render (بريد فقط).

## الخطوة 1: حساب GitHub (إن لم يكن لديك)
1. اذهب إلى https://github.com/signup — سجّل بالبريد فقط (لا بطاقة)
2. تأكد من بريدك

## الخطوة 2: إنشاء المستودع ورفع المشروع
1. اضغط **New repository** في GitHub
2. الاسم: `meloverse` — **Public** — لا تضع علامة على أي خيارات تهيئة (README/gitignore فارغ)
3. اضغط **Create repository**
4. ستظهر لك صفحة بأوامر — انسخ أمرّي `git remote add` و `git push` من القسم الذي يبدأ بـ:
   ```
   git remote add origin https://github.com/<اسمك>/meloverse.git
   ```
5. نفّذهما على هذا الجهاز (أخبرني وستكون الأوامر جاهزة، أو نفّذهما بنفسك):
   ```bash
   cd ~/.accio/accounts/1781857742/agents/DID-82AD6B-5682AD6BU1786883-9085-7C24FA/project
   git remote add origin https://github.com/<اسمك>/meloverse.git
   git push -u origin master
   ```
   (سيطلب اسم المستخدم وكلمة مرور/Token — الأسهل: من GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) مع صلاحية `repo`، واستخدمه ككلمة مرور)

## الخطوة 3: حساب Render وإنشاء الخدمة
1. https://render.com → Sign up → **GitHub** (سجّل الدخول بحسابك)
2. من اللوحة: **New +** → **Blueprint** → اختر مستودع `meloverse`
3. Render سيجد ملف `render.yaml` تلقائيًا وينشئ الخدمة بنفسه
4. اضغط **Apply** → انتظر 2-5 دقائق للبناء والنشر

## الخطوة 4: رابطك الدائم
- بعد النشر ستجد رابطًا مثل: `https://meloverse.onrender.com`
- **هذا هو الرابط الثابت** — يعمل 24/7 حتى لو أغلقت جهازك
- جرّبه: افتح الرابط → الرئيسية، الأدمن (`/admin.html`)، الأنمي (`/api/anime/trending`)

## ملاحظات مهمة
- **البيانات**: Render يرفّق قرصًا (1GB) لمجلد `web/data` (حسب render.yaml) — مستخدموك وفهرسك محفوظان
- **الأدمن**: حساب `admin/admin123` — **غيّر كلمة المرور فورًا**
- **تحديث الـ APK بعد النشر**: غيّر `SERVER_URL` في `android/app/build.gradle.kts` إلى رابط Render ثم أعد البناء (أخبرني وسأبنيه لك)
- **المجدول يعمل**: السحب اليومي 100 + تتبع الفصول كل 30 دقيقة — تلقائيًا على Render
- **كلمة مرور keystore**: غير مرفوعة في git (محفوظة محليًا) — للبناء من جهاز آخر أرسلها لي بشكل آمن

## رابط التشغيل الحالي (نفق مؤقت — حتى النشر الدائم)
https://vegetables-cruz-historic-trailer.trycloudflare.com
