# CrownCode Analysis Report - Tur 4 (2026-03-04)

## Scope

- Bu turda sadece kontrol + analiz yapildi.
- Kod degisikligi yapilmadi.
- Hedef: Claude tarafinda yeni uygulama turunu netlestirmek.

## Independent Verification

- `git status --short` temiz.
- `cmd /c npm --prefix platform run lint` -> PASS
- `cmd /c npm --prefix platform run type-check` -> PASS
- `cmd /c npm --prefix platform test -- --runInBand` -> PASS
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> PASS
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> PASS
- `cmd /c npm --prefix platform run build` (default) -> PASS

Not:
- Server ve static build ayni anda paralel calistirilinca `.next` dizininde cakisma olup yalanci prerender hatasi olusuyor.
- CI zaten ayri joblarda calistirdigi icin bu risk CI tarafinda dusuk, lokal dogrulamada komutlar sirali kosulmali.

## Findings (Priority Order)

### P1 - Error Semantics UI Regression

1. `unsupportedSource` backend/gateway/types/locale tarafinda eklendi ama UI error resolver buna case eklemedi.
- Kanit: `platform/hooks/analysisGateway.ts:63` (`unsupported_source` -> `unsupportedSource`)
- Kanit: `platform/hooks/analysisTypes.ts:59` (`unsupportedSource` error code mevcut)
- Kanit: `platform/locales/en.json:324` (`unsupportedSource` metni mevcut)
- Kanit: `platform/locales/tr.json:324` (`unsupportedSource` metni mevcut)
- Kanit: `platform/pages/ai-music-detection/index.tsx:118` (switch var ama `unsupportedSource` case'i yok)

Etkisi:
- Desteklenmeyen source hatasi generic mesaja dusuyor, spesifik locale mesaji gosterilmiyor.

### P2 - Deployment Narrative Drift in Technical Docs

1. Bazi teknik dokumanlar "mevcut durum static export" varsayimini mutlak ifade ediyor.
- Kanit: `docs/technical/MIGRATION_PLAN_2026.md:18`
- Karsit kanit:
  - `platform/next.config.js:2` (default `DEPLOYMENT_TARGET=server`)
  - `.env.example:18` (`DEPLOYMENT_TARGET=server`)
  - `platform/.env.example:17` (`DEPLOYMENT_TARGET=server`)

Etkisi:
- Yeni ekip uyesi "runtime API yok" varsayimiyla yanlis karar alabilir.

### P3 - Contract Wording Ambiguity

1. Kontrat netlesmis olsa da parity checklist ifadesi hala "either backend" gibi genis yorumlanabilir.
- Kanit: `docs/BACKEND_CONTRACT.md:97`
- Baglam:
  - `/api/analyze` HF backend endpointi.
  - Core backend path'i `/api/youtube/analyze`.

Etkisi:
- Dokusal olarak yanlis uygulama alani secilebilir.

### P3 - Test Coverage Gap (Regression Risk)

1. Yeni eklenen `unsupportedSource` akisi icin hedefli test yok.
- Kanit: `platform/__tests__/pages/smoke.test.tsx:1` (yalniz smoke)
- Kanit: `platform/pages/ai-music-detection/index.tsx:114` (error resolver logic)

Etkisi:
- Error mapping degisiklikleri yeniden sessizce bozulabilir.

## Claude Uygulama Plani (Tur 4)

### Faz 0 - P1 Functional Fix

- `platform/pages/ai-music-detection/index.tsx`
  - `resolveErrorMessage` icine `unsupportedSource` case'i ekle.
  - Donus tipi `AnalysisErrorCode | null` olacak sekilde netlestir.

Kabul kriteri:
- `unsupportedSource` geldiginde locale'deki ozel mesaj gosterilir.

### Faz 1 - P2/P3 Documentation Alignment

- `docs/technical/MIGRATION_PLAN_2026.md`
  - "mevcut durum" bolumunu dual-mode gercegiyle guncelle (default server + static deploy pipeline).
- `docs/BACKEND_CONTRACT.md`
  - Parity checklist dilini endpoint sahipligine gore netlestir.

Kabul kriteri:
- Dokumanlar runtime gercegi ile celismez.

### Faz 2 - Regression Tests

- `platform` testlerine en az bir hedefli unit/integration test ekle:
  - `unsupportedSource` hata kodu -> dogru i18n hata mesaji.
- Mümkunse `analysisGateway` mapping icin ayri test ekle.

Kabul kriteri:
- Bu akista gelecekteki regression CI'da yakalanir.

## Validation Commands (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`

