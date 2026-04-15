# YouTube Bot Koruması — Cookies Kurulumu (HF Space)

Kullanıcı "**YouTube oturum doğrulaması istedi. Tarayıcı çerezleri veya cookies.txt dosyası ayarlayıp tekrar deneyin**" hatası alıyorsa backend'e YouTube cookies vermek gerekir.

Backend (`hf-crowncode-backend/app/services/youtube_downloader.py`) zaten üç kaynaktan cookie okuyor:

| Env değişkeni | Ne işe yarar |
|---|---|
| `YOUTUBE_COOKIES_BASE64` | Base64-encoded cookies.txt (HF Space için en kolay) |
| `YOUTUBE_COOKIES_FILE` | Diskte duran bir cookies.txt dosyasının yolu |
| `YOUTUBE_COOKIES_FROM_BROWSER` | `chrome`, `firefox`, `edge`… gibi isim — browser profilinden okur |

HF Spaces'te dosya sistemi kısıtlı ve browser yok, bu yüzden **`YOUTUBE_COOKIES_BASE64`** en pratik yoldur.

---

## Adım 1 — Tarayıcıda cookies.txt çıkar

1. Chrome/Firefox'ta `youtube.com`'a kendi hesabınla **giriş yap**.
2. Şu eklentilerden birini yükle:
   - Chrome: **"Get cookies.txt LOCALLY"**
   - Firefox: **"cookies.txt"**
3. youtube.com sekmesindeyken eklenti ikonuna tıkla → **Export** → `cookies.txt` indir.

> Not: Eklenti `Netscape HTTP Cookie File` formatında dosya verir — yt-dlp bunu bekler.

---

## Adım 2 — Base64'e çevir

**Linux/macOS:**
```bash
base64 -w 0 cookies.txt > cookies.b64
cat cookies.b64  # kopyala
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cookies.txt")) | Set-Clipboard
```

---

## Adım 3 — HF Space'e secret ekle

1. HF Space → **Settings** sekmesi
2. **Variables and secrets** → **New secret**
3. Name: `YOUTUBE_COOKIES_BASE64`
4. Value: base64 içeriği yapıştır
5. **Save** → Space **otomatik yeniden başlar**

---

## Adım 4 — Test et

Platform'da `/ai-music-detection` sayfasında URL sekmesinden bir YouTube linki dene. Backend log'larda şu satırı görmelisin:

```
Using cookie file for YouTube authentication
```

Hâlâ hata veriyorsa cookies süresi dolmuş olabilir — **Adım 1'i tekrarla**. YouTube cookies tipik olarak 30–60 günde bir yenilenmesi gerekir.

---

## Alternatif: Geçici olarak URL sekmesini kapatmak

Eğer cookies yönetmek istemiyorsan, kullanıcıları dosya yükleme veya mikrofon sekmesine yönlendirebilirsin — UI'da zaten uyarı banner'ı var ve default tab `file` olarak ayarlandı.

---

## Uzun vadeli: PO Token desteği (2026+)

YouTube artık **PO Token** (Proof of Origin) denilen ek bir doğrulama katmanı istiyor. Cookies tek başına yetmezse şu plugin'i `requirements.txt`'e eklemek gerekir:

```
bgutil-ytdlp-pot-provider
```

Bu plugin background'da `pot` server çalıştırır ve yt-dlp'ye token sağlar. Kurulum: https://github.com/Brainicism/bgutil-ytdlp-pot-provider

Şu an için cookies + player_client rotation (android/ios/tv) çoğu video için yeterli.
