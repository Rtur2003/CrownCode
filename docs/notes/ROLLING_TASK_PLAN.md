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

- [x] `PLATFORM_GITHUB_CONFIG.md`: repo agaci, workflow bolumu, labeler guncellendi. Phantom `platform-ci.yml`, `project-ci.yml`, `projects/` kaldirildi.
- [x] `MOBILE_RESPONSIVE_DESIGN.md`: `/projects` nav ornegi `/ai-music-detection` olarak guncellendi.
- [x] `PROJECT_ROUTING_SYSTEM.md`: deployment default `static` -> `server` guncellendi.
- [x] `.env.example` + `platform/.env.example`: `DEPLOYMENT_TARGET=static` -> `server` guncellendi.

### Faz 2 - Kontrat ve Hata Semantigi (P1)

- [x] `BACKEND_CONTRACT.md`: `/api/analyze` sadece HF backend'e ait oldugu netlesti, core backend endpoint bilgisi eklendi.
- [x] `analysisGateway.ts`: `unsupported_source` -> `unsupportedSource` (yeni code) olarak duzeltildi.
- [x] `analysisTypes.ts`: `unsupportedSource` error code eklendi.
- [x] `en.json` + `tr.json`: `unsupportedSource` hata mesaji eklendi, locale parity dogrulandi.

### Faz 3 - Workflow Tutarliligi ve Hijyen (P2)

- [x] `engineering-standards.yml`: "either core or HF backend" yorumu -> "core backend" olarak duzeltildi.
- [x] `ci.yml`: lighthouse job'a `npx serve` + `wait-on` adimlari eklendi, localhost URL'leri artik sunucu tarafindan karsilaniyor.
- [x] `.gitignore`: `.coverage` eklendi (satir 26).

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
