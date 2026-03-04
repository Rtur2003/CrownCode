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

## Mimari Not

Iki backend aktif:

- `backend/` = core (minimal FastAPI: health + youtube analysis)
- `hf-crowncode-backend/` = advanced (full FastAPI: commend, data processing, analyze, preview model)

`hf-crowncode-backend/` root `.gitignore`'da ayri repo olarak ignore ediliyor (satir 120).
CI/Makefile sadece `backend/` hedefliyor; `hf-crowncode-backend/` kendi yasam dongusune sahip.

---

## Bu Turun Gorevleri

### Faz 0 - Repo Topolojisi ve Operasyon Senkronu

- [ ] Makefile: `backend/` komutlarini gercek yapiya hizala (`requirements.txt` yok, sadece `app/` var).
- [ ] Makefile: `hf-crowncode-backend` icin ayri target'lar ekle (`*-hf`).
- [ ] `.github/dependabot.yml`: var olmayan `/projects/*` yollarini kaldir, `hf-crowncode-backend` pip ekle.
- [ ] `.github/CODEOWNERS`: var olmayan `/projects/*` bloklarini kaldir, `hf-crowncode-backend/` ekle.
- [ ] `.github/workflows/engineering-standards.yml`: `backend/` yaninda `hf-crowncode-backend/` degisim izleme ekle.
- [ ] ROLLING_TASK_PLAN.md guncelle.

### Faz 1 - Guvenlik ve Fonksiyonel P0 Duzeltmeleri

- [ ] URL dogrulama: substring yerine exact-host kontrolu (frontend + hf backend).
- [ ] CORS: wildcard + credentials kombinasyonunu guvenli hale getir (her iki backend).
- [ ] Audio augmentation: camelCase/snake_case option mapping uyumu.
- [ ] Fortune counter: static export icin feature flag ile netlestirilmesi.

### Faz 2 - Hibrit Preview Urunlestirme

- [ ] Preview/mock kaynaklari UI'da "Demo/Preview" etiketi ile isaretlenecek.
- [ ] Crown Dreams ve Fortune sayac icin "simulated data" bildirimi.
- [ ] AI Detection'da preview vs production mod gorunur olacak.

### Faz 3 - i18n + Legacy Temizlik

- [ ] Hardcoded fallback metinler locale anahtarina tasinacak.
- [ ] `sw.js` DevForge kalintilari ve olmayan route cache hedefleri temizlenecek.
- [ ] `tailwind.config.js` legacy utility adi temizlenecek.
- [ ] `version` endpoint dinamik/gercek surum raporlayacak.
- [ ] Olu kod (`mapBackendResponse`) kaldirilacak.

---

## Siradaki Adim

Faz 0 basliyor.

## Tamamlananlar (Log)

(Yeni tur - henuz tamamlanan yok)
