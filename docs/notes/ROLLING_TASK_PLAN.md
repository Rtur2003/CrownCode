# Rolling Task Plan (Gecici)

> Amac: Bu dosya kalici referans degil, dongusel gorev panosudur.
> Kural: Her yeni gorev turunda icerik tamamen temizlenir ve yeniden yazilir.
> Son Gecerlilik Tarihi: **31 Aralik 2026**
> Bu tarihten sonra islem: **dosyayi sil veya tarihi guncelleyip yeni tur baslat**.

## Yenileme Protokolu

1. Once mevcut maddeleri tamamlandi/iptal olarak kapat.
2. Dosya icerigini tamamen temizle.
3. Yeni tur icin sadece guncel gorevleri ekle.
4. Gerekirse "Son Gecerlilik Tarihi"ni ileri al.

## Tur Durumu

- Son guncelleme: **4 Mart 2026**
- Mod: Faz bazli ilerleme + APEI protokolu
- Tur: Sonraki Analiz Turu (Tur 2)

## Mimari Not

Iki backend aktif:

- `backend/` = core (minimal FastAPI: health + youtube analysis) — bu repoda
- `hf-crowncode-backend/` = advanced (full FastAPI: commend, data processing, analyze, preview model) — ayri repo, `.gitignore` satirinda

CI/dependabot/CODEOWNERS sadece `backend/` hedefliyor. `hf-crowncode-backend/` kendi yasam dongusune sahip.
Kontrat spesifikasyonu: `docs/BACKEND_CONTRACT.md`

---

## Bu Turun Gorevleri (Tur 2)

### Faz 0 - Build ve CI Stabilizasyonu (P0)

- [x] `next.config.js`: default `DEPLOYMENT_TARGET` `static` → `server` olarak degistirildi.
- [x] `ci.yml`: server build (varsayilan) + static build (ayri job) olarak ayrildi.
- [x] Deploy job `build-static` artifact'indan cekilmesi icin guncellendi.

### Faz 1 - Dual-Backend Parity Yonetisimi (P0)

- [x] `dependabot.yml`: gitignored `hf-crowncode-backend` pip entry kaldirildi, yorum eklendi.
- [x] `CODEOWNERS`: gitignored `hf-crowncode-backend/` entry'leri kaldirildi, yorum eklendi.
- [x] `engineering-standards.yml`: olu `hf-crowncode-backend/` grep referanslari temizlendi.
- [x] `docs/BACKEND_CONTRACT.md`: API kontrat spesifikasyonu olusturuldu (analyze endpoint, response shape, parity checklist).

### Faz 2 - Guvenlik ve Kontrat Parity (P0-P1)

- [x] `backend/app/services/url_parser.py`: `"youtube.com" in host` substring → exact-host set lookup duzeltildi.
- [x] `hf-crowncode-backend/app/routes/analyze.py`: `AnalysisResult` modeline `analysisMode` field eklendi (Literal["production", "preview"]).
- [x] `hf-crowncode-backend/app/routes/analyze.py`: youtube ve file response builder'lara `analysisMode` degeri eklendi.
- [x] `platform/hooks/analysisGateway.ts`: backend `analysisMode` donmezse `decisionSource`'dan runtime normalizer eklendi.

### Faz 3 - i18n ve Icerik Tutarliligi (P1)

- [x] `platform/locales/en.json`: duplicate `disclaimer` key (satir 553 ve 565) — ilk kopya kaldirildi.
- [x] tr/en locale key parity dogrulandi — tum anahtarlar eslesik.
- [x] Hardcoded fallback'ler incelendi — hepsi mevcut locale anahtarlarina karsilik gelen defensive `||` pattern'leri, gercek i18n ihlali yok.

### Faz 4 - Dokuman ve Operasyon Senkronu (P2)

- [x] `docs/technical/MOBILE_RESPONSIVE_DESIGN.md`: stale `/projects/*` import yollari guncellendi.
- [x] `docs/technical/PLATFORM_GITHUB_CONFIG.md`: stale `/projects/*` CODEOWNERS ve dependabot ornekleri kaldirildi.
- [x] `backend/requirements.txt`: olusturuldu (fastapi, pydantic, uvicorn, httpx, yt-dlp).

---

## Siradaki Adim

Crown Fortune Hata Duzeltme Paketi:
1. PNG mirror duzeltmesi (offscreen clone)
2. Cark aci matematigi duzeltmesi
3. i18n fallback temizligi

## Tamamlananlar (Log)

### Tur 1 (2026-03-04)

- [x] Faz 0: Makefile dual backend, dependabot `/projects/*` temizlendi, CODEOWNERS guncellendi, workflow izleme eklendi.
- [x] Faz 1: URL exact-host, CORS wildcard+credentials fix, audio camelCase alias, fortune counter feature flag, analysisMode field.
- [x] Faz 2: AI Detection preview badge, Crown Dreams demo badge, fortune counter feature flag.
- [x] Faz 3: sw.js DevForge→CrownCode, tailwind legacy utility, version endpoint dinamik, olu kod temizligi.
- [x] Ek: Crown Fortune hata duzeltme paketi (PNG mirror, cark acisi, i18n fallback).

### Tur 2 (2026-03-04)

- [x] Faz 0: next.config.js server default, ci.yml split build. lint/tsc/build temiz.
- [x] Faz 1: hf-crowncode-backend dead refs temizlendi, BACKEND_CONTRACT.md olusturuldu.
- [x] Faz 2: core URL parser exact-host, HF analysisMode field, gateway normalizer. lint/tsc/build temiz.
- [x] Faz 3: duplicate disclaimer key, locale parity verified.
- [x] Faz 4: stale /projects/* doc refs, core backend requirements.txt.
