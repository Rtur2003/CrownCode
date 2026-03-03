# CrownCode - Kesin Proje Kurallari

## 1) Temel Ilke
- Mevcut kod yapisini bozma, mevcut mimariye uy.
- Dokuman + kod senkronu zorunlu: route, script, workflow degisikligi dokumana da yansir.
- Refactor yaparken eski/kullanilmayan dosya birakma.

## 2) Dosya Organizasyonu
### Frontend
- Ana uygulama: `platform/`
- Sayfalar: `platform/pages/`
- Bilesenler: `platform/components/`
- Hooklar: `platform/hooks/`
- Cevri dosyalari: `platform/locales/tr.json`, `platform/locales/en.json`
- Stiller: `platform/styles/`

### Backend
- Bu workspace icinde aktif backend kodu `hf-crowncode-backend/` altindadir.
- `backend/` adli root klasoru varsayilmaz.

## 3) Kod Kurallari
- TypeScript strict kurallari korunur.
- `any` kullanma; tipleri tanimla.
- Hardcoded metin yazma; i18n anahtari kullan.
- Kisa, amaca donuk yorum yaz; gereksiz yorum ekleme.
- Islevsiz TODO birakma; gorev dosyasina tasi.

## 4) CSS ve UI Kurallari
- Global stil `platform/styles/globals.css` ve alt importlari ile yonetilir.
- Sayfa ozel stiller icin CSS module tercih edilir.
- Ayni sayfa icin duplicate stil dosyasi tutma.

## 5) Refactor ve Temizlik Protokolu
1. Yeni yapiyi uygula.
2. Import/export referanslarini guncelle.
3. Kullanilmayan dosyalari sil.
4. Lint ve type-check calistir.
5. Dokumanlari guncelle.

## 6) Dogrulama Komutlari
Root:
- `npm run lint`
- `npm run type-check`

Platform:
- `npm --prefix platform run lint`
- `npm --prefix platform run type-check`

## 7) PR Hazirlik Kontrolu
- Kod degisikligi ve dokuman degisikligi tutarli mi?
- Kaldirilan/degisen route veya scriptler dokumana yansidi mi?
- Gereksiz dosya kaldi mi?
- Lint ve type-check temiz mi?

## 8) Yasaklar
- Mevcut olmayan dizinlere bagli script eklemek.
- Projede aktif olmayan mimariyi "aktifmis" gibi dokumante etmek.
- Eski marka/adlandirma (DevForge vb.) ile yeni kodu karistirmak.
