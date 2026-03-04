# Rolling Task Plan (Gecici)

> Amac: Bu dosya kalici referans degil, dongusel gorev panosudur.
> Kural: Her yeni turda icerik sifirlanir, sadece aktif tur yazilir.
> Son Gecerlilik Tarihi: **31 Aralik 2026**

## Tur Durumu

- Son guncelleme: **4 Mart 2026**
- Tur: **Tur 3 - Analiz Sonrasi Uygulama**
- Mod: Faz bazli ilerleme (P0 -> P2)
- Analiz raporu: `docs/notes/ANALYSIS_REPORT_TUR3_2026-03-04.md`

---

## Bu Turun Gorevleri

### Faz 0 - Plan/Reality Senkronu (P0)

- [x] Kodex analiz raporu olusturuldu ve kanitlarla dosyalandi.
- [x] Tur 2'den kalan yanlis `[x]` durumlari dogrulandi: 3 dokumanda stale `/projects/*` ref, 2 env.example'da stale `static` default, 1 workflow'da stale yorum, `.coverage` untracked.
- [x] Plan dosyasi Tur 3 olarak sifirlanmis, sadece dogrulanmis maddeler `[x]` isaretli.

### Faz 1 - Dokuman Drift Temizligi (P0/P1)

- [ ] `docs/technical/PLATFORM_GITHUB_CONFIG.md` guncel repo yapisina gore yeniden senkronize edilecek.
- [ ] `docs/technical/MOBILE_RESPONSIVE_DESIGN.md` icindeki stale `/projects` ornegi aktif route setine uyarlanacak.
- [ ] `docs/technical/PROJECT_ROUTING_SYSTEM.md` deployment default bilgisi kodla uyumlu hale getirilecek.

### Faz 2 - Kontrat ve Hata Semantigi (P1)

- [ ] `docs/BACKEND_CONTRACT.md` ile gercek backend capability'leri tutarli hale getirilecek.
- [ ] `platform/hooks/analysisGateway.ts` icindeki `unsupported_source -> invalidYouTubeUrl` map'i ayrilacak.
- [ ] `platform/hooks/analysisTypes.ts` ve ilgili locale hata metinleri yeni error code ile parity guncellenecek.

### Faz 3 - Workflow Tutarliligi ve Hijyen (P2)

- [ ] `.github/workflows/engineering-standards.yml` yorumlari gercek `backend/` kontrol davranisiyla hizalanacak.
- [ ] `.github/workflows/ci.yml` lighthouse job icin explicit serving/start strategy eklenecek.
- [ ] `.coverage` icin repo hijyen karari uygulanacak (`.gitignore` veya temizleme stratejisi).

---

## Zorunlu Dogrulama (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`

---

## Notlar

- Bu turda Kodex uygulama degil analiz ve raporlama yapti.
- Claude uygulama bittikce maddeleri `[x]` isaretleyip dosya bazli log eklemeli.
