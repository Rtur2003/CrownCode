# CrownCode Phase B Analysis (2026-03-04)

## Kapsam

- Bu fazda sadece analiz yapildi, kod degisikligi yapilmadi.
- Incelenen alan: hook + context + modal altyapisi.
- Dosyalar:
- `platform/hooks/*`
- `platform/context/*`
- `platform/components/Search/SearchModal.tsx`
- `platform/components/KeyboardShortcuts/ShortcutsModal.tsx`
- `platform/components/ExternalLink/ExternalLinkWarning.tsx`
- `platform/components/UI/Toast/*`
- `platform/pages/_app.tsx`

## Dogru ve Mantikli Calisan Noktalar

1. `LanguageContext` SSR-safe localStorage kontrolu yapiyor.
- Kanit: `platform/context/LanguageContext.tsx:20`

2. External link domain kontrolu exact + subdomain modelinde.
- Kanit: `platform/components/ExternalLink/ExternalLinkWarning.tsx:29`

3. Toast container `aria-live="polite"` ile duyuru semantigine sahip.
- Kanit: `platform/components/UI/Toast/ToastContainer.tsx:16`

4. Analysis hook tipi ve contract ayrimi net (typed result/error).
- Kanit: `platform/hooks/analysisGateway.ts:22`
- Kanit: `platform/hooks/analysisTypes.ts:44`

## P1 Bulgular (Yuksek)

1. Global keyboard shortcuts input alanlarini dislamiyor.
- Kanit: `platform/hooks/useKeyboardShortcuts.ts:34`
- Kanit: `platform/hooks/useKeyboardShortcuts.ts:61`
- Kanit: `platform/pages/_app.tsx:67`
- Kanit: `platform/pages/_app.tsx:68`
- Etki: form/input/textarea/contenteditable icinde kisayol yakalanip UX bozabilir.
- Oneri:
- `useKeyboardShortcuts` icine target guard ekle (`INPUT`, `TEXTAREA`, `SELECT`, `contenteditable`).
- Istisna gerektiren kisayollar icin `allowInInput` parametresi tanimla.

2. Modal erisilebilirligi eksik (dialog semantics + focus trap + focus return).
- Kanit: `platform/components/Search/SearchModal.tsx:60`
- Kanit: `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:82`
- Kanit: `platform/components/ExternalLink/ExternalLinkWarning.tsx:100`
- Etki: klavye/ekran okuyucu deneyimi zayif, WCAG uyumsuzluk riski.
- Oneri:
- Ortak `ModalPrimitive` olustur (`role="dialog"`, `aria-modal`, `aria-labelledby`).
- Focus trap + ESC + focus-return standardi tek yerden yonetilsin.

3. Asenkron analiz hooklarinda cancel/race korumasi yok.
- Kanit: `platform/hooks/useYouTubeAnalysis.ts:205`
- Kanit: `platform/hooks/useFileAnalysis.ts:188`
- Kanit: `platform/hooks/useCommend.ts:121`
- Kanit: `platform/hooks/useCommend.ts:166`
- Etki: hizli ard arda isteklerde stale response yeni state'i ezebilir; unmount sonrasi state set riski.
- Oneri:
- `AbortController` + `requestId` guard modeli ekle.
- Son aktif istek disindakileri ignore et.

## P2 Bulgular (Orta)

1. i18n fallback/hardcoded metinler hook/modal katmaninda devam ediyor.
- Kanit: `platform/hooks/useSearch.ts:31`
- Kanit: `platform/hooks/useSearch.ts:57`
- Kanit: `platform/components/Search/SearchModal.tsx:77`
- Kanit: `platform/hooks/useCopyToClipboard.ts:31`
- Kanit: `platform/hooks/useCopyToClipboard.ts:65`
- Kanit: `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:95`
- Etki: dil parity bozuluyor, lokalizasyon borcu artiyor.
- Oneri:
- locale key zorunlulugu + fallback string temizligi.
- `search` ve `shortcuts` icin parity test eklensin.

2. ShortcutsModal iki farkli keydown listener bagliyor; biri no-op.
- Kanit: `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:50`
- Kanit: `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:53`
- Etki: gereksiz global listener maliyeti.
- Oneri:
- `formatShortcut` utility fonksiyonunu hook disina tasiyip no-op listener'i kaldir.

3. `useScrollAnimation` observer yonetimi optimize degil.
- Kanit: `platform/hooks/useScrollAnimation.ts:50`
- Kanit: `platform/hooks/useScrollAnimation.ts:52`
- Etki: gereksiz re-subscribe ve observer lifecycle karmasasi.
- Oneri:
- cleanup'ta `disconnect()`.
- `hasTriggered` dependency etkisini azaltacak stabil pattern kullan.

4. `useIsMobile` icinde legacy `msMaxTouchPoints` icin `ts-ignore` var.
- Kanit: `platform/hooks/useIsMobile.ts:48`
- Kanit: `platform/hooks/useIsMobile.ts:88`
- Etki: tip hijyeni zayif, teknik borc.
- Oneri:
- typed feature-detection helper yaz ve `ts-ignore` kaldir.

## P3 Bulgular (Dusuk)

1. `AnimatePresence` ile exit animasyonlari Search/Shortcuts modallarinda pratikte devre disi.
- Kanit: `platform/components/Search/SearchModal.tsx:56`
- Kanit: `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:78`
- Etki: kod karmasasi, beklenen animasyon davranisi yok.
- Oneri:
- Erken return yerine conditional render'i `AnimatePresence` icinde yonet.

2. Toast auto-dismiss timeout'lari context seviyesinde izlenmiyor.
- Kanit: `platform/context/ToastContext.tsx:54`
- Etki: buyuk olcekte timeout birikimi/gozlenebilirlik zorlugu.
- Oneri:
- timeout registry/ref ile cleanup standardi.

## Claude Icin Uygulama Sirasi

1. P1:
- keyboard shortcut input-guard + modal a11y primitive + async cancel/race korumasi.

2. P2:
- i18n fallback temizligi + shortcuts listener sadeleme + scroll observer cleanup.

3. P3:
- animate presence cleanup + toast timeout housekeeping.

4. Dogrulama:
- `npm --prefix platform run lint`
- `npm --prefix platform run type-check`
- `npm --prefix platform test -- --runInBand`
- `DEPLOYMENT_TARGET=server npm --prefix platform run build`
- `DEPLOYMENT_TARGET=static npm --prefix platform run build`
