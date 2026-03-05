# CrownCode Phase D Analysis (2026-03-05)

## Scope

- Bu fazda sadece analiz yapildi, kod degisikligi yapilmadi.
- Odak: deploy/devex zinciri ve Netlify production incident.
- Kaynak: paylasilan Netlify build logu + repo konfig dosyalari.

## Incident Summary

- Tarih/saat: **5 Mart 2026 16:11 (Europe/Istanbul)**
- Semptom: build basarili, deploy plugin adiminda fail.
- Net hata:
- `@netlify/plugin-nextjs` -> `Your publish directory was not found at: /opt/build/repo/platform/out`

## Root Cause (Confirmed)

1. Netlify config publish dizini statik export dizinine sabitlenmis.
- Kanit: `netlify.toml:4` (`publish = "out"`)

2. Next config default olarak server modda build aliyor; static export sadece env ile aciliyor.
- Kanit: `platform/next.config.js:2` (`DEPLOYMENT_TARGET || 'server'`)
- Kanit: `platform/next.config.js:77` (`isStaticExport` true iken `output: 'export'`)

3. Netlify build env icinde `DEPLOYMENT_TARGET=static` yok.
- Kanit: `netlify.toml:9`-`netlify.toml:12` (env listesinde yok)
- Kanit: logda build sonucunda dynamic route'lar (`ƒ /api/*`) uretilmis; bu server mode oldugunu dogrular.

Sonuc:
- Build `.next` uretir, `out` uretmez.
- Plugin publish path olarak `platform/out` bekledigi icin fail olur.

## Secondary Findings

1. npm engine warninglari deployu durdurmuyor ama devex kirginligi olusturuyor.
- Kanit: `package.json:58`-`package.json:60` (`npm>=10.9.2`)
- Kanit: `platform/package.json:69`-`platform/package.json:71`
- Kanit: logda aktif npm `10.8.2` kalmis (corepack prepare sonrasi bile)

2. Branch/context eslesmesi riskli gorunuyor.
- Kanit: logda `refs/heads/gelistirme` build edilirken context `production`.
- Etki: staging branch production site'e deploy edilebilir.

## Impact

- Production deploy bloklaniyor (exit code 2).
- CI tarafinda build green olsa da runtime deploy red.
- Takimda “build gecti ama deploy patladi” yanilgisi olusuyor.

## Recommendation (Single Track)

**Hedef: Netlify'de server-mode Next runtime kullan (plugin-nextjs ile uyumlu).**

1. `netlify.toml` publish konfigini server-mode ile uyumlu hale getir.
- `publish = "out"` kaldirilacak veya runtime-mode uyumlu publish stratejisine gecilecek.

2. Static-export only beklentisi varsa ayri profile/case olarak tanimlanacak.
- Tek config icinde server default + static publish karmasi kaldirilacak.

3. Netlify UI plugin ayarlari ile repo config tek modele indirgenecek.
- `@netlify/plugin-nextjs` aktifken static publish zorlamasi yapilmayacak.

4. Deploy branch/context policy netlestirilecek.
- `geliştirme` branch production context'e dusmeyecek sekilde rule set.

5. Engine drift azaltilacak.
- Build komutunda npm version pinning fiilen dogrulanacak (uyari seviyesi dusurulecek).

## Claude Task Pack (Phase D - Deploy/Devex)

1. `netlify.toml` server-mode Netlify runtime ile hizalanacak (publish path conflict kaldirilacak).
2. Netlify deploy modeli dokumante edilecek (`server runtime` ana model, `static export` opsiyonel/ayri yol).
3. Branch-context deploy policy yazili hale getirilecek (production hangi branch'ten cikar net kural).
4. npm/corepack command zinciri sadeleştirilip deterministic hale getirilecek.
5. Degisikliklerden sonra Netlify dry-run benzeri yerel dogrulama notu eklenecek.

## Verification Targets (Claude)

- `cmd /c npm --prefix platform run build`
- Netlify yeni deploy logunda:
- publish path hatasi olmamali.
- plugin-nextjs adimi fail etmemeli.
- dynamic routes server-mode beklentisine uygun cikmali.
