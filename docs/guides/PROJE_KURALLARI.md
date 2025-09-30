# 🎯 DevForge Suite - KESİN PROJE KURALLARI

## 📋 1. PROJE DOSYALARINA UYUM SAĞLA

### ✅ Yapılması Gerekenler:
- Mevcut proje yapısına %100 uyum sağla
- Gelişmiş versiyon yapabilirsin AMA kesinlikle dışına çıkma
- Belgelenen tüm spesifikasyonlara uy
- GitHub repository linklerini doğru kullan

### ❌ Yapılmaması Gerekenler:
- Proje dışı teknoloji ekleme
- Dokümante edilmemiş özellik ekleme
- Kendi yorumunla değiştirme

---

## 📂 2. MODÜLER DOSYA YAPISI

### ✅ Her Modül Ayrı Olmalı:

#### CSS Dosyaları:
```
styles/
├── base/                    # Temel stiller
│   ├── variables.css       # CSS değişkenleri
│   ├── reset.css           # Reset stilleri
│   ├── typography.css      # Tipografi
│   └── animations.css      # Animasyonlar
├── components/             # Komponent stilleri
│   ├── header.css         # Header komponenti CSS
│   ├── hero.css           # Hero section CSS
│   ├── projects.css       # Projeler section CSS
│   └── mobile-navigation.css # Mobil nav CSS
└── utilities/              # Yardımcı sınıflar
    └── helpers.css        # Helper sınıfları
```

#### TSX Komponentleri:
```
components/
├── Layout/                 # Layout komponentleri
│   ├── MainLayout.tsx     # Ana layout
│   ├── Header.tsx         # Header komponenti
│   ├── Footer.tsx         # Footer komponenti
│   └── MobileNavigation.tsx # Mobil navigasyon
├── Home/                  # Ana sayfa komponentleri
│   ├── HeroSection.tsx    # Hero bölümü
│   ├── ProjectsSection.tsx # Projeler bölümü
│   ├── FeaturesSection.tsx # Özellikler bölümü
│   └── StatsSection.tsx   # İstatistikler bölümü
└── Navigation/            # Navigasyon komponentleri
    └── ProjectDropdown.tsx # Proje dropdown
```

### 📝 Başlıklarla Belirtme:
Her dosyada şu başlık olmalı:
```css
/* [Komponent Adı] Component Styles */
/* Bu dosya [nerede kullanıldığı] için kullanılır */
```

```tsx
/**
 * [Komponent Adı] Component
 * Kullanım: [nerede kullanıldığı]
 * Bağımlılıklar: [hangi dosyalara bağlı]
 */
```

---

## 🔗 3. DOSYA BAĞLANTILARI KONTROLÜ

### ✅ Kontrol Edilmesi Gerekenler:

#### Import/Export Kontrolü:
- Her import doğru dosyayı işaret ediyor mu?
- Kullanılmayan import var mı?
- Export edilen şeyler kullanılıyor mu?

#### CSS Import Kontrolü:
```css
/* globals.css içinde */
@import './components/header.css';     ✅ KULLANILIYOR
@import './components/hero.css';       ✅ KULLANILIYOR
@import './components/old-style.css';  ❌ SİLİNMELİ
```

#### TypeScript Path Kontrolü:
```typescript
// tsconfig.json paths kontrolü
"@/components/*": ["./components/*"]   ✅ DOĞRU
"@/styles/*": ["./styles/*"]           ✅ DOĞRU
```

---

## ⚠️ 4. ÇAKIŞMA ÖNLEME

### 🗑️ ESKİ DOSYA TEMİZLİĞİ:

#### Yeni Dosya Oluşturma Kuralı:
1. Yeni dosya oluştur
2. İçeriği taşı
3. **ESKİ DOSYAYI SİL**
4. Import/export linklerini güncelle
5. Test et

#### Çakışma Kontrol Listesi:
- [ ] Aynı isimde iki dosya yok
- [ ] Aynı CSS sınıfı iki yerde tanımlı değil
- [ ] Aynı komponent iki yerde export edilmiyor
- [ ] Kullanılmayan dosya kalmamış

### 📝 Dosya Silme Protokolü:
```bash
# 1. Dosyanın kullanımını kontrol et
grep -r "dosya-adi" .

# 2. Eğer kullanılmıyorsa sil
rm dosya-adi

# 3. Git'ten de kaldır
git rm dosya-adi
```

---

## 🔍 5. KONTROL LİSTESİ

### Her Değişiklik Sonrası Yapılacaklar:

#### ✅ Dosya Yapısı Kontrolü:
- [ ] Her modül ayrı dosyada
- [ ] CSS ve TSX ayrı
- [ ] Başlıklar doğru yazılmış
- [ ] Gereksiz dosya kalmamış

#### ✅ Bağlantı Kontrolü:
- [ ] Tüm import'lar doğru
- [ ] Kullanılmayan import yok
- [ ] Path'ler çalışıyor
- [ ] CSS import'ları doğru

#### ✅ Çakışma Kontrolü:
- [ ] Duplicate dosya yok
- [ ] Duplicate CSS sınıfı yok
- [ ] Duplicate komponent yok
- [ ] Kullanılmayan kod yok

#### ✅ Proje Uyumu:
- [ ] Dokümantasyona uygun
- [ ] GitHub links doğru
- [ ] Teknoloji stack'i doğru
- [ ] Modüler yapıda

---

## 🚨 UYARI: Bu kurallardan sapma yapmak YASAK!

### Kural İhlali Örnekleri:
❌ CSS'i TSX gibi dosyaları bir dosyada oluşturma
❌ Tek dosyada birden fazla komponent
❌ Eski dosyaları silmeme
❌ Import'ları kontrol etmeme
❌ Proje dışı teknoloji ekleme

### Doğru Yaklaşım:
✅ Her modül ayrı dosya
✅ CSS ayrı dosyalar
✅ Eski dosyaları sil
✅ Import'ları kontrol et
✅ Proje kurallarına uy

Bu kurallar **KESİN** ve **DEĞİŞMEZ**dir!