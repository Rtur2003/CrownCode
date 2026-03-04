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

- [x] `ai-music-detection/index.tsx`: `unsupportedSource` case eklendi, `AnalysisErrorCode` import edildi, resolver tipi `string | null` -> `AnalysisErrorCode | null` duzeltildi.

### Faz 2 - P2/P3 Dokuman Senkronu

- [x] `MIGRATION_PLAN_2026.md`: "static export" anlatisi dual-mode gercegine guncellendi (server default, static Netlify icin).
- [x] `BACKEND_CONTRACT.md`: parity checklist HF backend / ortak olarak ayrildi, endpoint sahipligi netlesti.

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

