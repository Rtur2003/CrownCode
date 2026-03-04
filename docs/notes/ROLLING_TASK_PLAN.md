# Rolling Task Plan (Gecici)

> Amac: Bu dosya kalici referans degil, dongusel gorev panosudur.
> Kural: Her yeni turda icerik sifirlanir, sadece aktif tur yazilir.
> Son Gecerlilik Tarihi: **31 Aralik 2026**

## Tur Durumu

- Son guncelleme: **4 Mart 2026**
- Tur: **Tur 4 - Kontrol Sonrasi Yeni Uygulama**
- Mod: Faz bazli ilerleme (P1 -> P3)
- Analiz raporu: `docs/notes/ANALYSIS_REPORT_TUR4_2026-03-04.md`

---

## Bu Turun Gorevleri

### Faz 0 - Kontrol Dogrulama

- [x] Onceki tur commitleri ve dosyalari dogrulandi.
- [x] Bagimsiz kalite komutlari kosuldu (lint, type-check, test, build-server, build-static).
- [x] Yeni analiz raporu olusturuldu.

### Faz 1 - P1 Functional Fix

- [ ] `platform/pages/ai-music-detection/index.tsx` icinde `unsupportedSource` hata case'i eklenecek.
- [ ] Error resolver tipi `AnalysisErrorCode | null` olarak netlestirilecek.
- [ ] Desteklenmeyen source durumunda generic degil locale ozel mesaj gosterilecek.

### Faz 2 - P2/P3 Dokuman Senkronu

- [ ] `docs/technical/MIGRATION_PLAN_2026.md` deployment anlatisi dual-mode gercegine gore guncellenecek.
- [ ] `docs/BACKEND_CONTRACT.md` parity checklist endpoint sahipligine gore daha net hale getirilecek.

### Faz 3 - Regression Test Guvencesi

- [ ] `unsupportedSource` hata akisini kapsayan en az bir test eklenecek.
- [ ] Mumkunse `analysisGateway` mapping davranisi testle dogrulanacak.

---

## Zorunlu Dogrulama (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`

Not:
- Build komutlari ayni anda paralel kosulmamali; `.next` uzerinde cakisma olusturabilir.

